'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { AnimatePresence, m } from 'motion/react';
import { intlLocale, type Locale } from '@/config/locales';
import { ease } from '@/lib/motion';

const fmt = (timeZone: string, locale: Locale) =>
  new Intl.DateTimeFormat(intlLocale(locale), { timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });

/**
 * The current time at the restaurant. Each digit sits in its own slot and
 * only the ones that change flip — the old figure slides up and out as the
 * new one rises in. Starts from a server value to avoid hydration drift.
 */
export function LocalClock({ timeZone, initial }: { timeZone: string; initial: string }) {
  const locale = useLocale() as Locale;
  const [time, setTime] = useState(initial);
  useEffect(() => {
    const f = fmt(timeZone, locale);
    const tick = () => setTime(f.format(new Date()));
    tick();
    const id = window.setInterval(tick, 5_000);
    return () => window.clearInterval(id);
  }, [timeZone, locale]);

  return (
    <time className="inline-flex tabular-nums" suppressHydrationWarning>
      <span className="sr-only">{time}</span>
      {Array.from(time).map((ch, i) => (
        <span key={i} aria-hidden="true" className="relative inline-block overflow-hidden">
          <span className="invisible">{ch}</span>
          <AnimatePresence initial={false}>
            <m.span
              key={ch}
              className="absolute inset-0 text-center"
              initial={{ y: '100%' }}
              animate={{ y: '0%' }}
              exit={{ y: '-100%' }}
              transition={{ duration: 0.7, ease: ease.inOut }}
            >
              {ch}
            </m.span>
          </AnimatePresence>
        </span>
      ))}
    </time>
  );
}
