'use client';

import { useRef } from 'react';
import { Img } from '@/components/ui/Img';
import { Kicker } from '@/components/ui/Kicker';
import { gsap, reducedMotion, useGSAP } from '@/components/motion/gsap';

export interface GalleryImage {
  key: string;
  src: string;
  caption: string;
}

/**
 * Vertical gallery: three columns drift at different speeds as you scroll
 * (two on phones), so the photographs slide past one another.
 */
export function GalleryColumns({ label, title, body, items }: { label: string; title: string; body: string; items: GalleryImage[] }) {
  const root = useRef<HTMLElement>(null);
  const cols: GalleryImage[][] = [[], [], []];
  items.forEach((it, i) => cols[i % 3].push(it));

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const mm = gsap.matchMedia();
      mm.add('(min-width: 768px)', () => {
        [-18, 14, -30].forEach((y, i) =>
          gsap.fromTo(
            `[data-col="${i}"]`,
            { yPercent: -y / 2 },
            { yPercent: y, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } },
          ),
        );
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="paper section overflow-hidden" aria-labelledby="gallery-title">
      <div className="wrap grid gap-8 md:grid-cols-12">
        <div className="md:col-span-5">
          <Kicker>{label}</Kicker>
        </div>
        <div className="md:col-span-7">
          <h2 id="gallery-title" className="font-display text-h1">
            {title}
          </h2>
          <p className="mt-6 max-w-[50ch] text-lede text-fg-2">{body}</p>
        </div>
      </div>

      <div className="wrap mt-20 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-8">
        {cols.map((col, ci) => (
          <ul key={ci} data-col={ci} className={ci === 2 ? 'hidden space-y-8 md:block' : 'space-y-4 md:space-y-8'}>
            {col.map((it, i) => (
              <li key={it.key}>
                <figure>
                  <div
                    className="relative overflow-hidden rounded-[calc(var(--radius-card)*0.7)] bg-bg-2"
                    style={{ aspectRatio: (ci + i) % 2 ? '4 / 5' : '3 / 4' }}
                  >
                    <Img src={it.src} alt={it.caption} fill sizes="(min-width: 768px) 32vw, 50vw" className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-out)] hover:scale-105" />
                  </div>
                  <figcaption className="mt-3 text-small text-muted">{it.caption}</figcaption>
                </figure>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}
