'use client';

import { useRef } from 'react';
import {
  m,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  wrap,
  type MotionValue,
} from 'motion/react';
import { Link } from '@/i18n/routing';
import { Kicker } from '@/components/ui/Kicker';
import { Magnetic } from '@/components/motion/Magnetic';
import { SplitReveal } from '@/components/motion/SplitReveal';
import { useCalm } from '@/lib/motion';

/**
 * The menu at a glance: course names drift across the screen in two rows,
 * in opposite directions, at a slow walking pace. Scrolling adds speed and
 * turns them with the direction of travel, and they lean a little while
 * moving fast. Hovering a row holds it still; each name is a link to that
 * course (a tap goes straight there on phones).
 */
export function MenuGlance({
  label,
  title,
  cta,
  courses,
}: {
  label: string;
  title: string;
  cta: string;
  courses: { slug: string; name: string }[];
}) {
  const root = useRef<HTMLElement>(null);
  const half = Math.ceil(courses.length / 2);
  const rows = [courses.slice(0, half), courses.slice(half)];

  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 50, stiffness: 300 });
  const factor = useTransform(smooth, [-2000, 0, 2000], [-4, 0, 4], { clamp: false });
  const skew = useSpring(useTransform(smooth, [-2500, 0, 2500], [4, 0, -4], { clamp: true }), { stiffness: 90, damping: 26 });

  return (
    <section ref={root} className="paper section overflow-hidden" aria-labelledby="glance-title">
      <div className="wrap">
        <Kicker>{label}</Kicker>
        <SplitReveal as="h2" id="glance-title" by="line" text={title} className="font-display mt-6 max-w-[16ch] text-h2" />
      </div>

      <nav aria-label={label} className="mt-16 space-y-1 md:space-y-2">
        {rows.map((row, r) => (
          <MarqueeRow key={r} row={row} direction={r === 0 ? -1 : 1} factor={factor} skew={skew} />
        ))}
      </nav>

      <div className="wrap mt-16">
        <Magnetic>
          <Link
            href="/menu"
            className="btn-fill group label inline-flex min-h-14 items-center gap-4 rounded-[var(--radius-pill)] bg-fg px-8 text-bg [--btn-fill:var(--accent)]"
          >
            {cta}
            <span className="btn-arrow" aria-hidden="true">
              <span>→</span>
            </span>
          </Link>
        </Magnetic>
      </div>
    </section>
  );
}

function MarqueeRow({
  row,
  direction,
  factor,
  skew,
}: {
  row: { slug: string; name: string }[];
  direction: 1 | -1;
  factor: MotionValue<number>;
  skew: MotionValue<number>;
}) {
  const ref = useRef<HTMLUListElement>(null);
  const calm = useCalm();
  const visible = useInView(ref);
  const base = useMotionValue(0);
  const dir = useRef(1);
  const paused = useRef(false);
  const x = useTransform(base, (v) => `${wrap(-50, 0, v)}%`);

  useAnimationFrame((_, delta) => {
    if (calm || !visible || paused.current) return;
    const f = factor.get();
    if (f < -0.05) dir.current = -1;
    else if (f > 0.05) dir.current = 1;
    // ~1.6% of the row per second at rest; scrolling multiplies it.
    const step = direction * dir.current * 1.6 * (Math.min(delta, 64) / 1000) * (1 + Math.abs(f));
    base.set(base.get() + step);
  });

  return (
    <m.ul
      ref={ref}
      onPointerEnter={(e) => {
        if (e.pointerType === 'mouse') paused.current = true;
      }}
      onPointerLeave={() => {
        paused.current = false;
      }}
      className="flex w-max items-center gap-[0.35em] whitespace-nowrap font-display text-[clamp(3rem,10vw,10rem)] leading-[1.04] tracking-[-0.03em]"
      style={calm ? undefined : { x, skewX: skew }}
    >
      {[...row, ...row, ...row, ...row].map((c, i) => {
        const copy = i >= row.length;
        return (
          <li key={`${c.slug}-${i}`} className="flex items-center gap-[0.35em]" aria-hidden={copy || undefined}>
            <Link
              href={{ pathname: '/menu', hash: `c-${c.slug}` }}
              tabIndex={copy ? -1 : undefined}
              className="marquee-link outline-text transition-[color,-webkit-text-stroke-color] duration-500 [-webkit-text-stroke-color:color-mix(in_srgb,var(--fg)_62%,transparent)] [-webkit-text-stroke-width:1.2px] hover:italic hover:text-fg"
            >
              {c.name}
            </Link>
            <span className="text-[0.35em] text-accent" aria-hidden="true">
              ˇ
            </span>
          </li>
        );
      })}
    </m.ul>
  );
}
