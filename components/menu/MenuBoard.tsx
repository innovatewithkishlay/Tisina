'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { m, useInView, useMotionTemplate, useMotionValue, useScroll, useSpring, useTransform } from 'motion/react';
import { Img } from '@/components/ui/Img';
import { Hacek } from '@/components/brand/Logo';
import { useLenis } from '@/components/motion/SmoothScroll';
import { ClipReveal } from '@/components/motion/ClipReveal';
import { Parallax } from '@/components/motion/Parallax';
import { SplitReveal } from '@/components/motion/SplitReveal';
import { scrollSpring, useCalm, useDesktop } from '@/lib/motion';
import type { DietaryTag } from '@/types/restaurant';
import { cn } from '@/lib/utils';

export interface BoardItem {
  slug: string;
  name: string;
  description?: string;
  price: string;
  marketPrice: boolean;
  image?: string;
  featured: boolean;
  seasonal: boolean;
  available: boolean;
  allergens: string[];
  dietary: DietaryTag[];
}

export interface BoardCategory {
  slug: string;
  name: string;
  description?: string;
  image: string;
  items: BoardItem[];
}

export interface BoardLabels {
  signature: string;
  seasonal: string;
  unavailable: string;
  allergensLabel: string;
  dietaryLabel: string;
  jumpTo: string;
  filterLabel: string;
  filterAll: string;
  /** Contains "#" for the number of matching dishes. */
  countOne: string;
  countOther: string;
  noMatch: string;
  dietary: Record<string, string>;
}

type Filter = DietaryTag | 'all';

/**
 * The menu, course by course. Each course opens with its name and a wide
 * photograph; then its dishes — every one with a picture — either travel
 * sideways while the section is pinned (odd courses) or stack downwards in
 * alternating rows (even courses), so the page changes direction as you read.
 * A sticky bar jumps between courses and filters by diet.
 */
