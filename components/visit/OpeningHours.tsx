import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/config/locales';
import { formatDate, formatTime, weekdayName } from '@/lib/format';
import { addDays, weeklyTable, zonedNow } from '@/lib/hours';
import type { Hours } from '@/types/restaurant';
import { pick } from '@/lib/data/restaurant';
import { cn } from '@/lib/utils';

/**
 * Weekly hours set as a typographic list (not a table grid): day, then each
 * service with its times. Split services, closed days and upcoming special
 * dates are all data-driven. "Today" is evaluated in the restaurant timezone.
 */
export async function OpeningHours({
  hours,
  locale,
  timeZone,
  defaultLocale,
  city,
  showSpecial = true,
  className,
}: {
  hours: Hours;
  locale: Locale;
  timeZone: string;
  defaultLocale: Locale;
  city: string;
  showSpecial?: boolean;
  className?: string;
}) {
  const t = await getTranslations({ locale, namespace: 'Hours' });
  const now = zonedNow(timeZone);
  const horizon = addDays(now.date, 75);
  const upcoming = hours.special.filter((s) => s.date >= now.date && s.date <= horizon);

  return (
    <div className={className}>
      <ul className="border-t hairline">
        {weeklyTable(hours).map(({ day, periods }) => {
          const today = day === now.weekday;
          return (
            <li
              key={day}
              className={cn(
                'grid grid-cols-[minmax(7.5rem,auto)_1fr] items-baseline gap-x-6 border-b hairline py-4',
                !periods.length && 'text-muted',
              )}
            >
              <span className="font-display text-[1.375rem] capitalize leading-tight">
                {weekdayName(day, locale)}
                {today ? (
                  <span className="label ml-3 inline-flex translate-y-[-0.2em] items-center gap-1.5 align-middle text-accent">
                    <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
                    {t('today')}
                  </span>
                ) : null}
              </span>
              <span className="flex flex-col gap-1 text-right sm:flex-row sm:flex-wrap sm:justify-end sm:gap-x-6">
                {periods.length ? (
                  periods.map((p) => (
                    <span key={p.opens} className="whitespace-nowrap">
                      <span className="label mr-2 text-muted">{t(`services.${p.service}`)}</span>
                      <span className="tabular-nums">
                        {formatTime(p.opens, locale)}–{formatTime(p.closes, locale)}
                      </span>
                    </span>
                  ))
                ) : (
                  <span className="italic">{t('closed')}</span>
                )}
              </span>
            </li>
          );
        })}
      </ul>

      {showSpecial && upcoming.length > 0 ? (
        <div className="mt-10">
          <h3 className="label text-muted">{t('special')}</h3>
          <ul className="mt-4 space-y-2">
            {upcoming.map((s) => (
              <li key={s.date} className="flex flex-wrap justify-between gap-x-6">
                <span>
                  <span className="capitalize">{formatDate(s.date, locale, { weekday: 'short', day: 'numeric', month: 'long' })}</span>
                  <span className="text-muted"> · {pick(s.label, locale, defaultLocale)}</span>
                </span>
                <span className="tabular-nums">
                  {s.closed || !s.opens ? t('specialClosed') : `${formatTime(s.opens, locale)}–${formatTime(s.closes!, locale)}`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="mt-6 text-small text-muted">{t('timezoneNote', { city })}</p>
    </div>
  );
}
