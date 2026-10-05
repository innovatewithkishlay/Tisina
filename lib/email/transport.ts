import 'server-only';
import nodemailer from 'nodemailer';

/**
 * SMTP transport from environment variables. Credentials are read on the
 * server only and never reach the browser bundle.
 */

let cached: ReturnType<typeof nodemailer.createTransport> | null | undefined;

export function smtpConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_FROM);
}

function transport() {
  if (cached !== undefined) return cached;
  if (!smtpConfigured()) return (cached = null);
  const port = Number(process.env.SMTP_PORT ?? 587);
  cached = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
  return cached;
}

export interface OutgoingEmail {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

export type SendResult = 'sent' | 'failed' | 'skipped';

export async function sendEmail(mail: OutgoingEmail): Promise<SendResult> {
  const t = transport();
  if (!t) return 'skipped';
  try {
    await t.sendMail({ from: process.env.SMTP_FROM, ...mail });
    return 'sent';
  } catch (err) {
    console.error('[email] send failed:', (err as Error).message);
    return 'failed';
  }
}

/** Where notifications go: RESTAURANT_NOTIFICATION_EMAIL, else the public address. */
export function notificationRecipients(fallback: string): string {
  return process.env.RESTAURANT_NOTIFICATION_EMAIL?.trim() || fallback;
}
