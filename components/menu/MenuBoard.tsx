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
 * The menu, photograph first. Every course opens on a wide image with its name
 * set into it; dishes that have a photo are shown as image cards, the rest as
 * a quiet list beneath. A sticky bar jumps between courses and filters by diet.
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
        ScrollTrigger.create({ trigger: section, start: 'top 45%', end: 'bottom 45%', onToggle: (self) => self.isActive && setActiveCat(i) });
      });
      if (reducedMotion()) return;
      // Course photo: lies tilted back in 3D and swings flat as it reaches you.
      el.querySelectorAll<HTMLElement>('[data-cover]').forEach((cover) => {
        gsap.fromTo(
          cover,
          { rotateX: 38, scale: 0.82, yPercent: 8, transformOrigin: '50% 100%' },
          { rotateX: 0, scale: 1, yPercent: 0, ease: 'none', scrollTrigger: { trigger: cover, start: 'top bottom', end: 'top 25%', scrub: true } },
        );
        gsap.fromTo(
          cover.querySelector('img'),
          { scale: 1.25 },
          { scale: 1, ease: 'none', scrollTrigger: { trigger: cover, start: 'top bottom', end: 'bottom top', scrub: true } },
        );
      });
      // Course names: letters rise one after another on the way in.
      el.querySelectorAll<HTMLElement>('[data-course-title]').forEach((title) =>
        gsap.fromTo(
          title.querySelectorAll('[data-ch]'),
          { yPercent: 105, rotate: 4 },
          { yPercent: 0, rotate: 0, stagger: 0.025, ease: 'none', scrollTrigger: { trigger: title, start: 'top 92%', end: 'top 55%', scrub: true } },
        ),
      );
      // Dish cards fly in from depth, turned, and settle flat.
      ScrollTrigger.batch(el.querySelectorAll('[data-reveal-card]'), {
        start: 'top 92%',
        once: true,
        onEnter: (batch) =>
          gsap.fromTo(
            batch,
            { opacity: 0, rotateY: -28, rotateX: 12, z: -260, y: 80 },
            { opacity: 1, rotateY: 0, rotateX: 0, z: 0, y: 0, duration: 1.4, stagger: 0.12, ease: 'expo.out', clearProps: 'transform' },
          ),
      });
    },
    { scope: root, dependencies: [categories] },
  );

  const changeFilter = (f: Filter) => {
    setFilter(f);
    requestAnimationFrame(() => {
      root.current?.querySelectorAll<HTMLElement>('[data-reveal-card]').forEach((r) => {
        r.style.opacity = '';
        r.style.transform = '';
      });
      ScrollTrigger.refresh();
    });
  };

  const jump = (slug: string) => {
    const target = document.getElementById(`c-${slug}`);
    document.getElementById('menu-courses')?.hidePopover?.();
    if (!target) return;
    if (lenis) lenis.scrollTo(target, { offset: -140, duration: 1.4 });
    else target.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' });
  };

  const current = visible[activeCat] ?? visible[0];

  return (
    <div ref={root} className="paper relative pb-[var(--section)]">
      {/* Sticky course + diet bar */}
      <div className="sticky top-[var(--header-h)] z-40 border-b hairline bg-bg/95 backdrop-blur-md">
        <div className="wrap flex items-center gap-6 py-3">
          <button
            type="button"
            popoverTarget="menu-courses"
            aria-label={`${labels.jumpTo}: ${current?.name ?? ''}`}
            className="label flex min-h-11 shrink-0 items-center gap-2.5 rounded-full bg-fg px-4 text-bg transition-colors hover:bg-accent"
          >
            <span className="max-w-[8.5rem] truncate sm:max-w-[14rem]">{current?.name}</span>
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
                onClick={() => changeFilter(f)}
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
        const pictured = c.items.filter((i) => i.image);
        const listed = c.items.filter((i) => !i.image);
        if (c.items.length === 0 && filter !== 'all') return null;
        return (
          <section key={c.slug} id={`c-${c.slug}`} data-cat={ci} aria-labelledby={`h-${c.slug}`} className="scroll-mt-36 pt-[clamp(4rem,9vw,8rem)]">
            {/* Course name, then its photograph — nothing laid over the picture */}
            <div className="wrap">
              <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
                <h2 id={`h-${c.slug}`} data-course-title className="font-display text-[clamp(3.5rem,13vw,13rem)] leading-[0.82]">
                  <span className="sr-only">{c.name}</span>
                  <span aria-hidden="true" className="inline-flex flex-wrap overflow-hidden pb-[0.04em]">
                    {Array.from(c.name).map((ch, i) => (
                      <span key={i} data-ch className="inline-block">
                        {ch === ' ' ? '\u00a0' : ch}
                      </span>
                    ))}
                  </span>
                </h2>
                <div className="pb-[0.6em] text-right">
                  <p className="label text-accent">{(c.items.length === 1 ? labels.countOne : labels.countOther).replace('#', String(c.items.length))}</p>
                  {c.description ? <p className="font-serif mt-2 max-w-[34ch] text-lede italic text-fg-2">{c.description}</p> : null}
                </div>
              </div>
              <div className="mt-8 [perspective:1400px]">
                <div data-cover className="relative aspect-[4/5] overflow-hidden rounded-[22px] bg-bg-2 will-change-transform sm:aspect-[16/9] lg:aspect-[21/9]">
                  <Img src={c.image} alt="" fill sizes="(min-width: 1536px) 92rem, 100vw" className="object-cover" />
                </div>
              </div>
            </div>

            {/* Dishes with photographs */}
            {pictured.length ? (
              <ul className={cn('wrap mt-14 grid gap-x-8 gap-y-16 [perspective:1600px]', pictured.length === 2 ? 'sm:grid-cols-2' : pictured.length > 2 && 'sm:grid-cols-2 lg:grid-cols-3')}>
                {pictured.map((item) => (
                  <li
                    key={item.slug}
                    id={item.slug}
                    data-reveal-card
                    className={cn('group scroll-mt-40', pictured.length === 1 && 'md:grid md:grid-cols-[1.25fr_1fr] md:items-end md:gap-12', !item.available && 'opacity-55')}
                  >
                    <TiltFrame className={cn('relative overflow-hidden rounded-[20px] bg-bg-2', pictured.length === 1 ? 'aspect-[4/3]' : 'aspect-[4/5]')}>
                      <Img
                        src={item.image!}
                        alt={item.name}
                        fill
                        sizes={pictured.length === 1 ? '(min-width: 768px) 55vw, 100vw' : '(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 100vw'}
                        className="object-cover transition-transform duration-[1400ms] ease-[var(--ease-out)] group-hover:scale-[1.06]"
                      />
                      <Badges item={item} labels={labels} className="absolute left-4 top-4" />
                    </TiltFrame>
                    <DishText item={item} labels={labels} className={cn('mt-5', pictured.length === 1 && 'md:mt-0 md:pb-4')} />
                  </li>
                ))}
              </ul>
            ) : null}

            {/* Everything else, as a list */}
            {listed.length ? (
              <ul className="wrap mt-14 grid gap-x-16 [perspective:1600px] md:grid-cols-2">
                {listed.map((item) => (
                  <li key={item.slug} id={item.slug} data-reveal-card className={cn('scroll-mt-40 border-t hairline py-7', !item.available && 'opacity-55')}>
                    <Badges item={item} labels={labels} className="mb-3" />
                    <DishText item={item} labels={labels} />
                  </li>
                ))}
              </ul>
            ) : null}
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
            <li key={c.slug} className={cn(c.items.length === 0 && filter !== 'all' && 'hidden')}>
              <button
                type="button"
                onClick={() => jump(c.slug)}
                className={cn('flex min-h-11 w-full items-baseline gap-4 rounded-xl px-3 py-2 text-left transition-colors hover:bg-white/5', i === activeCat && 'text-accent')}
              >
                <span className="font-display text-[1.75rem] leading-none">{c.name}</span>
                {i === activeCat ? <Hacek className="ml-auto h-2" /> : null}
              </button>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}

function DishText({ item, labels, className }: { item: BoardItem; labels: BoardLabels; className?: string }) {
  return (
    <div className={className}>
      <div className="flex items-baseline">
        <h3 className="font-serif text-[clamp(1.5rem,2.2vw,2rem)] italic leading-[1.1]">{item.name}</h3>
        <span className="leader" aria-hidden="true" />
        <p className={cn('font-display whitespace-nowrap text-[1.75rem] leading-none', item.marketPrice && 'font-serif text-[1.0625rem] italic normal-case text-fg-2')}>{item.price}</p>
      </div>
      {item.description ? <p className="mt-2 max-w-[48ch] text-fg-2">{item.description}</p> : null}
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
