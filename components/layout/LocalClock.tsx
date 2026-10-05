'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { intlLocale, type Locale } from '@/config/locales';

const fmt = (timeZone: string, locale: Locale) =>
  new Intl.DateTimeFormat(intlLocale(locale), { timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });

/** The current time at the restaurant, ticking. Starts from a server value to avoid hydration drift. */
export function LocalClock({ timeZone, initial }: { timeZone: string; initial: string }) {
  const locale = useLocale() as Locale;
  const [time, setTime] = useState(initial);
  useEffect(() => {
    const f = fmt(timeZone, locale);
    const tick = () => setTime(f.format(new Date()));
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, [timeZone, locale]);
  return (
    <time className="tabular-nums" suppressHydrationWarning>
      {time}
    </time>
  );
}
