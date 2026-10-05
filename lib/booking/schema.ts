import { z } from 'zod';
import { CONTACT_SUBJECTS, OCCASIONS, SEATINGS } from './constants';

/**
 * Server-side validation for booking requests. Error messages are machine
 * codes; the form maps them to translated text (Booking.errors.*).
 * The database function re-validates everything — this layer gives fast,
 * field-level feedback.
 */

const phone = z
  .string()
  .trim()
  .regex(/^\+?[0-9 ()./-]{6,32}$/, 'invalid_phone');

export const bookingSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'invalid_date'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'invalid_time'),
  guests: z.coerce.number({ error: 'invalid_party_size' }).int('invalid_party_size').min(1, 'invalid_party_size').max(60, 'invalid_party_size'),
  name: z.string().trim().min(2, 'invalid_name').max(120, 'invalid_name'),
  email: z.string().trim().toLowerCase().email('invalid_email').max(254, 'invalid_email'),
  phone,
  occasion: z.union([z.enum(OCCASIONS), z.literal('')]).optional(),
  seating: z.enum(SEATINGS).default('no_preference'),
  message: z.string().trim().max(1000, 'invalid_message').optional().default(''),
  consent: z.literal('on', { error: 'consent' }),
});

export type BookingInput = z.infer<typeof bookingSchema>;
export type BookingField = keyof BookingInput;

export interface BookingState {
  status: 'idle' | 'error' | 'success';
  /** Field → error code */
  fieldErrors?: Partial<Record<BookingField, string>>;
  /** Form-level error code (closed, too_soon, rate_limited, generic…) */
  formError?: string;
  /** Echo of the submitted values so the form can be re-filled after an error. */
  values?: Partial<Record<BookingField, string>>;
  result?: { reference: string; date: string; time: string; guests: number };
}

export const contactSchema = z.object({
  subject: z.enum(CONTACT_SUBJECTS).default('general'),
  name: z.string().trim().min(2, 'invalid_name').max(120, 'invalid_name'),
  email: z.string().trim().toLowerCase().email('invalid_email').max(254, 'invalid_email'),
  phone: z.union([phone, z.literal('')]).optional(),
  message: z.string().trim().min(10, 'invalid_message').max(4000, 'invalid_message'),
  consent: z.literal('on', { error: 'consent' }),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type ContactField = keyof ContactInput;

export interface ContactState {
  status: 'idle' | 'error' | 'success';
  fieldErrors?: Partial<Record<ContactField, string>>;
  formError?: string;
  values?: Partial<Record<ContactField, string>>;
  email?: string;
}
