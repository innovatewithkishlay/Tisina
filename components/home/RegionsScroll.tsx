'use client';

import { useEffect, useRef, useState } from 'react';
import { m, useInView, useScroll, useTransform } from 'motion/react';
import { Img } from '@/components/ui/Img';
import { Kicker } from '@/components/ui/Kicker';
import { SplitReveal } from '@/components/motion/SplitReveal';
import { useCalm, useMedia, useParallaxScale } from '@/lib/motion';
import { cn } from '@/lib/utils';

export interface RegionStory {
  key: string;
  region: string;
  dish: string;
  body: string;
  alt: string;
  image: string;
  /** Words around the ring, e.g. "Istria · Fuži · Black truffle · ". */
  ring: string;
}

/**
 * Three regions, one table. One framed photograph holds still (left on
 * desktop, along the top on phones) while the regions scroll past; as each
 * one crosses the middle of the screen the new dish wipes up over the old
 * and settles from 1.08×. A ring of words turns around the frame and
 * changes with it. Behind each region a huge outlined numeral drifts slowly.
 */
export function RegionsScroll({ label, items }: { label: string; items: RegionStory[] }) {
  const [active, setActive] = useState(0);

  return (
    <section className="paper section" aria-labelledby="regions-label">
      <div className="wrap">
        <Kicker as="h2" className="!text-muted">
          <span id="regions-label">{label}</span>
        </Kicker>

        <div className="mt-10 grid gap-x-12 lg:mt-12 lg:grid-cols-12">
          {/* The still frame: sticky on every screen size. */}
          <div className="sticky top-[var(--header-h)] z-10 self-start bg-bg pb-5 pt-2 lg:col-span-6 lg:top-[calc(var(--header-h)+1.5rem)] lg:bg-transparent lg:p-0">
            <div className="relative">
              <div className="relative h-[45svh] w-full overflow-hidden rounded-[var(--radius-card)] bg-bg-2 lg:aspect-[4/5] lg:h-auto lg:max-h-[calc(100svh-var(--header-h)-3rem)]">
                {items.map((it, i) => (
                  <div
                    key={it.key}
                    className={cn(
                      'absolute inset-0 transition-[clip-path] duration-[1300ms] ease-[var(--ease-in-out)] motion-reduce:transition-opacity',
                      i <= active ? '[clip-path:inset(0_0_0_0)]' : '[clip-path:inset(100%_0_0_0)]',
                    )}
                    style={{ zIndex: i }}
                    aria-hidden={i !== active}
                  >
                    <Img
                      src={it.image}
                      alt={it.alt}
                      fill
                      sizes="(min-width: 1024px) 45vw, 100vw"
                      className={cn(
                        'object-cover transition-transform duration-[1600ms] ease-[var(--ease-out)]',
                        i === active ? 'scale-100' : 'scale-[1.08]',
                      )}
                    />
                  </div>
                ))}
                <p className="label absolute bottom-4 left-4 z-10 rounded-[var(--radius-pill)] bg-night/60 px-3 py-2 text-bone backdrop-blur lg:bottom-5 lg:left-5">
                  {items[active]?.dish}
                </p>
              </div>

            </div>
          </div>

          <div className="relative lg:col-span-5 lg:col-start-8">
            {items.map((it, i) => (
              <Region key={it.key} item={it} index={i} active={i === active} onEnter={() => setActive(i)} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Region({ item, index, active, onEnter }: { item: RegionStory; index: number; active: boolean; onEnter: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const calm = useCalm();
  const k = useParallaxScale();
  // "Crossing the middle": a hairline band across the centre of the screen —
  // lower on phones, where the top half belongs to the sticky photograph.
  const wide = useMedia('(min-width: 1024px)');
  const centred = useInView(ref, { margin: wide ? '-50% 0px -50% 0px' : '-74% 0px -26% 0px' });
  useEffect(() => {
    if (centred) onEnter();
  }, [centred, onEnter]);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const numeralY = useTransform(scrollYProgress, [0, 1], [`${40 * k}%`, `${-40 * k}%`]);

  return (
    <article
      ref={ref}
      className="relative flex min-h-[100svh] flex-col justify-start border-t hairline pb-14 pt-10 first:border-t-0 lg:min-h-[85svh] lg:justify-center lg:py-0"
    >
      <m.span
        aria-hidden="true"
        className="outline-text font-display pointer-events-none absolute -right-2 top-1/2 opacity-50 -z-0 -translate-y-1/2 select-none text-[clamp(10rem,28vw,24rem)] leading-none [-webkit-text-stroke-width:1px]"
        style={calm ? undefined : { y: numeralY }}
      >
        {String(index + 1).padStart(2, '0')}
      </m.span>
      <div className="relative">
        <SplitReveal
          as="h3"
          by="char"
          text={item.region}
          stagger={0.035}
          className={cn('font-display text-display mt-3 transition-[color] duration-700', active ? 'italic text-fg' : 'text-muted')}
        />
        <SplitReveal as="p" text={item.dish} delay={0.15} className="label mt-6 text-accent" />
        <p className="mt-4 max-w-[38ch] text-lede text-fg-2">{item.body}</p>
      </div>
    </article>
  );
}
