import Image from 'next/image';
import type { ReactNode } from 'react';
import { ButtonLink } from '@/components/ui/Button';
import { images } from '@/content/images';

interface HeroProps {
  name: string;
  eyebrow: string;
  line: string;
  imageAlt: string;
  ctaBook: string;
  ctaMenu: string;
  scroll: string;
  status: ReactNode;
}

/**
 * Wordmark-led hero: the restaurant's name set enormous, letters rising in on
 * load, with a candlelit photograph opening underneath. No JS involved.
 */
export function Hero({ name, eyebrow, line, imageAlt, ctaBook, ctaMenu, scroll, status }: HeroProps) {
  const letters = Array.from(name);
  return (
    <section className="relative flex min-h-[100svh] flex-col pt-[var(--header-h)]">
      <div className="wrap rise flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b hairline py-4 text-muted">
        <p className="label">{eyebrow}</p>
        {status}
      </div>

      <div className="wrap grid flex-1 grid-cols-1 gap-8 pb-10 pt-[clamp(1.5rem,3vw,2.5rem)] md:grid-cols-12 md:gap-10 md:pb-12">
        <div className="flex flex-col justify-between gap-10 md:col-span-5">
          <h1 className="font-display whitespace-nowrap text-[min(44vw,20rem)] leading-[0.8] tracking-[-0.035em] md:text-[min(21vw,20rem)]">
            <span className="sr-only">{name}</span>
            <span aria-hidden="true" className="-ml-[0.04em] inline-block">
              {letters.map((ch, i) => (
                <span key={i} className="letter" style={{ ['--i' as string]: i }}>
                  {ch}
                </span>
              ))}
            </span>
          </h1>

          <div className="hidden flex-col gap-8 md:flex">
            <p className="rise font-display max-w-[20ch] text-[clamp(1.5rem,2.2vw,2.125rem)] leading-[1.2]" style={{ ['--delay' as string]: 700 }}>
              {line}
            </p>
            <div className="rise flex flex-wrap items-center gap-x-8 gap-y-3" style={{ ['--delay' as string]: 850 }}>
              <ButtonLink href="/book">{ctaBook}</ButtonLink>
              <ButtonLink href="/menu" variant="text" arrow>
                {ctaMenu}
              </ButtonLink>
            </div>
          </div>
        </div>

        <div className="relative md:col-span-7">
          <div className="wipe-in relative aspect-[4/5] overflow-hidden bg-bg-2 md:aspect-auto md:h-full md:min-h-[26rem]">
            <Image
              src={images.hero.src}
              alt={imageAlt}
              fill
              priority
              fetchPriority="high"
              sizes="(min-width: 768px) 56vw, 100vw"
              className="object-cover object-[50%_60%]"
            />
          </div>
          <p className="label absolute bottom-0 right-0 hidden translate-y-[calc(100%+0.75rem)] items-center gap-3 text-muted md:flex">
            <span className="inline-block h-px w-10 bg-current" aria-hidden="true" />
            {scroll}
          </p>
        </div>

        {/* Mobile: the line and actions follow the photograph */}
        <div className="flex flex-col gap-7 md:hidden">
          <p className="rise font-display text-[1.625rem] leading-[1.2]" style={{ ['--delay' as string]: 500 }}>
            {line}
          </p>
          <div className="rise flex flex-wrap items-center gap-x-8 gap-y-3" style={{ ['--delay' as string]: 600 }}>
            <ButtonLink href="/book">{ctaBook}</ButtonLink>
            <ButtonLink href="/menu" variant="text" arrow>
              {ctaMenu}
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
