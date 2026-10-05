'use client';

import { useRef, useState } from 'react';
import { useInView } from 'motion/react';
import { useCalm } from '@/lib/motion';
import { cn } from '@/lib/utils';

/**
 * Odometer: every digit is a reel that rolls through a full turn before it
 * settles on its value, the rightmost reels a little later. Units and symbols
 * ("48 h", "450°", "34 €") stay still. Server HTML and no-JS show the final
 * value; `play` lets a parent hold it back until, say, its card is centred.
 */
export function Counter({ value, className, play, delay = 0 }: { value: string; className?: string; play?: boolean; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const calm = useCalm();
  const seen = useInView(ref, { once: true, amount: 0.6 });
  // Plays once: when it is on screen and (if given) the parent says so.
  const [done, setDone] = useState(false);
  if (!done && seen && (play ?? true)) setDone(true);
  const run = calm || done;
  const chars = Array.from(value);
  let d = 0;

  return (
    <span ref={ref} className={cn('odo', className)} data-in={run ? '' : undefined} aria-label={value} role="img">
      {chars.map((c, i) => {
        if (!/\d/.test(c)) {
          return (
            <span key={i} aria-hidden="true" className="whitespace-pre">
              {c}
            </span>
          );
        }
        const n = Number(c);
        const order = d++;
        return (
          <span key={i} aria-hidden="true" className="odo-reel">
            <span className="invisible">{c}</span>
            <span
              className="odo-strip"
              style={{
                ['--t' as string]: `${-(10 + n) * 5}%`,
                ['--delay' as string]: `${delay + order * 0.12}s`,
              }}
            >
              {Array.from({ length: 20 }, (_, k) => (
                <span key={k}>{k % 10}</span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}
