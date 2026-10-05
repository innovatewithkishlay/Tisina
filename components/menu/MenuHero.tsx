'use client';

import { useRef } from 'react';
import { m, useScroll, useTransform } from 'motion/react';
import { Img } from '@/components/ui/Img';
import { useCalm, useParallaxScale } from '@/lib/motion';

/**
 * Menu opening: one large word, a short promise, and three plates that rise
 * into place. On scroll the plates drift at different speeds — nothing more.
 */
export function MenuHero({
  eyebrow,
  title,
  lede,
  plates,
}: {
  eyebrow: string;
  title: string;
  lede: string;
  plates: { src: string; alt: string }[];
}) {
  const root = useRef<HTMLElement>(null);

  const calm = useCalm();
  const k = useParallaxScale();
  const { scrollYProgress } = useScroll({ target: root, offset: ['start start', 'end start'] });
  const y0 = useTransform(scrollYProgress, [0, 1], ['0%', `${-14 * k}%`]);
  const y1 = useTransform(scrollYProgress, [0, 1], ['0%', `${10 * k}%`]);
  const y2 = useTransform(scrollYProgress, [0, 1], ['0%', `${-22 * k}%`]);
  const drift = [y0, y1, y2];

  return (
    <section ref={root} className="night relative overflow-hidden pb-[clamp(4rem,8vw,7rem)] pt-[calc(var(--header-h)+clamp(3rem,7vw,6rem))]">
      <div className="wrap grid gap-10 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <p className="label rise text-accent">{eyebrow}</p>
          <h1 className="font-display rise mt-5 text-[clamp(4.5rem,13vw,13rem)] leading-[0.9] tracking-[-0.03em]" style={{ ['--delay' as string]: 100 }}>
            {title}
          </h1>
        </div>
        <p className="font-display rise max-w-[30ch] text-[clamp(1.375rem,2vw,1.875rem)] italic leading-[1.3] text-fg-2 lg:col-span-4 lg:col-start-9 lg:pb-6" style={{ ['--delay' as string]: 250 }}>
          {lede}
        </p>
      </div>

      <div className="wrap mt-[clamp(3rem,6vw,5rem)] grid grid-cols-3 items-start gap-3 sm:gap-6" aria-hidden="true">
        {plates.slice(0, 3).map((p, i) => (
          <m.div key={p.src} style={calm ? undefined : { y: drift[i] }}>
            <div
              className="plate-rise relative overflow-hidden rounded-[clamp(12px,1.6vw,22px)]"
              style={{
                aspectRatio: i === 1 ? '4 / 5' : '3 / 4',
                marginTop: i === 1 ? 0 : 'clamp(2rem, 6vw, 6rem)',
                ['--delay' as string]: `${0.15 + i * 0.14}s`,
              }}
            >
              <Img src={p.src} alt="" fill priority={i === 1} sizes="33vw" className="object-cover" />
            </div>
          </m.div>
        ))}
      </div>
    </section>
  );
}
