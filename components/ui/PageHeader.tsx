import type { ReactNode } from 'react';
import { SplitReveal } from '@/components/motion/SplitReveal';
import { Kicker } from '@/components/ui/Kicker';

/** Shared opening for inner pages: small label, very large title, lede. */
export function PageHeader({
  eyebrow,
  title,
  lede,
  aside,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  aside?: ReactNode;
}) {
  return (
    <header className="wrap pb-[clamp(3rem,7vw,6rem)] pt-[calc(var(--header-h)+clamp(3rem,8vw,7rem))]">
      <Kicker className="rise">{eyebrow}</Kicker>
      <SplitReveal as="h1" mode="load" text={title} delay={0.1} className="font-display text-h1 mt-6 block max-w-[18ch]" />
      <div className="mt-10 grid gap-8 md:grid-cols-12">
        {lede ? (
          <p className="rise text-lede max-w-[46ch] text-fg-2 md:col-span-7" style={{ ['--delay' as string]: 300 }}>
            {lede}
          </p>
        ) : null}
        {aside ? (
          <div className="rise md:col-span-4 md:col-start-9" style={{ ['--delay' as string]: 400 }}>
            {aside}
          </div>
        ) : null}
      </div>
    </header>
  );
}
