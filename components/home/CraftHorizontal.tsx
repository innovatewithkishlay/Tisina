'use client';

import { useRef } from 'react';
import { Img } from '@/components/ui/Img';
import { Kicker } from '@/components/ui/Kicker';
import { gsap, reducedMotion, useGSAP } from '@/components/motion/gsap';

export interface CraftPanel {
  key: string;
  figure: string;
  title: string;
  body: string;
  alt: string;
  image: string;
}

/**
 * The one sideways moment on the page: the section pins and the kitchen story
 * travels horizontally as you keep scrolling down. Each photograph settles
 * from a slight zoom as it reaches the centre. Without motion it is a native
 * swipeable row.
 */
export function CraftHorizontal({ label, title, panels }: { label: string; title: string; panels: CraftPanel[] }) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const titleHtml = title.replace(/\*([^*]+)\*/g, '<em class="text-accent">$1</em>');

  useGSAP(
    () => {
      const el = track.current;
      if (!el || reducedMotion()) return;
      const distance = () => el.scrollWidth - window.innerWidth;
      const tween = gsap.to(el, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });
      el.querySelectorAll<HTMLElement>('[data-craft-card] img').forEach((img) =>
        gsap.fromTo(
          img,
          { scale: 1.18 },
          { scale: 1, ease: 'none', scrollTrigger: { trigger: img, containerAnimation: tween, start: 'left right', end: 'center center', scrub: true } },
        ),
      );
    },
    { scope: root },
  );

  return (
    <section ref={root} className="night relative overflow-hidden" aria-labelledby="craft-title">
      <div className="flex h-[100svh] flex-col justify-center pt-[var(--header-h)]">
        <div
          ref={track}
          className="no-scrollbar flex w-max items-center gap-[clamp(1.5rem,4vw,4rem)] px-[var(--gutter)] motion-reduce:w-auto motion-reduce:snap-x motion-reduce:snap-mandatory motion-reduce:overflow-x-auto"
        >
          <div className="w-[min(78vw,30rem)] shrink-0 snap-start">
            <Kicker>{label}</Kicker>
            <h2 id="craft-title" className="font-display mt-6 text-[clamp(3rem,7vw,7rem)] leading-[0.9] tracking-[-0.02em]" dangerouslySetInnerHTML={{ __html: titleHtml }} />
            <p className="label mt-10 flex items-center gap-3 text-muted" aria-hidden="true">
              <span className="block h-px w-10 bg-current" /> Scroll
            </p>
          </div>

          {panels.map((p) => (
            <article key={p.key} data-craft-card className="w-[min(84vw,52rem)] shrink-0 snap-center">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[22px] bg-night-2">
                <Img src={p.image} alt={p.alt} fill sizes="(min-width: 768px) 52rem, 84vw" className="object-cover" />
              </div>
              <div className="mt-6 grid gap-x-8 gap-y-2 sm:grid-cols-[auto_1fr] sm:items-baseline">
                <p className="font-display text-[clamp(2.75rem,5vw,4.5rem)] italic leading-none text-accent">{p.figure}</p>
                <div>
                  <h3 className="font-display text-h3">{p.title}</h3>
                  <p className="mt-2 max-w-[44ch] text-fg-2">{p.body}</p>
                </div>
              </div>
            </article>
          ))}
          <div className="w-[8vw] shrink-0" aria-hidden="true" />
        </div>

      </div>
    </section>
  );
}
