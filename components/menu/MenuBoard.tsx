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
 * The menu as a scrolling board. Desktop: a framed photograph stays pinned on
 * the left and wipes to whichever course or dish is in front of you; course
 * titles are drawn in outline and fill with ink as they cross the screen.
 * A floating dock at the bottom jumps between courses and filters by diet.
 */
export function MenuBoard({ categories, labels }: { categories: BoardCategory[]; labels: BoardLabels }) {
  const root = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const [filter, setFilter] = useState<Filter>('all');
  const [activeCat, setActiveCat] = useState(0);
  const [dock, setDock] = useState(false);
  const [activeSrc, setActiveSrc] = useState<string | undefined>(categories[0]?.image);

  const tags = useMemo(() => {
    const seen = new Set<DietaryTag>();
    categories.forEach((c) => c.items.forEach((i) => i.dietary.forEach((d) => seen.add(d))));
    return (['vegetarian', 'vegan', 'gluten_free', 'dairy_free', 'pescatarian'] as const).filter((d) => seen.has(d));
  }, [categories]);

  const visible = useMemo(
    () =>
      categories.map((c) => ({
        ...c,
        items: c.items.filter((i) => filter === 'all' || i.dietary.includes(filter)),
      })),
    [categories, filter],
  );
  const count = visible.reduce((n, c) => n + c.items.length, 0);

  const frames = useMemo(() => {
    const srcs = new Set<string>();
    categories.forEach((c) => {
      srcs.add(c.image);
      c.items.forEach((i) => i.image && srcs.add(i.image));
    });
    return [...srcs];
  }, [categories]);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      ScrollTrigger.create({ trigger: el, start: 'top 65%', end: 'bottom 95%', onToggle: (self) => setDock(self.isActive) });
      el.querySelectorAll<HTMLElement>('[data-cat]').forEach((section) => {
        const i = Number(section.dataset.cat);
        ScrollTrigger.create({
          trigger: section,
          start: 'top 55%',
          end: 'bottom 55%',
          onToggle: (self) => {
            if (!self.isActive) return;
            setActiveCat(i);
            setActiveSrc(categories[i]?.image);
          },
        });
      });
      el.querySelectorAll<HTMLElement>('[data-row-img]').forEach((row) =>
        ScrollTrigger.create({
          trigger: row,
          start: 'top 50%',
          end: 'bottom 50%',
          onToggle: (self) => self.isActive && setActiveSrc(row.dataset.rowImg),
        }),
      );

      if (reducedMotion()) return;
      el.querySelectorAll<HTMLElement>('[data-fill]').forEach((fill) =>
        gsap.fromTo(
          fill,
          { clipPath: 'inset(0% 100% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: fill, start: 'top 88%', end: 'top 38%', scrub: true } },
        ),
      );
      ScrollTrigger.batch(el.querySelectorAll('[data-row]'), {
        start: 'top 92%',
        once: true,
        onEnter: (batch) => gsap.fromTo(batch, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.07, ease: 'power3.out' }),
      });
      el.querySelectorAll<HTMLElement>('[data-cat-img] img').forEach((img) =>
        gsap.fromTo(img, { yPercent: -8, scale: 1.15 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }),
      );
    },
    { scope: root, dependencies: [categories] },
  );

  const changeFilter = (f: Filter) => {
    setFilter(f);
    // Layout changed: let the browser reflow, then re-measure every trigger.
    requestAnimationFrame(() => {
      root.current?.querySelectorAll<HTMLElement>('[data-row]').forEach((r) => {
        r.style.opacity = '';
        r.style.transform = '';
      });
      ScrollTrigger.refresh();
    });
  };

  const jump = (slug: string) => {
    const target = document.getElementById(`c-${slug}`);
    if (!target) return;
    if (lenis) lenis.scrollTo(target, { offset: -24, duration: 1.4 });
    else target.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' });
    document.getElementById('menu-courses')?.hidePopover?.();
  };

  const current = visible[activeCat] ?? visible[0];

  return (
    <div ref={root} className="paper relative">
      <div className="wrap grid gap-x-12 lg:grid-cols-12">
        {/* Pinned photograph (desktop) */}
        <div className="hidden lg:col-span-5 lg:block" aria-hidden="true">
          <div className="sticky top-0 flex h-[100svh] items-center py-[calc(var(--header-h)+1rem)]">
            <div className="relative h-full max-h-[46rem] w-full overflow-hidden rounded-[var(--radius-card)] bg-bg-2">
              {frames.map((src) => (
                <div
                  key={src}
                  className="absolute inset-0 transition-[clip-path] duration-[1100ms] ease-[var(--ease-in-out)]"
                  style={{ clipPath: src === activeSrc ? 'inset(0% 0% 0% 0%)' : 'inset(100% 0% 0% 0%)', zIndex: src === activeSrc ? 2 : 1 }}
                >
                  <Img
                    src={src}
                    alt=""
                    fill
                    sizes="40vw"
                    className={cn(
                      'object-cover transition-transform duration-[1600ms] ease-[var(--ease-out)]',
                      src === activeSrc ? 'scale-100' : 'scale-125',
                    )}
                  />
                </div>
              ))}
              <div className="absolute inset-0 z-[3] bg-[linear-gradient(0deg,rgb(15_13_11/0.6),transparent_40%)]" />
              <p className="absolute inset-x-6 bottom-6 z-[4] flex items-baseline justify-between gap-4 text-bone">
                <span className="font-display text-h3 italic">{current?.name}</span>
                <span className="index text-lede tabular-nums">
                  ({String(activeCat + 1).padStart(2, '0')}/{String(categories.length).padStart(2, '0')})
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Courses */}
        <div className="pb-[var(--section)] lg:col-span-7">
          <p className="sr-only" aria-live="polite">
            {(count === 1 ? labels.countOne : labels.countOther).replace('#', String(count))}
          </p>
          {visible.map((c, ci) => (
            <section
              key={c.slug}
              id={`c-${c.slug}`}
              data-cat={ci}
              aria-labelledby={`h-${c.slug}`}
              className={cn('scroll-mt-8 pt-[clamp(5rem,12vw,10rem)]', c.items.length === 0 && filter !== 'all' && 'hidden')}
            >
              <div className="flex items-start gap-4">
                <span className="index mt-[0.4em] shrink-0 text-lede text-muted tabular-nums">({String(ci + 1).padStart(2, '0')})</span>
                <h2 id={`h-${c.slug}`} className="relative font-display text-[clamp(3.25rem,8.4vw,9rem)] leading-[0.88] tracking-[-0.03em]">
                  <span className="outline-text block [-webkit-text-stroke-width:1.2px]">{c.name}</span>
                  <span data-fill aria-hidden="true" className="absolute inset-0 block italic text-fg">
                    {c.name}
                  </span>
                </h2>
              </div>
              {c.description ? <p className="mt-6 max-w-[48ch] pl-[3.25rem] text-lede text-fg-2">{c.description}</p> : null}

              <div data-cat-img className="relative mt-10 aspect-[16/10] overflow-hidden rounded-[var(--radius-card)] lg:hidden">
                <Img src={c.image} alt="" fill sizes="100vw" className="object-cover" />
              </div>

              <ul className="mt-10 border-t hairline">
                {c.items.map((item) => (
                  <li
                    key={item.slug}
                    id={item.slug}
                    data-row
                    data-row-img={item.image}
                    onPointerEnter={() => setActiveSrc(item.image ?? c.image)}
                    onFocus={() => setActiveSrc(item.image ?? c.image)}
                    className={cn('group scroll-mt-32 border-b hairline py-7', !item.available && 'opacity-55')}
                  >
                    <div className="flex items-baseline">
                      <h3 className="font-display text-[clamp(1.5rem,2.4vw,2.125rem)] leading-[1.1] transition-[color,transform] duration-500 ease-[var(--ease-out)] group-hover:translate-x-2 group-hover:italic group-hover:text-accent">
                        {item.name}
                      </h3>
                      <span className="leader" aria-hidden="true" />
                      <p className={cn('font-display whitespace-nowrap text-[1.5rem] tabular-nums', item.marketPrice && 'text-[1.125rem] italic text-fg-2')}>
                        {item.price}
                      </p>
                    </div>
                    <div className="mt-2 flex gap-4">
                      {item.image && item.image !== c.image ? (
                        <div className="relative size-16 shrink-0 overflow-hidden rounded-full lg:hidden">
                          <Img src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                        </div>
                      ) : null}
                      <div className="min-w-0">
                        {item.featured || item.seasonal || !item.available ? (
                          <p className="mb-2 flex flex-wrap gap-2">
                            {!item.available ? <Tag>{labels.unavailable}</Tag> : null}
                            {item.featured ? <Tag>{labels.signature}</Tag> : null}
                            {item.seasonal ? <Tag>{labels.seasonal}</Tag> : null}
                          </p>
                        ) : null}
                        {item.description ? <p className="max-w-[54ch] text-fg-2">{item.description}</p> : null}
                        {item.dietary.length || item.allergens.length ? (
                          <dl className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-small text-muted">
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
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          {count === 0 ? <p className="pt-24 text-lede text-fg-2">{labels.noMatch}</p> : null}
        </div>
      </div>

      {/* Floating dock: courses + diet filter */}
      <div
        inert={!dock}
        className={cn(
          'pointer-events-none sticky bottom-4 z-40 mt-[-5rem] flex justify-center px-[var(--gutter)] pb-2 transition-[opacity,transform] duration-700 ease-[var(--ease-out)]',
          dock ? 'opacity-100' : 'translate-y-[140%] opacity-0',
        )}
      >
        <div className="night pointer-events-auto flex max-w-full items-center gap-1 rounded-[var(--radius-pill)] border border-white/10 bg-night/85 p-1.5 shadow-[var(--shadow-float)] backdrop-blur-md">
          <button
            type="button"
            popoverTarget="menu-courses"
            className="label flex min-h-11 shrink-0 items-center gap-2.5 rounded-[var(--radius-pill)] bg-bone px-4 text-night"
            aria-label={`${labels.jumpTo}: ${current?.name ?? ''}`}
          >
            <span className="index text-[1.2em] normal-case tabular-nums">{String(activeCat + 1).padStart(2, '0')}</span>
            <span className="max-w-[9rem] truncate sm:max-w-[12rem]">{current?.name}</span>
            <svg viewBox="0 0 10 6" className="size-2.5" aria-hidden="true">
              <path d="M1 5 L5 1 L9 5" fill="none" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </button>
          <div role="group" aria-label={labels.filterLabel} className="no-scrollbar flex min-w-0 gap-1 overflow-x-auto">
            {(['all', ...tags] as Filter[]).map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={filter === f}
                onClick={() => changeFilter(f)}
                className={cn(
                  'label min-h-11 shrink-0 rounded-[var(--radius-pill)] px-3.5 transition-colors duration-300',
                  filter === f ? 'bg-accent text-on-accent' : 'text-bone/75 hover:text-bone',
                )}
              >
                {f === 'all' ? labels.filterAll : labels.dietary[f]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <nav
        id="menu-courses"
        popover="auto"
        aria-label={labels.jumpTo}
        className="night m-0 mx-auto mb-[5.5rem] mt-auto w-[min(26rem,calc(100vw-2*var(--gutter)))] rounded-[var(--radius-card)] border border-white/10 p-3 shadow-[var(--shadow-float)] backdrop:bg-night/40"
        data-lenis-prevent
      >
        <ol>
          {visible.map((c, i) => (
            <li key={c.slug} className={cn(c.items.length === 0 && filter !== 'all' && 'hidden')}>
              <button
                type="button"
                onClick={() => jump(c.slug)}
                className={cn(
                  'flex min-h-11 w-full items-baseline gap-4 rounded-xl px-3 py-2 text-left transition-colors hover:bg-white/5',
                  i === activeCat && 'text-accent',
                )}
              >
                <span className="index w-7 text-muted tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                <span className="font-display text-[1.5rem] leading-tight">{c.name}</span>
                {i === activeCat ? <Hacek className="ml-auto h-2" /> : null}
              </button>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="label inline-flex items-center rounded-[var(--radius-pill)] border border-current px-2.5 py-1 text-[0.6875rem] text-accent">
      {children}
    </span>
  );
}
