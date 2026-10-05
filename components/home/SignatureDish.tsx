'use client';

import { useRef, useState } from 'react';
import { m, useMotionTemplate, useMotionValueEvent, useScroll, useTransform } from 'motion/react';
import { Link } from '@/i18n/routing';
import { Img } from '@/components/ui/Img';
import { Kicker } from '@/components/ui/Kicker';
import { CircularText } from '@/components/motion/CircularText';
import { Counter } from '@/components/motion/Counter';
import { SplitReveal } from '@/components/motion/SplitReveal';
import { useCalm, useDesktop } from '@/lib/motion';
import { cn } from '@/lib/utils';

interface SignatureDishProps {
  label: string;
  name: string;
  description?: string;
  /** `*word*` is set in italic. */
  note: string;
  price?: string;
  stamp: string;
  image: { src: string; alt: string };
  cta: string;
  cursorView: string;
}

/**
 * Zoom-through: the dish starts as a small card in the middle of a dark
 * screen and opens until it fills it edge to edge — pinned for a screen and a
 * half on desktop, a shorter unpinned opening on phones. Only once it is
 * full-bleed does the type arrive over a scrim: eyebrow, the name line by
 * line, the price rolling up, then the line about the first night and the
 * last. Heat rises faintly off the peka on desktop.
 */
export function SignatureDish({ label, name, description, note, price, stamp, image, cta, cursorView }: SignatureDishProps) {
  const root = useRef<HTMLElement>(null);
  const calm = useCalm();
  const desktop = useDesktop();
  const [open, setOpen] = useState(false);

  const { scrollYProgress } = useScroll({
    target: root,
    offset: desktop ? ['start start', 'end end'] : ['start 90%', 'start start'],
  });
  // Desktop: open over the first 70% of the pin, then hold full-bleed.
  const p = useTransform(scrollYProgress, desktop ? [0, 0.7] : [0, 1], [0, 1], { clamp: true });
  const q = useTransform(p, (v) => 1 - v);
  const r = useTransform(p, [0, 1], [24, 0]);
  const clipPath = useMotionTemplate`inset(calc((50% - var(--ch)) * ${q}) calc(var(--cx) * ${q}) calc((50% - var(--ch)) * ${q}) calc(var(--cx) * ${q}) round ${r}px)`;
  const scale = useTransform(p, [0, 1], [1.3, 1]);
  const scrim = useTransform(p, [0.6, 1], [0, 1]);

  useMotionValueEvent(p, 'change', (v) => {
    if (v > 0.9 && !open) setOpen(true);
  });
  const show = open || calm;

  return (
    <section
      ref={root}
      className="night relative md:h-[250svh] md:motion-reduce:h-auto"
      aria-labelledby="signature-title"
    >
      <div className="relative h-[100svh] min-h-[36rem] overflow-hidden md:sticky md:top-0 md:motion-reduce:static">
        <m.div
          className="absolute inset-0 overflow-hidden [--ch:43.75vw] [--cx:15%] md:[--ch:25vw] md:[--cx:30%]"
          style={calm ? undefined : { clipPath }}
          data-cursor={cursorView}
        >
          <m.div className="absolute inset-0" style={calm ? undefined : { scale }}>
            <Img src={image.src} alt={image.alt} fill sizes="100vw" className="object-cover" />
          </m.div>
          <m.div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(180deg,rgb(15_28_22/0.55)_0%,rgb(15_28_22/0.1)_35%,rgb(15_28_22/0.92)_100%)]"
            style={calm ? undefined : { opacity: scrim }}
          />
          <div className="steam pointer-events-none absolute inset-0" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} style={{ ['--i' as string]: i, left: `${22 + i * 16}%` }} />
            ))}
          </div>
        </m.div>

        <div className="wrap relative z-10 flex h-full flex-col justify-end pb-[clamp(2rem,6vw,4.5rem)] text-bone">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-4xl">
              <div className={cn('transition-[opacity,transform] duration-700 ease-[var(--ease-out)]', show ? 'opacity-100' : 'js:translate-y-4 js:opacity-0')}>
                <Kicker className="text-bone/80">{label}</Kicker>
              </div>
              <SplitReveal
                as="h2"
                id="signature-title"
                by="line"
                text={name}
                play={show}
                delay={0.1}
                className="font-display mt-5 text-[clamp(3.25rem,9vw,8.5rem)] italic leading-[0.88] tracking-[-0.02em]"
              />
            </div>
            {price ? (
              <p className="font-display text-[clamp(2.5rem,5vw,4rem)] leading-none">
                <Counter value={price} play={show} delay={0.35} />
              </p>
            ) : null}
          </div>

          <div className="mt-8 grid gap-6 border-t border-bone/20 pt-8 md:mt-10 md:grid-cols-12 md:gap-8 md:pt-10">
            <SplitReveal
              as="blockquote"
              text={`“${note}”`}
              play={show}
              delay={0.5}
              stagger={0.05}
              emClassName="italic text-[var(--brand-ember-light)]"
              className="font-display text-[clamp(1.5rem,3.2vw,2.6rem)] leading-tight text-bone/90 md:col-span-7"
            />
            <div
              className={cn(
                'flex flex-col justify-between gap-6 transition-[opacity,transform] delay-[900ms] duration-700 ease-[var(--ease-out)] md:col-span-4 md:col-start-9',
                show ? 'opacity-100' : 'js:translate-y-4 js:opacity-0',
              )}
            >
              {description ? <p className="text-lede text-bone/75">{description}</p> : null}
              <Link href="/menu" className="label link-draw inline-flex w-fit items-center gap-3">
                {cta} <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* The stamp: since the first night, under the peka, for two. */}
        <CircularText
          texts={[stamp]}
          period={48}
          className={cn(
            'absolute right-[var(--gutter)] top-[calc(var(--header-h)+1.5rem)] z-10 size-[96px] text-bone transition-opacity duration-1000 md:size-[140px]',
            show ? 'opacity-100' : 'js:opacity-0',
          )}
        >
          <svg viewBox="0 0 24 24" className="size-6 text-[var(--brand-ember-light)] md:size-8" aria-hidden="true">
            <path
              d="M12 3c1.5 3 4.5 5 4.5 9a4.5 4.5 0 1 1-9 0c0-2 1-3.2 2-4.2.2 1.4.9 2.4 2 2.7-.6-2.6-.2-5.2.5-7.5Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
            />
          </svg>
        </CircularText>
      </div>
    </section>
  );
}
