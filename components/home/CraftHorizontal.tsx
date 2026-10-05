'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  m,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from 'motion/react';
import { Img } from '@/components/ui/Img';
import { Kicker } from '@/components/ui/Kicker';
import { ClipReveal } from '@/components/motion/ClipReveal';
import { Counter } from '@/components/motion/Counter';
import { useLenis } from '@/components/motion/SmoothScroll';
import { scrollSpring, useCalm, useDesktop } from '@/lib/motion';
import { cn } from '@/lib/utils';

export interface CraftPanel {
  key: string;
  figure: string;
  title: string;
  body: string;
  alt: string;
  image: string;
}

/**
 * Fire, flour, patience — the one sideways passage on the page.
 *
 * Desktop: the section is as tall as one screen per card; a sticky stage
 * holds still while vertical scroll travels the strip sideways. Photographs
 * drift against the travel, numbers roll up as their card reaches the
 * centre, cards lean a few degrees with scroll speed, and the room warms to
 * an ember glow at the 450° oven before cooling again. You can also drag.
 *
 * Phones (and reduced motion): no pinning at all — a native swipe carousel
 * with scroll-snap; the card in focus is full size, its neighbours recede.
 */
export function CraftHorizontal({
  label,
  title,
  panels,
  drag,
  swipe,
  peak = 'fire',
}: {
  label: string;
  title: string;
  panels: CraftPanel[];
  /** Cursor label over the strip. */
  drag: string;
  /** Hint under the carousel on phones. */
  swipe: string;
  /** Key of the card where the glow is strongest. */
  peak?: string;
}) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const calm = useCalm();
  const desktop = useDesktop();
  const pinned = desktop && !calm;
  const lenis = useLenis();
  const titleHtml = title.replace(/\*([^*]+)\*/g, '<em class="text-accent">$1</em>');

  const [active, setActive] = useState(0);
  const [played, setPlayed] = useState<boolean[]>(() => panels.map(() => false));
  const geometry = useRef({ distance: 0, centres: [] as number[], peakAt: 0.3 });

  const markActive = useCallback((i: number) => {
    setActive(i);
    setPlayed((p) => (p[i] ? p : p.map((v, k) => v || k === i)));
  }, []);

  // Measure the strip: how far it travels, and where each card sits.
  useEffect(() => {
    const el = track.current;
    if (!el || !pinned) return;
    const measure = () => {
      const distance = Math.max(el.scrollWidth - window.innerWidth, 1);
      const cards = Array.from(el.querySelectorAll<HTMLElement>('[data-craft-card]'));
      const centres = cards.map((c) => c.offsetLeft + c.offsetWidth / 2 - window.innerWidth / 2);
      const pk = panels.findIndex((p) => p.key === peak);
      const at = pk >= 0 ? Math.min(Math.max(centres[pk] / distance, 0.05), 0.95) : 0.3;
      geometry.current = { distance, centres, peakAt: at };
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [pinned, panels, peak]);

  const { scrollYProgress } = useScroll({ target: root, offset: ['start start', 'end end'] });
  const progress = useSpring(scrollYProgress, scrollSpring);
  const x = useTransform(progress, (v) => -v * geometry.current.distance);
  const drift = useTransform(progress, [0, 1], ['-7%', '7%']);
  const glow = useTransform(progress, (v) => {
    const pk = geometry.current.peakAt;
    return v <= pk ? v / pk : 1 - ((v - pk) / (1 - pk)) * 0.88;
  });
  const bar = useTransform(progress, [0, 1], [0.04, 1]);

  // Lean with the speed of travel, then settle back to upright.
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const skewRaw = useTransform(velocity, [-2500, 0, 2500], [3, 0, -3], { clamp: true });
  const skew = useSpring(skewRaw, { stiffness: 90, damping: 26, mass: 0.6 });

  useMotionValueEvent(x, 'change', (v) => {
    if (!pinned) return;
    const { centres } = geometry.current;
    if (!centres.length) return;
    let best = 0;
    centres.forEach((c, i) => {
      if (Math.abs(c + v) < Math.abs(centres[best] + v)) best = i;
    });
    // Same values bail out in React, so this is cheap between card changes.
    markActive(best);
  });

  // Phones: the card nearest the centre of the carousel is the active one.
  const onTrackScroll = () => {
    const el = track.current;
    if (!el || pinned) return;
    const cards = Array.from(el.querySelectorAll<HTMLElement>('[data-craft-card]'));
    const mid = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    cards.forEach((c, i) => {
      const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid);
      const b = Math.abs(cards[best].offsetLeft + cards[best].offsetWidth / 2 - mid);
      if (d < b) best = i;
    });
    if (best !== active) markActive(best);
  };
  // Mouse drag on the pinned strip moves the page by the matching distance.
  const dragFrom = useRef<number | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    if (!pinned || e.pointerType !== 'mouse' || e.button !== 0) return;
    dragFrom.current = e.clientX;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (dragFrom.current === null || !root.current) return;
    const dx = e.clientX - dragFrom.current;
    dragFrom.current = e.clientX;
    const span = root.current.offsetHeight - window.innerHeight;
    const dy = (-dx * span) / geometry.current.distance;
    if (lenis) lenis.scrollTo(lenis.targetScroll + dy * 1.4);
    else window.scrollBy(0, dy);
  };
  const endDrag = () => {
    dragFrom.current = null;
  };

  const heading = (hidden?: boolean) => (
    <>
      <Kicker>{label}</Kicker>
      <h2
        id={hidden ? undefined : 'craft-title'}
        aria-hidden={hidden || undefined}
        className="font-display mt-6 text-[clamp(3rem,7vw,7rem)] leading-[0.9] tracking-[-0.02em]"
        dangerouslySetInnerHTML={{ __html: titleHtml }}
      />
    </>
  );

  return (
    <section
      ref={root}
      className="night relative md:h-[calc(var(--n)*100svh)] md:motion-reduce:h-auto"
      style={{ ['--n' as string]: panels.length }}
      aria-labelledby="craft-title"
    >
      <div className="relative overflow-hidden py-[var(--section)] md:sticky md:top-0 md:flex md:h-[100svh] md:flex-col md:justify-center md:py-0 md:pt-[var(--header-h)] md:motion-reduce:static md:motion-reduce:h-auto md:motion-reduce:py-[var(--section)]">
        {/* The oven's glow, rising and falling with the story. */}
        <m.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden md:block"
          style={{
            opacity: pinned ? glow : 0,
            background:
              'radial-gradient(60% 70% at 50% 62%, rgb(214 120 60 / 0.32), rgb(138 28 44 / 0.16) 45%, transparent 75%)',
          }}
        />

        <div className="wrap mb-10 md:hidden">{heading()}</div>

        <m.div
          ref={track}
          data-cursor={pinned ? drag : undefined}
          onScroll={onTrackScroll}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className={cn(
            'no-scrollbar relative flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-[7.5vw] md:select-none',
            'md:w-max md:snap-none md:items-center md:gap-[clamp(1.5rem,4vw,4rem)] md:overflow-visible md:px-[var(--gutter)]',
            'md:motion-reduce:w-auto md:motion-reduce:snap-x md:motion-reduce:overflow-x-auto',
          )}
          style={pinned ? { x } : undefined}
        >
          <div className="hidden w-[min(78vw,30rem)] shrink-0 md:block">{heading(true)}</div>

          {panels.map((p, i) => (
            <CraftCard
              key={p.key}
              panel={p}
              index={i}
              total={panels.length}
              active={active === i}
              played={played[i] || (!pinned && active === i)}
              pinned={pinned}
              drift={drift}
              skew={skew}
            />
          ))}
          <div className="w-[1px] shrink-0 md:w-[8vw]" aria-hidden="true" />
        </m.div>

        {/* Where you are: 01 / 04 and a filling hairline (dots on phones). */}
        <div className="wrap mt-8 flex items-center gap-5 md:mt-10">
          <p className="label tabular-nums text-fg-2" aria-hidden="true">
            {String(active + 1).padStart(2, '0')} <span className="text-muted">/ {String(panels.length).padStart(2, '0')}</span>
          </p>
          <div className="relative hidden h-px w-40 overflow-hidden bg-line md:block">
            <m.span className="absolute inset-0 origin-left bg-accent" style={{ scaleX: pinned ? bar : (active + 1) / panels.length }} />
          </div>
          <div className="flex gap-2 md:hidden" aria-hidden="true">
            {panels.map((p, i) => (
              <span
                key={p.key}
                className={cn('h-1.5 rounded-full transition-[width,background-color] duration-500', i === active ? 'w-6 bg-accent' : 'w-1.5 bg-line')}
              />
            ))}
          </div>
          <p className="label ml-auto text-muted md:hidden" aria-hidden="true">
            {swipe} →
          </p>
        </div>
      </div>
    </section>
  );
}

