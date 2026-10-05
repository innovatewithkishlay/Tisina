'use client';

import { useRef } from 'react';
import { Img } from '@/components/ui/Img';
import { Kicker } from '@/components/ui/Kicker';
import { gsap, reducedMotion, useGSAP } from '@/components/motion/gsap';

export interface KitchenCard {
  key: string;
  figure: string;
  title: string;
  body: string;
  alt: string;
  image: string;
}

/**
 * Vertical card stack: each full-screen black-and-white still is sticky, so
 * the next one slides up over it while the previous card recedes and darkens.
 * Pure CSS stacking (works everywhere); GSAP adds the recede.
 */
export function KitchenStack({ label, title, cards }: { label: string; title: string; cards: KitchenCard[] }) {
  const root = useRef<HTMLElement>(null);
  const titleHtml = title.replace(/\*([^*]+)\*/g, '<em class="text-accent">$1</em>');

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const items = gsap.utils.toArray<HTMLElement>('[data-card]');
      items.forEach((card, i) => {
        const next = items[i + 1];
        if (!next) return;
        gsap.to(card.querySelector('[data-card-inner]'), {
          scale: 0.9,
          filter: 'brightness(0.55)',
          borderRadius: '28px',
          ease: 'none',
          scrollTrigger: { trigger: next, start: 'top bottom', end: 'top top', scrub: true },
        });
      });
      items.forEach((card) => {
        gsap.fromTo(
          card.querySelectorAll('[data-card-text]'),
          { y: 60, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: card, start: 'top 55%', toggleActions: 'play none none reverse' } },
        );
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="night relative" aria-labelledby="kitchen-title">
      <div className="wrap section pb-[clamp(3rem,6vw,5rem)]">
        <Kicker>{label}</Kicker>
        <h2 id="kitchen-title" className="font-display text-display mt-6" dangerouslySetInnerHTML={{ __html: titleHtml }} />
      </div>

      <div>
        {cards.map((c, i) => (
          <article key={c.key} data-card className="sticky top-0 h-[100svh] overflow-hidden">
            <div data-card-inner className="relative h-full w-full origin-top overflow-hidden bg-night will-change-transform">
              <Img src={c.image} alt={c.alt} fill sizes="100vw" className="object-cover" />
              <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(90deg,rgb(15_13_11/0.82)_0%,rgb(15_13_11/0.35)_55%,rgb(15_13_11/0.1)_100%)]" />
              <div className="wrap relative flex h-full flex-col justify-end pb-[clamp(2rem,7vh,5rem)] text-bone">
                <p data-card-text className="index text-[1.25rem] text-bone/70">
                  ({String(i + 1).padStart(2, '0')}/{String(cards.length).padStart(2, '0')})
                </p>
                <p data-card-text className="font-display text-giant mt-2 tracking-[-0.03em] tabular-nums">
                  {c.figure}
                </p>
                <h3 data-card-text className="font-display mt-4 text-h2 italic">
                  {c.title}
                </h3>
                <p data-card-text className="mt-5 max-w-[40ch] text-lede text-bone/85">
                  {c.body}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
