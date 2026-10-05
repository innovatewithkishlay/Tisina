'use client';

import { useMemo, useRef, useState } from 'react';
import { Img } from '@/components/ui/Img';
import { Hacek } from '@/components/brand/Logo';
import { useLenis } from '@/components/motion/SmoothScroll';
import { ScrollTrigger, gsap, reducedMotion, useGSAP } from '@/components/motion/gsap';
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
  const root = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const [filter, setFilter] = useState<Filter>('all');
  const [activeCat, setActiveCat] = useState(0);

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

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      el.querySelectorAll<HTMLElement>('[data-cat]').forEach((section) => {
        const i = Number(section.dataset.cat);
        // Measured after the pinned sideways sections have added their scroll distance.
        ScrollTrigger.create({ trigger: section, start: 'top 45%', end: 'bottom 45%', refreshPriority: -1, onToggle: (self) => self.isActive && setActiveCat(i) });
      });
      if (reducedMotion()) return;

      // Course name: words rise from behind a mask.
      el.querySelectorAll<HTMLElement>('[data-course-title]').forEach((title) =>
        gsap.from(title.querySelectorAll('[data-w]'), {
          yPercent: 110,
          duration: 1.2,
          stagger: 0.08,
          ease: 'expo.out',
          scrollTrigger: { trigger: title, start: 'top 85%' },
        }),
      );
      // Course photo opens from a band in the middle and settles from a zoom.
      el.querySelectorAll<HTMLElement>('[data-cover]').forEach((cover) => {
        gsap.fromTo(
          cover,
          { clipPath: 'inset(22% 8% 22% 8% round 22px)' },
          { clipPath: 'inset(0% 0% 0% 0% round 22px)', ease: 'none', scrollTrigger: { trigger: cover, start: 'top 95%', end: 'top 35%', scrub: true } },
        );
        gsap.fromTo(cover.querySelector('img'), { scale: 1.3 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: cover, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
      // Sideways courses: pin and move the row of dishes horizontally.
      el.querySelectorAll<HTMLElement>('[data-hscroll]').forEach((wrap) => {
        const track = wrap.querySelector<HTMLElement>('[data-track]');
        if (!track) return;
        const distance = () => Math.max(0, track.scrollWidth - wrap.clientWidth);
        gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: { trigger: wrap, start: 'center center', end: () => `+=${distance()}`, pin: true, scrub: 0.5, invalidateOnRefresh: true },
        });
      });
      // Downward courses: each row's photo slides up into its frame.
      el.querySelectorAll<HTMLElement>('[data-row]').forEach((row) => {
        gsap.fromTo(
          row.querySelector('[data-row-media]'),
          { clipPath: 'inset(100% 0% 0% 0% round 20px)' },
          { clipPath: 'inset(0% 0% 0% 0% round 20px)', duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: row, start: 'top 80%' } },
        );
        gsap.fromTo(row.querySelector('[data-row-media] img'), { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom top', scrub: true } });
        gsap.from(row.querySelector('[data-row-text]'), { y: 50, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: row, start: 'top 75%' } });
      });
    },
    { scope: root, dependencies: [categories, filter], revertOnUpdate: true },
  );

  const jump = (slug: string) => {
    const target = document.getElementById(`c-${slug}`);
    document.getElementById('menu-courses')?.hidePopover?.();
    if (!target) return;
    if (lenis) lenis.scrollTo(target, { offset: -140, duration: 1.4 });
    else target.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' });
  };

  const current = visible[activeCat] ?? visible[0];
  // Alternate direction over the courses that are actually shown.
  const direction = new Map<string, boolean>();
  visible.filter((c) => c.items.length > 0).forEach((c, i) => direction.set(c.slug, i % 2 === 0 && c.items.length > 1));

  return (
    <div ref={root} className="paper relative pb-[var(--section)]">
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
                onClick={() => setFilter(f)}
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

      {visible.map((c, ci) => {
        if (c.items.length === 0) return null;
        const sideways = direction.get(c.slug) ?? false;
        return (
          <section key={c.slug} id={`c-${c.slug}`} data-cat={ci} aria-labelledby={`h-${c.slug}`} className="scroll-mt-36 pt-[clamp(5rem,10vw,9rem)]">
            <div className="wrap">
              <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
                <h2 id={`h-${c.slug}`} data-course-title className="font-display text-[clamp(3.25rem,8vw,8.5rem)] leading-[0.95] tracking-[-0.03em] lg:col-span-8">
                  {c.name.split(' ').map((w, i) => (
                    <span key={i} className="mr-[0.22em] inline-block overflow-hidden pb-[0.08em] align-bottom last:mr-0">
                      <span data-w className={cn('inline-block', i % 2 === 1 && 'italic')}>{w}</span>
                    </span>
                  ))}
                </h2>
                {c.description ? (
                  <p className="font-display max-w-[32ch] text-[clamp(1.25rem,1.8vw,1.625rem)] italic leading-[1.35] text-fg-2 lg:col-span-4 lg:pb-3">{c.description}</p>
                ) : null}
              </div>
              <div data-cover className="relative mt-10 aspect-[4/3] overflow-hidden rounded-[22px] bg-bg-2 sm:aspect-[16/9] lg:aspect-[21/9]">
                <Img src={c.image} alt="" fill sizes="(min-width: 1536px) 92rem, 100vw" className="object-cover" />
              </div>
            </div>

            {sideways ? (
              <div data-hscroll className="mt-14 overflow-hidden">
                <ul data-track className="flex w-max gap-[clamp(1.25rem,3vw,2.5rem)] px-[var(--gutter)] motion-reduce:w-auto motion-reduce:overflow-x-auto">
                  {c.items.map((item) => (
                    <li key={item.slug} id={item.slug} className={cn('w-[min(78vw,26rem)] shrink-0 scroll-mt-40', !item.available && 'opacity-55')}>
                      <TiltFrame className="relative aspect-[4/5] overflow-hidden rounded-[20px] bg-bg-2">
                        <Img src={item.image ?? c.image} alt={item.name} fill sizes="(min-width: 768px) 26rem, 78vw" className="object-cover" />
                        <Badges item={item} labels={labels} className="absolute left-4 top-4" />
                      </TiltFrame>
                      <DishText item={item} labels={labels} className="mt-5" />
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <ul className="wrap mt-16 space-y-[clamp(3.5rem,7vw,6rem)]">
                {c.items.map((item, i) => (
                  <li
                    key={item.slug}
                    id={item.slug}
                    data-row
                    className={cn('grid scroll-mt-40 gap-6 md:grid-cols-12 md:items-center md:gap-10', !item.available && 'opacity-55')}
                  >
                    <div data-row-media className={cn('relative aspect-[4/3] overflow-hidden rounded-[20px] bg-bg-2 md:col-span-7', i % 2 === 1 && 'md:order-2 md:col-start-6')}>
                      <Img src={item.image ?? c.image} alt={item.name} fill sizes="(min-width: 768px) 56vw, 100vw" className="object-cover" />
                      <Badges item={item} labels={labels} className="absolute left-4 top-4" />
                    </div>
                    <div data-row-text className={cn('md:col-span-5', i % 2 === 1 ? 'md:order-1 md:col-span-4' : 'md:col-start-8 md:col-span-5')}>
                      <DishText item={item} labels={labels} large />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
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
 * Photo frame that leans towards the pointer in 3D, with a soft highlight
 * following it. Pure CSS variables — no re-renders while the mouse moves.
 */
function TiltFrame({ className, children }: { className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== 'mouse' || reducedMotion()) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--rx', `${(-y * 9).toFixed(2)}deg`);
    el.style.setProperty('--ry', `${(x * 11).toFixed(2)}deg`);
    el.style.setProperty('--gx', `${((x + 0.5) * 100).toFixed(1)}%`);
    el.style.setProperty('--gy', `${((y + 0.5) * 100).toFixed(1)}%`);
  };
  const leave = () => {
    ref.current?.style.setProperty('--rx', '0deg');
    ref.current?.style.setProperty('--ry', '0deg');
  };
  return (
    <div
      ref={ref}
      onPointerMove={move}
      onPointerLeave={leave}
      className={cn(
        className,
        'transition-transform duration-500 ease-[var(--ease-out)] [transform:rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] [transform-style:preserve-3d]',
        "after:pointer-events-none after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_var(--gx,50%)_var(--gy,50%),rgb(255_255_255/0.18),transparent_55%)] after:opacity-0 after:transition-opacity after:duration-500 hover:after:opacity-100",
      )}
    >
      {children}
    </div>
  );
}
