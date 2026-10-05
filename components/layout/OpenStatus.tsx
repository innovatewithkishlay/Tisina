'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import type { Locale } from '@/config/locales';
import { formatTime, formatDate } from '@/lib/format';
import { openStatus, type OpenStatus as Status } from '@/lib/hours';
import type { Hours } from '@/types/restaurant';
import { cn } from '@/lib/utils';

/**
 * "Open now · until 23:00". Computed in the restaurant's timezone. The server
 * renders an initial value; the client refreshes it every minute so a cached
 * (ISR) page never shows a stale status.
 */
export function OpenStatus({
  hours,
  timeZone,
  initial,
  className,
}: {
  hours: Hours;
  timeZone: string;
  initial: Status;
  className?: string;
}) {
  const t = useTranslations('Status');
  const locale = useLocale() as Locale;
  const [status, setStatus] = useState<Status>(initial);

  useEffect(() => {
    const update = () => setStatus(openStatus(hours, timeZone));
    update();
    const id = window.setInterval(update, 60_000);
    return () => window.clearInterval(id);
  }, [hours, timeZone]);

  let text: string;
  if (status.state === 'open') text = t('open', { time: formatTime(status.closes, locale) });
  else if (status.state === 'later_today') text = t('laterToday', { time: formatTime(status.opens, locale) });
  else if (status.next)
    text = t('closedNext', {
      day: formatDate(status.next.date, locale, { weekday: 'long' }),
      time: formatTime(status.next.opens, locale),
    });
  else text = t('closed');

  return (
    <p className={cn('label inline-flex items-center gap-2.5', className)} aria-live="polite">
      {/* Open: the dot breathes slowly, like a candle seen through a window. */}
      <span
        aria-hidden="true"
        className={cn(
          'relative inline-block size-1.5 rounded-full',
          status.state === 'open' ? 'breathe bg-[#7fae72] shadow-[0_0_10px_2px_rgb(127_174_114/0.45)]' : status.state === 'later_today' ? 'bg-accent' : 'bg-muted',
        )}
      />
      {text}
    </p>
  );
}
