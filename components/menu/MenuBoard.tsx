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

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      el.querySelectorAll<HTMLElement>('[data-cat]').forEach((section) => {
        const i = Number(section.dataset.cat);
        ScrollTrigger.create({
          trigger: section,
          start: 'top 55%',
          end: 'bottom 55%',
          onToggle: (self) => {
            if (!self.isActive) return;
            setActiveCat(i);
          },
        });
      });

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
        {/* Courses */}
        <div className="pb-[var(--section)] lg:col-span-8 lg:col-start-3 relative">
          
          {/* Elegant Sticky Filters */}
          <div className="sticky top-[calc(var(--header-h))] z-40 mb-12 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b hairline bg-paper pb-4 pt-6">
            <button popoverTarget="menu-courses" className="label flex shrink-0 items-center gap-2 text-fg hover:text-accent transition-colors">
               <span className="index text-[1.2em] tabular-nums">{String(activeCat + 1).padStart(2, '0')}</span>
               <span className="uppercase tracking-widest">{current?.name}</span>
               <svg viewBox="0 0 10 6" className="size-2.5 ml-1" aria-hidden="true"><path d="M1 5 L5 1 L9 5" fill="none" stroke="currentColor" strokeWidth="1.4" /></svg>
            </button>
            <div className="no-scrollbar flex gap-6 overflow-x-auto text-label">
              {(['all', ...tags] as Filter[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  aria-pressed={filter === f}
                  onClick={() => changeFilter(f)}
                  className={cn(
                    'transition-colors duration-300 whitespace-nowrap pb-1 border-b-[1.5px]',
                    filter === f ? 'border-accent text-accent' : 'border-transparent text-fg-2 hover:text-fg',
                  )}
                >
                  {f === 'all' ? labels.filterAll : labels.dietary[f]}
                </button>
              ))}
            </div>
          </div>

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


              <ul className="mt-10 border-t hairline">
                {c.items.map((item) => (
                  <li
                    key={item.slug}
                    id={item.slug}
                    data-row
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
                    <div className="mt-4 flex gap-6">

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



      <nav
        id="menu-courses"
        popover="auto"
        aria-label={labels.jumpTo}
        className="night m-0 mx-auto mt-[calc(var(--header-h)+6rem)] mb-auto w-[min(26rem,calc(100vw-2*var(--gutter)))] rounded-[var(--radius-card)] border border-white/10 p-3 shadow-[var(--shadow-float)] backdrop:bg-night/40"
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
