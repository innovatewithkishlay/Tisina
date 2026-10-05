'use client';

import { useRef } from 'react';
import { Img } from '@/components/ui/Img';
import { gsap, reducedMotion, useGSAP } from '@/components/motion/gsap';

/**
 * Menu opening: the plates hang on a cylinder in 3D space around a giant
 * title. Scrolling turns the ring a full revolution while it tilts towards
 * you, then the whole scene drops away into the courses.
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
  const n = plates.length;
  // Radius that spaces n cards evenly around the cylinder, with a little air.
  const k = (0.5 / Math.tan(Math.PI / n)) * 1.18;

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom bottom', scrub: 0.8 },
      });
      tl.fromTo('[data-ring]', { rotateY: 0, rotateX: -6 }, { rotateY: -360 + 360 / n, rotateX: 4, ease: 'none' }, 0)
        .fromTo('[data-ring-wrap]', { scale: 0.92, yPercent: 0 }, { scale: 1.08, yPercent: -4, ease: 'none' }, 0)
        .fromTo('[data-menu-word="0"]', { xPercent: 0 }, { xPercent: -18, ease: 'none' }, 0)
        .fromTo('[data-menu-word="1"]', { xPercent: 0 }, { xPercent: 18, ease: 'none' }, 0)
        .to('[data-menu-intro]', { opacity: 0, y: -40, ease: 'none', duration: 0.25 }, 0.05);
      gsap.from('[data-ring-card] > [data-ring-face]', { opacity: 0, scale: 0.55, stagger: 0.06, duration: 1.4, ease: 'expo.out', delay: 0.2 });
    },
    { scope: root },
  );

  const words = title.split(' ');
  const firstLine = words.length > 1 ? words.slice(0, Math.ceil(words.length / 2)).join(' ') : title;
  const secondLine = words.length > 1 ? words.slice(Math.ceil(words.length / 2)).join(' ') : '';

  return (
    <section ref={root} className="night relative h-[280svh]" aria-labelledby="menu-title">
      <div className="sticky top-0 h-[100svh] overflow-hidden pt-[var(--header-h)]">
        {/* Giant title behind the ring */}
        <h1
          id="menu-title"
          className="font-display pointer-events-none absolute inset-x-0 top-1/2 z-0 -translate-y-1/2 select-none text-center text-[clamp(6rem,24vw,30rem)] leading-[0.8] text-bone max-sm:top-[calc(var(--header-h)+1.5rem)] max-sm:translate-y-0 max-sm:text-[31vw]"
        >
          <span data-menu-word="0" className="block">{firstLine}</span>
          {secondLine ? (
            <span data-menu-word="1" className="block text-transparent [-webkit-text-stroke:1.5px_var(--brand-bone)]">
              {secondLine}
            </span>
          ) : null}
        </h1>

        {/* The ring */}
        <div
          data-ring-wrap
          aria-hidden="true"
          className="absolute inset-0 z-10 flex items-center justify-center [perspective:1600px] [perspective-origin:50%_40%] max-sm:pt-[18svh]"
        >
          <div
            data-ring
            className="relative aspect-[3/4] w-[var(--card-w)] [--card-w:min(26vw,17rem)] [transform-style:preserve-3d] max-sm:[--card-w:40vw]"
            style={{ ['--ring-r' as string]: `calc(var(--card-w) * ${k.toFixed(3)})` }}
          >
            {plates.map((p, i) => (
              <div
                key={p.src}
                data-ring-card
                className="absolute inset-0 overflow-hidden rounded-[18px] shadow-[0_30px_80px_-20px_rgb(0_0_0/0.8)]"
                style={{ transform: `rotateY(${(360 / n) * i}deg) translateZ(var(--ring-r))` }}
              >
                <div data-ring-face className="absolute inset-0">
                  <Img src={p.src} alt="" fill priority={i < 2} sizes="(min-width: 768px) 17rem, 40vw" className="object-cover" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Intro copy */}
        <div data-menu-intro className="wrap absolute inset-x-0 bottom-8 z-20 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-[36ch]">
            <p className="label text-accent">{eyebrow}</p>
            <p className="mt-3 text-lede text-bone">{lede}</p>
          </div>
          <p className="font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-none text-bone">{count}</p>
        </div>
      </div>
    </section>
  );
}
