import 'server-only';
import type { Locale } from '@/config/locales';
import { siteConfig } from '@/config/site';
import type { Restaurant } from '@/types/restaurant';

/**
 * Transactional email templates. Table-based HTML with inline styles (what
 * email clients actually support), a plain-text alternative, and every
 * user-supplied value HTML-escaped.
 */

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const C = { paper: '#efe9df', card: '#fbf8f3', ink: '#1b1714', muted: '#645a50', line: '#ddd3c4', ember: '#98462a' };

const strings = {
  en: {
    newBooking: 'New booking request', newMessage: 'New message', status: 'Status',
    pending: 'Awaiting your confirmation', date: 'Date', time: 'Time', guests: 'Guests', name: 'Name',
    email: 'Email', phone: 'Phone', occasion: 'Occasion', seating: 'Seating', note: 'Note', reference: 'Reference',
    language: 'Language', subject: 'Subject', message: 'Message', replyHint: 'Reply to this email to answer the guest directly.',
    ackSubject: 'We received your request', ackTitle: 'Thank you — your request is with us.',
    ackBody: 'This is not yet a confirmation. We will confirm your table personally, usually within a few hours.',
    ackChange: 'If your plans change, simply reply to this email.', ackSign: 'See you soon,',
  },
  hr: {
    newBooking: 'Novi upit za rezervaciju', newMessage: 'Nova poruka', status: 'Status',
    pending: 'Čeka vašu potvrdu', date: 'Datum', time: 'Vrijeme', guests: 'Gostiju', name: 'Ime',
    email: 'E-pošta', phone: 'Telefon', occasion: 'Prigoda', seating: 'Mjesto', note: 'Napomena', reference: 'Broj upita',
    language: 'Jezik', subject: 'Tema', message: 'Poruka', replyHint: 'Odgovorite na ovu poruku kako biste izravno odgovorili gostu.',
    ackSubject: 'Zaprimili smo vaš upit', ackTitle: 'Hvala — vaš upit je kod nas.',
    ackBody: 'Ovo još nije potvrda. Stol ćemo osobno potvrditi, obično u roku od nekoliko sati.',
    ackChange: 'Ako vam se planovi promijene, samo odgovorite na ovu poruku.', ackSign: 'Vidimo se uskoro,',
  },
  de: {
    newBooking: 'Neue Reservierungsanfrage', newMessage: 'Neue Nachricht', status: 'Status',
    pending: 'Wartet auf Ihre Bestätigung', date: 'Datum', time: 'Uhrzeit', guests: 'Personen', name: 'Name',
    email: 'E-Mail', phone: 'Telefon', occasion: 'Anlass', seating: 'Sitzwunsch', note: 'Hinweis', reference: 'Anfragenummer',
    language: 'Sprache', subject: 'Betreff', message: 'Nachricht', replyHint: 'Antworten Sie auf diese E-Mail, um dem Gast direkt zu schreiben.',
    ackSubject: 'Wir haben Ihre Anfrage erhalten', ackTitle: 'Danke – Ihre Anfrage ist bei uns.',
    ackBody: 'Dies ist noch keine Bestätigung. Wir bestätigen Ihren Tisch persönlich, meist innerhalb weniger Stunden.',
    ackChange: 'Wenn sich Ihre Pläne ändern, antworten Sie einfach auf diese E-Mail.', ackSign: 'Bis bald,',
  },
  hu: {
    newBooking: 'Új foglalási kérés', newMessage: 'Új üzenet', status: 'Állapot',
    pending: 'Megerősítésre vár', date: 'Dátum', time: 'Időpont', guests: 'Vendégek', name: 'Név',
    email: 'E-mail', phone: 'Telefon', occasion: 'Alkalom', seating: 'Hely', note: 'Megjegyzés', reference: 'Hivatkozási szám',
    language: 'Nyelv', subject: 'Tárgy', message: 'Üzenet', replyHint: 'Válaszoljon erre az e-mailre, hogy közvetlenül a vendégnek írjon.',
    ackSubject: 'Megkaptuk a kérését', ackTitle: 'Köszönjük — megkaptuk a kérését.',
    ackBody: 'Ez még nem megerősítés. Asztalát személyesen erősítjük meg, általában néhány órán belül.',
    ackChange: 'Ha változnak a tervei, egyszerűen válaszoljon erre az e-mailre.', ackSign: 'Hamarosan találkozunk,',
  },
} satisfies Record<Locale, Record<string, string>>;

type Row = [label: string, value: string | undefined | null];

