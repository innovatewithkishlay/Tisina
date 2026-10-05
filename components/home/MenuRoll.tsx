'use client';

import { useRef, useState } from 'react';
import { Link } from '@/i18n/routing';
import { Img } from '@/components/ui/Img';
import { Kicker } from '@/components/ui/Kicker';
import { ScrollTrigger, gsap, reducedMotion, useGSAP } from '@/components/motion/gsap';
import { cn } from '@/lib/utils';

export interface RollDish {
  slug: string;
  name: string;
  category: string;
  description?: string;
  price: string;
  image: string;
}

/**
 * The menu as a vertical roll: dish names pass through the centre of the
 * screen in huge type; whichever sits in the middle lights up and its photo
 * takes over the frame behind it.
 */
export function MenuRoll({ label, title, cta, dishes }: { label: string; title: string; cta: string; dishes: RollDish[] }) {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      root.current?.querySelectorAll<HTMLElement>('[data-roll-item]').forEach((el, i) =>
        ScrollTrigger.create({
          trigger: el,
          start: 'top 52%',
          end: 'bottom 52%',
          onToggle: (self) => self.isActive && setActive(i),
        }),
      );
      if (reducedMotion()) return;
      gsap.fromTo(
        '[data-roll-frame]',
        { scale: 0.86, borderRadius: 40 },
        { scale: 1, borderRadius: 0, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'top top', scrub: true } },
      );
    },
    { scope: root },
  );

  return (
    <section ref={root} className="night relative" aria-labelledby="roll-title">
      {/* Backdrop that follows the active dish */}
      <div className="sticky top-0 -mb-[100svh] h-[100svh] overflow-hidden" aria-hidden="true">
        <div data-roll-frame className="absolute inset-0 overflow-hidden">
          {dishes.map((d, i) => (
            <Img
              key={d.slug}
              src={d.image}
              alt=""
              fill
              sizes="100vw"
              className={cn(
                'object-cover transition-[opacity,transform,filter] duration-[1100ms] ease-[var(--ease-out)]',
                i === active ? 'scale-100 opacity-100' : 'scale-110 opacity-0',
              )}
            />
          ))}
          <div className="absolute inset-0 bg-night/70" />
        </div>
      </div>

      <div className="relative z-10">
        <div className="wrap flex min-h-[60svh] flex-col justify-end pb-16 pt-[var(--section)]">
          <Kicker>{label}</Kicker>
          <h2 id="roll-title" className="font-display text-h1 mt-6 max-w-[16ch]">
            {title}
          </h2>
        </div>

        <ol className="wrap pb-[40svh]">
          {dishes.map((d, i) => (
            <li key={d.slug} data-roll-item className="py-[6svh]">
              <Link href={{ pathname: '/menu', hash: d.slug }} className="group grid gap-3 md:grid-cols-12 md:items-baseline">
                <span className={cn('label transition-colors duration-500 md:col-span-2', i === active ? 'text-accent' : 'text-muted')}>
                  {d.category}
                </span>
                <span
                  className={cn(
                    'font-display text-[clamp(2.5rem,7.5vw,7.5rem)] leading-[0.95] tracking-[-0.02em] transition-[color,font-style] duration-500 md:col-span-8',
                    i === active ? 'italic text-bone' : 'text-bone/50',
                  )}
                >
                  {d.name}
                </span>
                <span className={cn('font-display text-h3 tabular-nums transition-colors duration-500 md:col-span-2 md:text-right', i === active ? 'text-bone' : 'text-muted')}>
                  {d.price}
                </span>
                {d.description ? (
                  <span
                    className={cn(
                      'max-w-[46ch] text-bone/80 transition-[opacity,max-height] duration-700 md:col-span-6 md:col-start-3',
                      i === active ? 'max-h-40 opacity-100' : 'max-h-0 overflow-hidden opacity-0',
                    )}
                  >
                    {d.description}
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ol>

        <div className="wrap pb-[var(--section)]">
          <Link
            href="/menu"
            className="btn-fill label inline-flex min-h-14 items-center gap-4 rounded-[var(--radius-pill)] bg-bone px-8 text-night [--btn-fill:var(--brand-ember-light)]"
          >
            {cta} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
