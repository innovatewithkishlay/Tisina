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
}: {
  eyebrow: string;
  title: string;
  lede: string;
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

      <div className="relative mt-[clamp(4rem,10vw,8rem)] flex w-full overflow-hidden border-y hairline py-4 sm:py-6" aria-hidden="true">
        <div className="marquee flex w-max items-center">
          <div className="flex items-center gap-8 px-4 text-[clamp(4rem,10vw,8rem)] font-display uppercase leading-none tracking-tighter text-fg-2/10">
            <span>TIŠINA</span><span className="text-accent">*</span>
            <span>{title}</span><span className="text-accent">*</span>
            <span>À LA CARTE</span><span className="text-accent">*</span>
            <span>TIŠINA</span><span className="text-accent">*</span>
            <span>{title}</span><span className="text-accent">*</span>
            <span>À LA CARTE</span><span className="text-accent">*</span>
          </div>
          <div className="flex items-center gap-8 px-4 text-[clamp(4rem,10vw,8rem)] font-display uppercase leading-none tracking-tighter text-fg-2/10">
            <span>TIŠINA</span><span className="text-accent">*</span>
            <span>{title}</span><span className="text-accent">*</span>
            <span>À LA CARTE</span><span className="text-accent">*</span>
            <span>TIŠINA</span><span className="text-accent">*</span>
            <span>{title}</span><span className="text-accent">*</span>
            <span>À LA CARTE</span><span className="text-accent">*</span>
          </div>
        </div>
      </div>
    </section>
  );
}
