'use client';

import { useId, useRef, useState, type ReactNode } from 'react';
import { m, useInView, useMotionValue, useMotionValueEvent, useScroll, useSpring, useVelocity } from 'motion/react';
import { useCalm } from '@/lib/motion';
import { cn } from '@/lib/utils';

/**
 * A ring of text that turns slowly, forever. The idle turn is a CSS
 * animation (on the compositor, free while the page loads); scrolling adds a
 * wind-up on top — faster with scroll speed — and the idle turn follows the
 * direction of travel. Several texts can share one ring and cross-fade
 * (`active`). Still under reduced motion.
 */
export function CircularText({
  texts,
  active = 0,
  className,
  children,
  /** Seconds per idle revolution. */
  period = 36,
  textClassName,
}: {
  texts: string[];
  active?: number;
  className?: string;
  children?: ReactNode;
  period?: number;
  textClassName?: string;
}) {
  const id = useId().replace(/:/g, '');
  const ref = useRef<HTMLDivElement>(null);
  const calm = useCalm();
  const visible = useInView(ref);
  const [reverse, setReverse] = useState(false);

  // Scroll wind-up: integrate the (smoothed) scroll velocity into extra turn.
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { stiffness: 60, damping: 30, mass: 0.6 });
  const extra = useMotionValue(0);
  const last = useRef(0);
  useMotionValueEvent(smooth, 'change', (v) => {
    const now = performance.now();
    const dt = Math.min(now - last.current, 64) / 1000;
    last.current = now;
    if (calm || !visible || Math.abs(v) < 4) return;
    extra.set((extra.get() + Math.max(-3000, Math.min(3000, v)) * 0.05 * dt) % 360);
    if (Math.abs(v) > 60 && v < 0 !== reverse) setReverse(v < 0);
  });

  const r = 38;
  const circumference = 2 * Math.PI * r;

  return (
    <div ref={ref} className={cn('relative aspect-square', className)}>
      <m.div className="absolute inset-0" style={calm ? undefined : { rotate: extra }}>
        <svg
          viewBox="0 0 100 100"
          className={cn('ring-spin absolute inset-0 h-full w-full overflow-visible', reverse && 'ring-reverse', !visible && 'ring-paused')}
          style={{ ['--period' as string]: `${period}s` }}
          aria-hidden="true"
        >
          <defs>
            <path id={`ring-${id}`} d={`M50,50 m-${r},0 a${r},${r} 0 1,1 ${r * 2},0 a${r},${r} 0 1,1 -${r * 2},0`} />
          </defs>
          {texts.map((t, i) => (
            <text
              key={i}
              className={cn('fill-current font-sans uppercase transition-opacity duration-700', textClassName)}
              style={{ fontSize: 8.2, letterSpacing: '0.18em', fontWeight: 600, opacity: i === active ? 1 : 0 }}
            >
              <textPath href={`#ring-${id}`} textLength={circumference - 1} lengthAdjust="spacing">
                {t.toUpperCase()}
              </textPath>
            </text>
          ))}
        </svg>
      </m.div>
      {children ? <div className="absolute inset-0 grid place-items-center">{children}</div> : null}
    </div>
  );
}