export function MenuBoard({ categories, labels }: { categories: BoardCategory[]; labels: BoardLabels }) {
  const lenis = useLenis();
  const [filter, setFilter] = useState<Filter>('all');
  const [activeCat, setActiveCat] = useState(0);
  const [filtered, setFiltered] = useState(false);

  const tags = useMemo(() => {
    const seen = new Set<DietaryTag>();
    categories.forEach((c) => c.items.forEach((i) => i.dietary.forEach((d) => seen.add(d))));
    return (['vegetarian', 'vegan', 'gluten_free', 'dairy_free', 'pescatarian'] as const).filter((d) => seen.has(d));
  }, [categories]);

  const visible = useMemo(
    () => categories.map((c) => ({ ...c, items: c.items.filter((i) => filter === 'all' || i.dietary.includes(filter)) })),
    [categories, filter],
  );
  const count = visible.reduce((n, c) => n + c.items.length, 0);

  const jump = (slug: string) => {
    const target = document.getElementById(`c-${slug}`);
    document.getElementById('menu-courses')?.hidePopover?.();
    if (!target) return;
    if (lenis) lenis.scrollTo(target, { offset: -140, duration: 1.4 });
    else target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };

  const current = visible[activeCat] ?? visible[0];
  // Alternate direction over the courses that are actually shown.
  const direction = new Map<string, boolean>();
  visible.filter((c) => c.items.length > 0).forEach((c, i) => direction.set(c.slug, i % 2 === 0 && c.items.length > 1));

  return (
    <div className="paper relative pb-[var(--section)]">
      {/* Sticky course + diet bar */}
      <div className="sticky top-[var(--header-h)] z-40 border-b hairline bg-bg/95 backdrop-blur-md">
        <div className="wrap flex items-center gap-6 py-3">
          <button
            type="button"
            popoverTarget="menu-courses"
            aria-label={`${labels.jumpTo}: ${current?.name ?? ''}`}
            className="label flex min-h-11 shrink-0 items-center gap-2.5 rounded-full bg-fg px-4 text-bg transition-colors hover:bg-accent hover:text-on-accent"
          >
            <span className="max-w-[9rem] truncate sm:max-w-[14rem]">{current?.name}</span>
            <svg viewBox="0 0 10 6" className="size-2.5" aria-hidden="true">
              <path d="M1 1 L5 5 L9 1" fill="none" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </button>
          <div role="group" aria-label={labels.filterLabel} className="no-scrollbar -mr-[var(--gutter)] flex min-w-0 gap-5 overflow-x-auto pr-[var(--gutter)]">
            {(['all', ...tags] as Filter[]).map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={filter === f}
                onClick={() => {
                  setFiltered(true);
                  setFilter(f);
                }}
                className={cn(
                  'label min-h-11 shrink-0 border-b-[1.5px] transition-colors duration-300',
                  filter === f ? 'border-accent text-accent' : 'border-transparent text-fg-2 hover:text-fg',
                )}
              >
                {f === 'all' ? labels.filterAll : labels.dietary[f]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {(count === 1 ? labels.countOne : labels.countOther).replace('#', String(count))}
      </p>

      <m.div key={filter} initial={filter === 'all' && !filtered ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
      {visible.map((c, ci) => {
        if (c.items.length === 0) return null;
        const sideways = direction.get(c.slug) ?? false;
        return (
          <Course key={c.slug} slug={c.slug} labelledBy={`h-${c.slug}`} onActive={() => setActiveCat(ci)}>
            <div className="wrap">
              <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
                <SplitReveal
                  as="h2"
                  id={`h-${c.slug}`}
                  text={c.name
                    .split(' ')
                    .map((w, i) => (i % 2 === 1 ? `*${w}*` : w))
                    .join(' ')}
                  stagger={0.08}
                  className="font-display text-[clamp(3.25rem,8vw,8.5rem)] leading-[0.95] tracking-[-0.03em] lg:col-span-8"
                />
                {c.description ? (
                  <p className="font-display max-w-[32ch] text-[clamp(1.25rem,1.8vw,1.625rem)] italic leading-[1.35] text-fg-2 lg:col-span-4 lg:pb-3">{c.description}</p>
                ) : null}
              </div>
              <CourseCover src={c.image} />
            </div>

            {sideways ? (
              <SidewaysCourse>
                {c.items.map((item) => (
                  <li key={item.slug} id={item.slug} className={cn('w-[min(78vw,26rem)] shrink-0 snap-center scroll-mt-40', !item.available && 'opacity-55')}>
                    <TiltFrame className="relative aspect-[4/5] overflow-hidden rounded-[20px] bg-bg-2" data-cursor="View">
                      <Img src={item.image ?? c.image} alt={item.name} fill sizes="(min-width: 768px) 26rem, 78vw" className="object-cover" />
                      <Badges item={item} labels={labels} className="absolute left-4 top-4" />
                    </TiltFrame>
                    <DishText item={item} labels={labels} className="mt-5" />
                  </li>
                ))}
              </SidewaysCourse>
            ) : (
              <ul className="wrap mt-16 space-y-[clamp(3.5rem,7vw,6rem)]">
                {c.items.map((item, i) => (
                  <DishRow key={item.slug} item={item} index={i} fallback={c.image} labels={labels} />
                ))}
              </ul>
            )}
          </Course>
        );
      })}
      </m.div>
      {count === 0 ? <p className="wrap pt-24 text-lede text-fg-2">{labels.noMatch}</p> : null}

      <nav
        id="menu-courses"
        popover="auto"
        aria-label={labels.jumpTo}
        className="night m-0 mx-auto mb-auto mt-[calc(var(--header-h)+5rem)] w-[min(26rem,calc(100vw-2*var(--gutter)))] rounded-[var(--radius-card)] border border-white/10 p-3 shadow-[var(--shadow-float)] backdrop:bg-night/40"
        data-lenis-prevent
      >
        <ol>
          {visible.map((c, i) => (
            <li key={c.slug} className={cn(c.items.length === 0 && 'hidden')}>
              <button
                type="button"
                onClick={() => jump(c.slug)}
                className={cn('flex min-h-11 w-full items-center gap-4 rounded-xl px-3 py-2 text-left transition-colors hover:bg-white/5', i === activeCat && 'text-accent')}
              >
                <span className="font-display text-[1.6rem] leading-tight">{c.name}</span>
                {i === activeCat ? <Hacek className="ml-auto h-2" /> : null}
              </button>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}

/** A course: reports itself as current while it crosses the reading line. */
function Course({ slug, labelledBy, onActive, children }: { slug: string; labelledBy: string; onActive: () => void; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const current = useInView(ref, { margin: '-45% 0px -55% 0px' });
  useEffect(() => {
    if (current) onActive();
  }, [current, onActive]);
  return (
    <section ref={ref} id={`c-${slug}`} aria-labelledby={labelledBy} className="scroll-mt-36 pt-[clamp(5rem,10vw,9rem)]">
      {children}
    </section>
  );
}

/** The course photograph opens from a band in the middle and settles from a zoom (scrubbed). */
function CourseCover({ src }: { src: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const calm = useCalm();
  const { scrollYProgress: open } = useScroll({ target: ref, offset: ['start 95%', 'start 35%'] });
  const { scrollYProgress: pass } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(open, [0, 1], [22, 0]);
  const x = useTransform(open, [0, 1], [8, 0]);
  const clipPath = useMotionTemplate`inset(${y}% ${x}% ${y}% ${x}% round 22px)`;
  const scale = useTransform(pass, [0, 1], [1.3, 1]);
  return (
    <m.div
      ref={ref}
      className="relative mt-10 aspect-[4/3] overflow-hidden rounded-[22px] bg-bg-2 sm:aspect-[16/9] lg:aspect-[21/9]"
      style={calm ? undefined : { clipPath }}
    >
      <m.div className="absolute inset-0" style={calm ? undefined : { scale }}>
        <Img src={src} alt="" fill sizes="(min-width: 1536px) 92rem, 100vw" className="object-cover" />
      </m.div>
    </m.div>
  );
}

/**
 * Sideways course. Desktop: the row pins and travels horizontally while you
 * keep scrolling down. Phones: no pinning — a native swipe row with snap.
 */
function SidewaysCourse({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const calm = useCalm();
  const desktop = useDesktop();
  const pinned = desktop && !calm;
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    const el = track.current;
    if (!el || !pinned) return;
    const measure = () => setDistance(Math.max(0, el.scrollWidth - window.innerWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [pinned]);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const progress = useSpring(scrollYProgress, scrollSpring);
  const x = useTransform(progress, (v) => -v * distance);

  return (
    <div ref={ref} className="relative mt-14" style={pinned ? { height: `calc(100svh + ${distance}px)` } : undefined}>
      <div className={cn(pinned && 'sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden pt-[calc(var(--header-h)+3.5rem)]')}>
        <m.ul
          ref={track}
          className="no-scrollbar flex snap-x snap-mandatory gap-[clamp(1.25rem,3vw,2.5rem)] overflow-x-auto px-[var(--gutter)] md:w-max md:snap-none md:overflow-visible md:motion-reduce:w-auto md:motion-reduce:snap-x md:motion-reduce:overflow-x-auto"
          style={pinned ? { x } : undefined}
        >
          {children}
        </m.ul>
      </div>
    </div>
  );
}

/** A dish in the downward courses: its photo opens like a blind, the words follow. */
function DishRow({ item, index: i, fallback, labels }: { item: BoardItem; index: number; fallback: string; labels: BoardLabels }) {
  const ref = useRef<HTMLLIElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.3 });
  return (
    <li
      ref={ref}
      id={item.slug}
      className={cn('grid scroll-mt-40 gap-6 md:grid-cols-12 md:items-center md:gap-10', !item.available && 'opacity-55')}
    >
      <ClipReveal className={cn('aspect-[4/3] rounded-[20px] bg-bg-2 md:col-span-7', i % 2 === 1 && 'md:order-2 md:col-start-6')} data-cursor="View">
        <Parallax speed={-0.18} className="absolute inset-0">
          <Img src={item.image ?? fallback} alt={item.name} fill sizes="(min-width: 768px) 56vw, 100vw" className="object-cover" />
        </Parallax>
        <Badges item={item} labels={labels} className="absolute left-4 top-4" />
      </ClipReveal>
      <div
        className={cn(
          'transition-[opacity,transform] delay-300 duration-[1100ms] ease-[var(--ease-out)]',
          !seen && 'js:translate-y-12 js:opacity-0',
          i % 2 === 1 ? 'md:order-1 md:col-span-4' : 'md:col-span-5 md:col-start-8',
        )}
      >
        <DishText item={item} labels={labels} large />
      </div>
    </li>
  );
}

function DishText({ item, labels, className, large }: { item: BoardItem; labels: BoardLabels; className?: string; large?: boolean }) {
  return (
    <div className={className}>
      <div className="flex items-baseline">
        <h3 className={cn('font-display leading-[1.08]', large ? 'text-[clamp(2rem,3.4vw,3.25rem)]' : 'text-[clamp(1.5rem,2.2vw,2rem)]')}>{item.name}</h3>
        <span className="leader" aria-hidden="true" />
        <p className={cn('font-display whitespace-nowrap italic leading-none text-accent', large ? 'text-[1.875rem]' : 'text-[1.5rem]', item.marketPrice && 'text-[1.0625rem] text-fg-2')}>{item.price}</p>
      </div>
      {item.description ? <p className={cn('mt-3 max-w-[46ch] text-fg-2', large && 'text-lede')}>{item.description}</p> : null}
      {item.dietary.length || item.allergens.length ? (
        <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-small text-muted">
          {item.dietary.length ? (
            <div className="flex gap-1.5">
              <dt className="sr-only">{labels.dietaryLabel}</dt>
              <dd className="italic">{item.dietary.map((d) => labels.dietary[d] ?? d).join(' · ')}</dd>
            </div>
          ) : null}
          {item.allergens.length ? (
            <div className="flex gap-1.5">
              <dt>{labels.allergensLabel}:</dt>
              <dd>{item.allergens.join(', ')}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}
    </div>
  );
}

function Badges({ item, labels, className }: { item: BoardItem; labels: BoardLabels; className?: string }) {
  if (!item.featured && !item.seasonal && item.available) return null;
  const tag = 'label inline-flex items-center rounded-full bg-bg/90 px-3 py-1.5 text-[0.625rem] text-accent backdrop-blur';
  return (
    <p className={cn('flex flex-wrap gap-2', className)}>
      {!item.available ? <span className={tag}>{labels.unavailable}</span> : null}
      {item.featured ? <span className={tag}>{labels.signature}</span> : null}
      {item.seasonal ? <span className={tag}>{labels.seasonal}</span> : null}
    </p>
  );
}

/**
 * Photo frame that leans towards the pointer in 3D on a spring (Framer
 * Motion), while the photo inside drifts the other way for depth. Settles back
 * smoothly on leave. Mouse only; reduced motion is handled by MotionConfig.
 */
function TiltFrame({ className, children }: { className?: string; children: React.ReactNode }) {
  // Plain markup until the first mouse hover: dozens of cards on the page should
  // not each spin up springs during load.
  const [live, setLive] = useState(false);
  if (!live) {
    return (
      <div className={className} onPointerEnter={(e) => e.pointerType === 'mouse' && setLive(true)}>
        <div className="absolute -inset-4">{children}</div>
      </div>
    );
  }
  return <LiveTilt className={className}>{children}</LiveTilt>;
}

function LiveTilt({ className, children }: { className?: string; children: React.ReactNode }) {
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const spring = { stiffness: 180, damping: 18, mass: 0.5 };
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-9, 9]), spring);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [7, -7]), spring);
  const shiftX = useSpring(useTransform(px, [-0.5, 0.5], [12, -12]), spring);
  const shiftY = useSpring(useTransform(py, [-0.5, 0.5], [10, -10]), spring);
  const glow = useMotionTemplate`radial-gradient(circle at ${useTransform(px, [-0.5, 0.5], [0, 100])}% ${useTransform(py, [-0.5, 0.5], [0, 100])}%, rgb(255 255 255 / 0.16), transparent 55%)`;

  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const leave = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <m.div
      onPointerMove={move}
      onPointerLeave={leave}
      whileHover={{ scale: 1.015 }}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      className={cn(className, 'group/tilt')}
    >
      <m.div className="absolute -inset-4" style={{ x: shiftX, y: shiftY }}>
        {children}
      </m.div>
      <m.div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/tilt:opacity-100" style={{ backgroundImage: glow }} />
    </m.div>
  );
}
