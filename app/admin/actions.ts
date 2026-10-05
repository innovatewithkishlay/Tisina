'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { hasLocale } from 'next-intl';
import { routing } from '@/i18n/routing';
import { getRestaurant } from '@/lib/data/restaurant';
import { formatDate, formatTime } from '@/lib/format';
import { sendEmail } from '@/lib/email/transport';
import { bookingDecision, type BookingDecision } from '@/lib/email/templates';
import { getAuthClient, requireAdmin } from '@/lib/supabase/auth';
import { throttle } from '@/lib/rate-limit';

export interface LoginState {
  error?: 'invalid' | 'config' | 'rate_limited';
}

export async function signIn(_prev: LoginState, form: FormData): Promise<LoginState> {
  const parsed = z
    .object({ email: z.string().trim().email().max(254), password: z.string().min(6).max(200) })
    .safeParse({ email: form.get('email'), password: form.get('password') });
  if (!parsed.success) return { error: 'invalid' };
  if (!(await throttle('admin-login', 10))) return { error: 'rate_limited' };

  const client = await getAuthClient();
  if (!client) return { error: 'config' };
  const { error } = await client.auth.signInWithPassword(parsed.data);
  if (error) return { error: 'invalid' };

  const { data: isAdmin } = await client.rpc('is_admin');
  if (!isAdmin) {
    await client.auth.signOut();
    return { error: 'invalid' };
  }
  redirect('/admin');
}

export async function signOut() {
  const client = await getAuthClient();
  await client?.auth.signOut();
  redirect('/admin/login');
}

const decisionSchema = z.object({
  id: z.string().uuid(),
  decision: z.enum(['confirmed', 'declined', 'cancelled', 'pending']),
  note: z.string().trim().max(1000).optional(),
  notify: z.enum(['on']).optional(),
});

export interface DecisionState {
  ok?: boolean;
  error?: string;
  emailed?: 'sent' | 'failed' | 'skipped';
}

/**
 * Confirm, decline, cancel or reopen a booking request. Runs as the signed-in
 * admin (RLS enforces access), then emails the guest in their own language.
 */
export async function decideBooking(_prev: DecisionState, form: FormData): Promise<DecisionState> {
  const { client } = await requireAdmin();
  const parsed = decisionSchema.safeParse({
    id: form.get('id'),
    decision: form.get('decision'),
    note: form.get('note') || undefined,
    notify: form.get('notify') || undefined,
  });
  if (!parsed.success) return { error: 'Invalid request.' };
  const { id, decision, note, notify } = parsed.data;

  const { data: row, error } = await client
    .from('booking_requests')
    .update({ status: decision, admin_note: note ?? null, status_changed_at: new Date().toISOString() })
    .eq('id', id)
    .select('reference, name, email, phone, party_size, booking_date, booking_time, message, locale')
    .single();
  if (error || !row) return { error: 'Could not update this booking. Please reload and try again.' };

  let emailed: DecisionState['emailed'];
  if (notify && decision !== 'pending') {
    const locale = hasLocale(routing.locales, row.locale) ? row.locale : routing.defaultLocale;
    const restaurant = await getRestaurant(locale);
    const time = String(row.booking_time).slice(0, 5);
    const mail = bookingDecision(
      restaurant,
      {
        reference: row.reference,
        name: row.name,
        email: row.email,
        phone: row.phone,
        guests: row.party_size,
        dateLabel: formatDate(row.booking_date, locale),
        timeLabel: formatTime(time, locale),
        message: row.message ?? undefined,
        locale,
      },
      decision as BookingDecision,
      note,
    );
    emailed = await sendEmail({ to: row.email, replyTo: restaurant.email, ...mail });
    await client.from('booking_requests').update({ guest_notified: emailed }).eq('id', id);
  }

  revalidatePath('/admin');
  return { ok: true, emailed };
}

export async function setMessageStatus(form: FormData) {
  const { client } = await requireAdmin();
  const parsed = z
    .object({ id: z.string().uuid(), status: z.enum(['new', 'answered', 'archived']) })
    .safeParse({ id: form.get('id'), status: form.get('status') });
  if (!parsed.success) return;
  await client
    .from('contact_messages')
    .update({ status: parsed.data.status, status_changed_at: new Date().toISOString() })
    .eq('id', parsed.data.id);
  revalidatePath('/admin');
}