function CraftCard({
  panel: p,
  index,
  total,
  active,
  played,
  pinned,
  drift,
  skew,
}: {
  panel: CraftPanel;
  index: number;
  total: number;
  active: boolean;
  played: boolean;
  pinned: boolean;
  drift: MotionValue<string>;
  skew: MotionValue<number>;
}) {
  return (
    <m.article
      data-craft-card
      aria-label={`${index + 1} / ${total}`}
      className={cn(
        'w-[85vw] shrink-0 snap-center transition-[transform,opacity] duration-700 ease-[var(--ease-out)] md:w-[min(80vw,50rem)] md:transition-none',
        !pinned && !active && 'max-md:scale-[0.92] max-md:opacity-60',
      )}
      style={pinned ? { skewX: skew } : undefined}
    >
      <ClipReveal className="aspect-[4/5] w-full rounded-[22px] bg-night-2 sm:aspect-[16/10]" amount={0.25}>
        <m.div className="absolute inset-y-0 -left-[8%] -right-[8%]" style={pinned ? { x: drift } : undefined}>
          <Img src={p.image} alt={p.alt} fill sizes="(min-width: 768px) 50rem, 85vw" className="object-cover" draggable={false} />
        </m.div>
      </ClipReveal>
      <div className="mt-6 grid gap-x-8 gap-y-2 sm:grid-cols-[auto_1fr] sm:items-baseline">
        <p className="font-display text-[clamp(2.75rem,5vw,4.5rem)] italic leading-none text-accent">
          <Counter value={p.figure} play={played} />
        </p>
        <div>
          <h3 className="font-display text-h3">{p.title}</h3>
          <p className="mt-2 max-w-[44ch] text-fg-2">{p.body}</p>
        </div>
      </div>
    </m.article>
  );
}
