'use client';

import { useRef } from 'react';
import { Link } from '@/i18n/routing';
import { Img } from '@/components/ui/Img';
import { Kicker } from '@/components/ui/Kicker';
import { gsap, reducedMotion, useGSAP } from '@/components/motion/gsap';

interface SignatureDishProps {
  label: string;
  name: string;
  description?: string;
  note: string;
  price?: string;
  image: { src: string; alt: string };
  cta: string;
}

/**
 * One dish, one screen. The section pins while a small photograph grows to
 * fill the viewport and the dish name splits apart around it.
 */
export function SignatureDish({ label, name, description, note, price, image, cta }: SignatureDishProps) {
  const root = useRef<HTMLElement>(null);
  const words = name.split(' ');
  const half = Math.ceil(words.length / 2);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const mm = gsap.matchMedia();
      mm.add('(min-width: 768px)', () => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: root.current, start: 'top top', end: '+=120%', scrub: true, pin: '[data-sig-pin]' },
        });
        tl.fromTo('[data-sig-img]', { clipPath: 'inset(30% 34% 30% 34% round 24px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'power2.inOut' }, 0)
          .fromTo('[data-sig-img] img', { scale: 1.35 }, { scale: 1, ease: 'power2.inOut' }, 0)
          .to('[data-sig-left]', { xPercent: -60, opacity: 0, ease: 'power2.in' }, 0)
          .to('[data-sig-right]', { xPercent: 60, opacity: 0, ease: 'power2.in' }, 0)
          .fromTo('[data-sig-caption]', { opacity: 0, y: 40 }, { opacity: 1, y: 0, ease: 'power2.out' }, 0.55);
      });
      mm.add('(max-width: 767px)', () => {
        gsap.fromTo('[data-sig-img]', { clipPath: 'inset(12% 10% 12% 10% round 20px)' }, {
          clipPath: 'inset(0% 0% 0% 0% round 20px)',
          ease: 'none',
          scrollTrigger: { trigger: '[data-sig-img]', start: 'top 85%', end: 'top 25%', scrub: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="night relative" aria-labelledby="signature-title">
      <div data-sig-pin className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden py-24 md:py-0">
        <div className="wrap relative z-10 flex items-center justify-between md:absolute md:inset-x-0 md:top-[calc(var(--header-h)+1rem)]">
          <Kicker>{label}</Kicker>
          {price ? <p className="font-display text-h3 tabular-nums">{price}</p> : null}
        </div>

        <h2 id="signature-title" className="pointer-events-none relative z-20 mt-8 text-center md:absolute md:inset-x-0 md:top-1/2 md:mt-0 md:-translate-y-1/2">
          <span className="font-display text-giant flex flex-wrap justify-center gap-x-[0.25em] px-[var(--gutter)] italic leading-[0.85] tracking-[-0.03em] mix-blend-difference md:flex-nowrap">
            <span data-sig-left>{words.slice(0, half).join(' ')}</span>
            <span data-sig-right>{words.slice(half).join(' ')}</span>
          </span>
        </h2>

        <div data-sig-img className="relative mx-[var(--gutter)] mt-10 aspect-[4/5] overflow-hidden md:absolute md:inset-0 md:m-0 md:aspect-auto">
          <Img src={image.src} alt={image.alt} fill sizes="100vw" className="object-cover object-[50%_55%]" />
          <div aria-hidden="true" className="absolute inset-0 hidden bg-[linear-gradient(0deg,rgb(15_13_11/0.75),transparent_45%)] md:block" />
        </div>

        <div
          data-sig-caption
          className="wrap relative z-10 mt-8 grid gap-6 md:absolute md:inset-x-0 md:bottom-10 md:mt-0 md:grid-cols-12 md:items-end"
        >
          <p className="font-display text-h3 italic md:col-span-6">“{note}”</p>
          <div className="md:col-span-4 md:col-start-9">
            {description ? <p className="text-bone/85">{description}</p> : null}
            <Link href="/menu" className="label link-draw mt-5 inline-flex min-h-11 items-center gap-3">
              {cta} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
