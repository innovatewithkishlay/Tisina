'use client';

import { useRef } from 'react';
import { Img } from '@/components/ui/Img';
import { Kicker } from '@/components/ui/Kicker';
import { gsap, reducedMotion, useGSAP } from '@/components/motion/gsap';

/**
 * Menu opening: the title fills the screen letter by letter while three plates
 * sit stacked in front of it. Scrolling deals the plates out like cards and
 * lifts the title away.
 */
export function MenuHero({
  eyebrow,
  title,
  lede,
  count,
  plates,
}: {
  eyebrow: string;
  title: string;
  lede: string;
  count: string;
  plates: { src: string; alt: string }[];
}) {
  const root = useRef<HTMLElement>(null);
  const letters = Array.from(title);
  // Instrument Serif averages ~0.46em per glyph: size the word to the viewport.
  const size = `min(${(94 / (letters.length * 0.46)).toFixed(2)}vw, 34svh)`;

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const st = { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true };
      const fan = [
        { xPercent: -95, rotate: -16, yPercent: -12 },
        { xPercent: 0, rotate: 0, yPercent: -40 },
        { xPercent: 95, rotate: 16, yPercent: -12 },
      ];
      gsap.utils.toArray<HTMLElement>('[data-plate]').forEach((el, i) =>
        gsap.to(el, { ...fan[i % 3], ease: 'none', scrollTrigger: st }),
      );
      gsap.to('[data-menu-title]', { yPercent: -35, letterSpacing: '0.04em', opacity: 0.2, ease: 'none', scrollTrigger: st });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="night relative flex min-h-[100svh] flex-col overflow-hidden pt-[var(--header-h)]">
      <div className="relative flex flex-1 items-center justify-center">
        {/* Plates, stacked */}
        <div className="relative z-10 aspect-[4/5] w-[min(54vw,19rem)]" aria-hidden="true">
          {plates.slice(0, 3).map((p, i) => (
            <div
              key={p.src}
              data-plate
              className="rise absolute inset-0 overflow-hidden rounded-[var(--radius-card)] shadow-[var(--shadow-float)]"
              style={{ rotate: `${(i - 1) * 6}deg`, zIndex: i === 1 ? 2 : 1, ['--delay' as string]: 250 + i * 120 }}
            >
              <Img src={p.src} alt="" fill priority={i === 1} sizes="(min-width: 768px) 19rem, 54vw" className="object-cover" />
            </div>
          ))}
        </div>

        <h1
          data-menu-title
          className="pointer-events-none absolute inset-x-0 top-1/2 z-20 -translate-y-1/2 text-center font-display leading-[0.8] tracking-[-0.03em] text-bone mix-blend-difference"
          style={{ fontSize: size }}
        >
          <span className="sr-only">{title}</span>
          <span aria-hidden="true" className="inline-flex">
            {letters.map((l, i) => (
              <span key={i} className="inline-block overflow-hidden pb-[0.08em]">
                <span className="letter-rise inline-block" style={{ ['--i' as string]: i }}>
                  {l === ' ' ? ' ' : l}
                </span>
              </span>
            ))}
          </span>
        </h1>
      </div>

      <div className="wrap relative z-20 grid gap-6 pb-10 md:grid-cols-12 md:items-end">
        <Kicker className="rise md:col-span-3" index={undefined}>
          {eyebrow}
        </Kicker>
        <p className="rise max-w-[44ch] text-fg-2 md:col-span-5 md:col-start-5" style={{ ['--delay' as string]: 500 }}>
          {lede}
        </p>
        <p className="rise index text-h3 md:col-span-3 md:col-start-10 md:text-right" style={{ ['--delay' as string]: 600 }}>
          {count}
        </p>
      </div>
    </section>
  );
}