function layout({ restaurant, preheader, eyebrow, title, intro, rows, footerNote }: {
  restaurant: Restaurant;
  preheader: string;
  eyebrow: string;
  title: string;
  intro?: string;
  rows: Row[];
  footerNote?: string;
}): string {
  const rowsHtml = rows
    .filter(([, v]) => v)
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:12px 0;border-top:1px solid ${C.line};font:500 11px/1.4 Helvetica,Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:${C.muted};width:38%;vertical-align:top;">${esc(label)}</td>
          <td style="padding:12px 0;border-top:1px solid ${C.line};font:400 16px/1.5 Georgia,'Times New Roman',serif;color:${C.ink};vertical-align:top;white-space:pre-line;">${esc(value!)}</td>
        </tr>`,
    )
    .join('');

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:${C.paper};">
<span style="display:none!important;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.paper};">
  <tr><td align="center" style="padding:40px 16px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
      <tr><td style="padding:0 4px 28px;font:400 34px/1 Georgia,'Times New Roman',serif;color:${C.ink};letter-spacing:-.01em;">${esc(restaurant.name)}</td></tr>
      <tr><td style="background:${C.card};padding:36px 32px;border:1px solid ${C.line};">
        <p style="margin:0 0 14px;font:500 11px/1.4 Helvetica,Arial,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:${C.ember};">${esc(eyebrow)}</p>
        <h1 style="margin:0 0 18px;font:400 28px/1.2 Georgia,'Times New Roman',serif;color:${C.ink};">${esc(title)}</h1>
        ${intro ? `<p style="margin:0 0 24px;font:400 15px/1.6 Helvetica,Arial,sans-serif;color:${C.muted};">${esc(intro)}</p>` : ''}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rowsHtml}</table>
        ${footerNote ? `<p style="margin:28px 0 0;font:400 14px/1.6 Helvetica,Arial,sans-serif;color:${C.muted};white-space:pre-line;">${esc(footerNote)}</p>` : ''}
      </td></tr>
      <tr><td style="padding:24px 4px 0;font:400 12px/1.7 Helvetica,Arial,sans-serif;color:${C.muted};">
        ${esc(restaurant.name)} · ${esc(restaurant.address.street)}, ${esc(restaurant.address.postalCode)} ${esc(restaurant.address.city)}<br>
        ${esc(restaurant.phone)} · <a href="${esc(siteConfig.siteUrl)}" style="color:${C.muted};">${esc(siteConfig.siteUrl.replace(/^https?:\/\//, ''))}</a>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

const text = (title: string, rows: Row[], extra: string[] = []) =>
  [title, '', ...rows.filter(([, v]) => v).map(([l, v]) => `${l}: ${v}`), '', ...extra].join('\n');

export interface BookingEmailData {
  reference: string;
  name: string;
  email: string;
  phone: string;
  guests: number;
  dateLabel: string;
  timeLabel: string;
  occasion?: string;
  seating?: string;
  message?: string;
  locale: Locale;
}

/** Sent to the restaurant, in the restaurant's default language. */
export function bookingNotification(r: Restaurant, d: BookingEmailData) {
  const s = strings[r.defaultLocale] ?? strings.en;
  const title = `${s.newBooking}: ${d.guests} · ${d.dateLabel} · ${d.timeLabel}`;
  const rows: Row[] = [
    [s.status, s.pending],
    [s.date, d.dateLabel],
    [s.time, d.timeLabel],
    [s.guests, String(d.guests)],
    [s.name, d.name],
    [s.email, d.email],
    [s.phone, d.phone],
    [s.occasion, d.occasion],
    [s.seating, d.seating],
    [s.note, d.message],
    [s.language, d.locale.toUpperCase()],
    [s.reference, d.reference],
  ];
  return {
    subject: `${s.newBooking} — ${d.name}, ${d.guests} · ${d.dateLabel} ${d.timeLabel} [${d.reference}]`,
    html: layout({ restaurant: r, preheader: title, eyebrow: s.newBooking, title: `${d.name}`, intro: s.replyHint, rows }),
    text: text(title, rows, [s.replyHint]),
  };
}

/** Sent to the guest, in the language they booked in. Never says "confirmed". */
export function bookingAcknowledgement(r: Restaurant, d: BookingEmailData) {
  const s = strings[d.locale] ?? strings.en;
  const rows: Row[] = [
    [s.date, d.dateLabel],
    [s.time, d.timeLabel],
    [s.guests, String(d.guests)],
    [s.note, d.message],
    [s.reference, d.reference],
  ];
  return {
    subject: `${s.ackSubject} — ${r.name}`,
    html: layout({
      restaurant: r,
      preheader: s.ackBody,
      eyebrow: s.status + ': ' + s.pending,
      title: s.ackTitle,
      intro: s.ackBody,
      rows,
      footerNote: `${s.ackChange}\n${s.ackSign} ${r.name}`,
    }),
    text: text(s.ackTitle, rows, [s.ackBody, s.ackChange, '', `${s.ackSign} ${r.name}`]),
  };
}

export interface ContactEmailData {
  name: string;
  email: string;
  phone?: string;
  subjectLabel: string;
  message: string;
  locale: Locale;
}

export function contactNotification(r: Restaurant, d: ContactEmailData) {
  const s = strings[r.defaultLocale] ?? strings.en;
  const rows: Row[] = [
    [s.subject, d.subjectLabel],
    [s.name, d.name],
    [s.email, d.email],
    [s.phone, d.phone],
    [s.language, d.locale.toUpperCase()],
    [s.message, d.message],
  ];
  return {
    subject: `${s.newMessage} — ${d.subjectLabel} — ${d.name}`,
    html: layout({ restaurant: r, preheader: d.message.slice(0, 120), eyebrow: s.newMessage, title: d.subjectLabel, intro: s.replyHint, rows }),
    text: text(`${s.newMessage}: ${d.subjectLabel}`, rows, [s.replyHint]),
  };
}
