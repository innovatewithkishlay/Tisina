'use server';

import { getTranslations } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from '@/i18n/routing';
import type { Locale } from '@/config/locales';
import { siteConfig } from '@/config/site';
import { getHours, getRestaurant } from '@/lib/data/restaurant';
import { getAdminClient, getPublicClient } from '@/lib/supabase/server';
import { formatDate, formatTime } from '@/lib/format';
import { bookingSlots } from '@/lib/hours';
import { throttle } from '@/lib/rate-limit';
import { notificationRecipients, sendEmail, type SendResult } from '@/lib/email/transport';
import { bookingAcknowledgement, bookingNotification, contactNotification } from '@/lib/email/templates';
import {
  bookingSchema,
  contactSchema,
  type BookingField,
  type BookingState,
  type ContactField,
  type ContactState,
} from './schema';

/** Codes raised by the database functions that we show to guests as-is. */
const DB_CODES = new Set([
  'invalid_name', 'invalid_email', 'invalid_phone', 'invalid_party_size', 'invalid_message',
  'invalid_datetime', 'closed', 'too_soon', 'too_far', 'booking_disabled', 'rate_limited',
]);

const FIELD_FOR_CODE: Record<string, BookingField> = {
  invalid_name: 'name', invalid_email: 'email', invalid_phone: 'phone',
  invalid_party_size: 'guests', invalid_message: 'message', invalid_datetime: 'time',
};

/** Fallback code per field when zod reports a type error (e.g. a missing field). */
const BOOKING_DEFAULT_CODE: Record<BookingField, string> = {
  date: 'invalid_date', time: 'invalid_time', guests: 'invalid_party_size', name: 'invalid_name',
  email: 'invalid_email', phone: 'invalid_phone', occasion: 'invalid_message', seating: 'invalid_message',
  message: 'invalid_message', consent: 'consent',
};
const CONTACT_DEFAULT_CODE: Record<ContactField, string> = {
  subject: 'invalid_message', name: 'invalid_name', email: 'invalid_email', phone: 'invalid_phone',
  message: 'invalid_message', consent: 'consent',
};
const isCode = (m: string) => /^[a-z_]+$/.test(m);

const randomReference = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b % 32]).join('');

function formValues<K extends string>(form: FormData, keys: readonly K[]): Partial<Record<K, string>> {
  return Object.fromEntries(keys.map((k) => [k, String(form.get(k) ?? '')])) as Partial<Record<K, string>>;
}

const BOOKING_FIELDS = ['date', 'time', 'guests', 'name', 'email', 'phone', 'occasion', 'seating', 'message'] as const;

/**
 * Booking request flow:
 *   validate → store in Supabase (RPC) → notify restaurant → acknowledge guest → success
 * A request counts as received if it was stored OR the restaurant was emailed,
 * so a database outage alone never loses a booking.
 */
