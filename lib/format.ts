import { intlLocale, type Locale } from '@/config/locales';
import type { IsoWeekday } from '@/types/restaurant';

/**
 * Locale-aware formatting. Uses the browser/Node Intl data, so EUR, HUF and
 * any future currency format correctly ("19 €", "€19", "4 500 Ft").
 */

export function formatPrice(amount: number, currency: string, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale(locale), {
    style: 'currency',
    currency,
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
}

/** "18:30" → locale time string, always 24-hour for European locales. */
export function formatTime(hhmm: string, locale: Locale): string {
  const [h, m] = hhmm.split(':').map(Number);
  if (h === 23 && m === 59) return locale === 'en' ? 'late' : '24:00';
  return new Intl.DateTimeFormat(intlLocale(locale), {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(2000, 0, 1, h, m)));
}

/** "YYYY-MM-DD" (a calendar date, no timezone) → localized date. */
export function formatDate(
  date: string,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
): string {
  const [y, m, d] = date.split('-').map(Number);
  return new Intl.DateTimeFormat(intlLocale(locale), { ...options, timeZone: 'UTC' }).format(
    new Date(Date.UTC(y, m - 1, d)),
  );
}

export function weekdayName(day: IsoWeekday, locale: Locale, style: 'long' | 'short' = 'long'): string {
  // 2024-01-01 was a Monday.
  return new Intl.DateTimeFormat(intlLocale(locale), { weekday: style, timeZone: 'UTC' }).format(
    new Date(Date.UTC(2024, 0, day)),
  );
}

/** "+385 1 4851 290" → "tel:+38514851290" */
export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`;

export function regionName(countryCode: string, locale: Locale): string {
  try {
    return new Intl.DisplayNames([intlLocale(locale)], { type: 'region' }).of(countryCode) ?? countryCode;
  } catch {
    return countryCode;
  }
}
