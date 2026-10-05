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

  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap.fromTo(
        '[data-parallax] img',
        { yPercent: -10 },
        {
          yPercent: 10,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
        }
      );
    },
    { scope: root }
  );

  return (
    <section ref={root} className="night relative flex min-h-[100svh] flex-col overflow-hidden py-24" aria-labelledby="signature-title">
      <div className="absolute inset-0 z-0 overflow-hidden" data-parallax>
        <Img src={image.src} alt={image.alt} fill sizes="100vw" className="object-cover scale-110" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-night via-transparent to-night/40" />
      </div>

      <div className="wrap relative z-10 flex flex-1 flex-col justify-end mt-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="max-w-4xl">
            <Kicker className="mb-6">{label}</Kicker>
            <h2 id="signature-title" className="font-display text-[clamp(4rem,10vw,9rem)] leading-[0.85] tracking-[-0.02em] text-white italic">
              {name}
            </h2>
          </div>
          {price ? <p className="font-display text-[clamp(2.5rem,5vw,4rem)] text-white">{price}</p> : null}
        </div>

        <div className="grid md:grid-cols-12 gap-8 border-t border-white/20 pt-10">
          <div className="md:col-span-7">
            <p className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] leading-tight text-white/90 italic">“{note}”</p>
          </div>
          <div className="md:col-span-4 md:col-start-9 flex flex-col justify-between">
            {description ? <p className="text-white/75 text-lede">{description}</p> : null}
            <Link href="/menu" className="label link-draw mt-10 inline-flex items-center gap-3 text-white">
              {cta} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