export async function submitBooking(_prev: BookingState, form: FormData): Promise<BookingState> {
  const rawLocale = String(form.get('locale') ?? '');
  const locale: Locale = hasLocale(routing.locales, rawLocale) ? rawLocale : routing.defaultLocale;
  const values = formValues(form, BOOKING_FIELDS);

  // Honeypot: real people never fill the hidden "website" field.
  if (String(form.get('website') ?? '') !== '') {
    return { status: 'success', result: { reference: randomReference(), date: values.date ?? '', time: values.time ?? '', guests: Number(values.guests) || 2 } };
  }
  if (!(await throttle('booking'))) return { status: 'error', formError: 'rate_limited', values };

  const parsed = bookingSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    const fieldErrors: BookingState['fieldErrors'] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as BookingField;
      fieldErrors[key] ??= isCode(issue.message) ? issue.message : BOOKING_DEFAULT_CODE[key];
    }
    return { status: 'error', fieldErrors, values };
  }
  const data = parsed.data;

  const [r, hours] = await Promise.all([getRestaurant(locale), getHours()]);
  if (!r.booking.enabled) return { status: 'error', formError: 'booking_disabled', values };
  if (data.guests < r.booking.minParty || data.guests > r.booking.maxParty) {
    return { status: 'error', fieldErrors: { guests: 'invalid_party_size' }, values };
  }
  // Same rules as the database, evaluated in the restaurant's timezone.
  const slots = bookingSlots(hours, r.booking, data.date, r.timezone).flatMap((g) => g.times);
  if (!slots.includes(data.time)) return { status: 'error', formError: 'closed', fieldErrors: { time: 'closed' }, values };

  // 1. Store
  let reference: string | null = null;
  let bookingId: string | null = null;
  const supabase = getPublicClient();
  if (supabase) {
    const { data: rows, error } = await supabase.rpc('create_booking_request', {
      p_restaurant_slug: siteConfig.restaurantSlug,
      p_name: data.name,
      p_email: data.email,
      p_phone: data.phone,
      p_party_size: data.guests,
      p_date: data.date,
      p_time: data.time,
      p_occasion: data.occasion || null,
      p_seating: data.seating,
      p_message: data.message || null,
      p_locale: locale,
    });
    if (error) {
      if (DB_CODES.has(error.message)) {
        const field = FIELD_FOR_CODE[error.message];
        return field
          ? { status: 'error', fieldErrors: { [field]: error.message }, values }
          : { status: 'error', formError: error.message, values };
      }
      console.error('[booking] database insert failed:', error.message);
    } else {
      const row = Array.isArray(rows) ? rows[0] : rows;
      reference = row?.reference ?? null;
      bookingId = row?.id ?? null;
    }
  }
  reference ??= randomReference();

  // 2. Notify the restaurant, 3. acknowledge the guest
  const t = await getTranslations({ locale, namespace: 'Booking' });
  const staffLocale = r.defaultLocale;
  const tStaff = await getTranslations({ locale: staffLocale, namespace: 'Booking' });
  const mail = {
    reference,
    name: data.name,
    email: data.email,
    phone: data.phone,
    guests: data.guests,
    dateLabel: formatDate(data.date, staffLocale),
    timeLabel: formatTime(data.time, staffLocale),
    occasion: data.occasion ? tStaff(`occasions.${data.occasion}`) : undefined,
    seating: data.seating !== 'no_preference' ? tStaff(`seatings.${data.seating}`) : undefined,
    message: data.message || undefined,
    locale,
  };
  const staffEmail = bookingNotification(r, mail);
  const notified: SendResult = await sendEmail({ to: notificationRecipients(r.email), replyTo: data.email, ...staffEmail });

  if (process.env.SEND_GUEST_ACKNOWLEDGEMENT !== 'false') {
    const guestEmail = bookingAcknowledgement(r, {
      ...mail,
      dateLabel: formatDate(data.date, locale),
      timeLabel: formatTime(data.time, locale),
      occasion: data.occasion ? t(`occasions.${data.occasion}`) : undefined,
    });
    await sendEmail({ to: data.email, replyTo: r.email, ...guestEmail });
  }

  // Bookkeeping, only possible with the service role key (server-side).
  const admin = getAdminClient();
  if (admin && bookingId) {
    await admin.from('booking_requests').update({ notification_status: notified }).eq('id', bookingId);
  }

  if (!bookingId && notified !== 'sent') {
    // Neither stored nor delivered: tell the guest honestly.
    return { status: 'error', formError: 'generic', values };
  }

  return { status: 'success', result: { reference, date: data.date, time: data.time, guests: data.guests } };
}

const CONTACT_FIELDS = ['subject', 'name', 'email', 'phone', 'message'] as const;

/** Contact flow: validate → store (RPC) → notify restaurant → success. */
export async function submitContact(_prev: ContactState, form: FormData): Promise<ContactState> {
  const rawLocale = String(form.get('locale') ?? '');
  const locale: Locale = hasLocale(routing.locales, rawLocale) ? rawLocale : routing.defaultLocale;
  const values = formValues(form, CONTACT_FIELDS);

  if (String(form.get('website') ?? '') !== '') return { status: 'success', email: values.email };
  if (!(await throttle('contact'))) return { status: 'error', formError: 'rate_limited', values };

  const parsed = contactSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    const fieldErrors: ContactState['fieldErrors'] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as ContactField;
      fieldErrors[key] ??= isCode(issue.message) ? issue.message : CONTACT_DEFAULT_CODE[key];
    }
    return { status: 'error', fieldErrors, values };
  }
  const data = parsed.data;
  const r = await getRestaurant(locale);

  let messageId: string | null = null;
  const supabase = getPublicClient();
  if (supabase) {
    const { data: id, error } = await supabase.rpc('create_contact_message', {
      p_restaurant_slug: siteConfig.restaurantSlug,
      p_name: data.name,
      p_email: data.email,
      p_message: data.message,
      p_phone: data.phone || null,
      p_subject: data.subject,
      p_locale: locale,
    });
    if (error) {
      if (error.message === 'rate_limited') return { status: 'error', formError: 'rate_limited', values };
      if (error.message.startsWith('invalid_')) {
        const field = error.message.replace('invalid_', '') as ContactField;
        return { status: 'error', fieldErrors: { [field]: error.message }, values };
      }
      console.error('[contact] database insert failed:', error.message);
    } else {
      messageId = (id as string | null) ?? null;
    }
  }

  const tStaff = await getTranslations({ locale: r.defaultLocale, namespace: 'Contact' });
  const email = contactNotification(r, {
    name: data.name,
    email: data.email,
    phone: data.phone || undefined,
    subjectLabel: tStaff(`subjects.${data.subject}`),
    message: data.message,
    locale,
  });
  const notified = await sendEmail({ to: notificationRecipients(r.email), replyTo: data.email, ...email });

  const admin = getAdminClient();
  if (admin && messageId) {
    await admin.from('contact_messages').update({ notification_status: notified }).eq('id', messageId);
  }

  if (!messageId && notified !== 'sent') return { status: 'error', formError: 'generic', values };
  return { status: 'success', email: data.email };
}
