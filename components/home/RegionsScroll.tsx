'use client';

import { useRef, useState } from 'react';
import { Img } from '@/components/ui/Img';
import { Kicker } from '@/components/ui/Kicker';
import { ScrollTrigger, reducedMotion, useGSAP } from '@/components/motion/gsap';
import { cn } from '@/lib/utils';

export interface RegionStory {
  key: string;
  region: string;
  dish: string;
  body: string;
  alt: string;
  image: string;
}

/**
 * Sticky storytelling, scrolling vertically: on large screens one framed
 * photograph stays in place and changes as each region's text passes the
 * middle of the screen. On phones every region carries its own image.
 */
export function RegionsScroll({ label, items }: { label: string; items: RegionStory[] }) {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      const blocks = root.current?.querySelectorAll<HTMLElement>('[data-region]') ?? [];
      blocks.forEach((el, i) =>
        ScrollTrigger.create({
          trigger: el,
          start: 'top 55%',
          end: 'bottom 55%',
          onToggle: (self) => self.isActive && setActive(i),
        }),
      );
      if (reducedMotion()) return;
    },
    { scope: root },
  );

  return (
    <section ref={root} className="paper section" aria-labelledby="regions-label">
      <div className="wrap grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-12">
          <Kicker as="h2" className="!text-muted">
            <span id="regions-label">{label}</span>
          </Kicker>
        </div>

        {/* Sticky frame (desktop) */}
        <div className="hidden lg:col-span-6 lg:block">
          <div className="sticky top-[calc(var(--header-h)+1.5rem)] aspect-[4/5] max-h-[calc(100svh-var(--header-h)-3rem)] w-full overflow-hidden rounded-[var(--radius-card)] bg-bg-2">
            {items.map((it, i) => (
              <div
                key={it.key}
                className={cn(
                  'absolute inset-0 transition-[clip-path,transform] duration-[1200ms] ease-[var(--ease-in-out)]',
                  i === active ? '[clip-path:inset(0_0_0_0)]' : i < active ? '[clip-path:inset(0_0_100%_0)]' : '[clip-path:inset(100%_0_0_0)]',
                )}
                style={{ zIndex: i === active ? 2 : 1 }}
              >
                <Img
                  src={it.image}
                  alt={it.alt}
                  fill
                  sizes="45vw"
                  className={cn('object-cover transition-transform duration-[1600ms] ease-[var(--ease-out)]', i === active ? 'scale-100' : 'scale-125')}
                />
              </div>
            ))}
            <p className="label absolute bottom-5 left-5 z-10 rounded-[var(--radius-pill)] bg-night/60 px-3 py-2 text-bone backdrop-blur">
              {items[active]?.dish}
            </p>
          </div>
        </div>

        <div className="lg:col-span-5 lg:col-start-8">
          {items.map((it, i) => (
            <article
              key={it.key}
              data-region
              className="flex flex-col justify-center border-t hairline py-14 first:border-t-0 lg:min-h-[85svh] lg:py-0"
            >
              <div className="relative mb-8 aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] lg:hidden">
                <Img src={it.image} alt={it.alt} fill sizes="100vw" className="object-cover" />
              </div>
              <h3
                className={cn(
                  'font-display text-display mt-3 transition-[color,font-style] duration-700',
                  i === active ? 'italic text-fg' : 'text-muted lg:text-muted',
                )}
              >
                {it.region}
              </h3>
              <p className="label mt-6 text-accent">{it.dish}</p>
              <p className="mt-4 max-w-[38ch] text-lede text-fg-2">{it.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
