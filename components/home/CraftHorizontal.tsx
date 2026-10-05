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
 * travels horizontally as you keep scrolling down. Each photograph opens up
 * as it reaches the centre. Without motion it is a native swipeable row.
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
      gsap.to('[data-craft-progress]', {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: () => `+=${distance()}`, scrub: true },
      });
      el.querySelectorAll<HTMLElement>('[data-craft-card]').forEach((card) => {
        gsap.fromTo(
          card.querySelector('[data-craft-media]'),
          { clipPath: 'inset(12% 10% 12% 10% round 28px)' },
          {
            clipPath: 'inset(0% 0% 0% 0% round 28px)',
            ease: 'none',
            scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left right', end: 'center center', scrub: true },
          },
        );
        gsap.fromTo(
          card.querySelector('img'),
          { scale: 1.25, xPercent: 6 },
          { scale: 1, xPercent: -6, ease: 'none', scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } },
        );
      });
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
            <article key={p.key} data-craft-card className="flex w-[min(86vw,58rem)] shrink-0 snap-center flex-col gap-6 md:flex-row md:items-end md:gap-10">
              <div data-craft-media className="relative aspect-[4/5] w-full overflow-hidden rounded-[28px] md:aspect-[4/5] md:w-[56%]">
                <Img src={p.image} alt={p.alt} fill sizes="(min-width: 768px) 34rem, 86vw" className="object-cover grayscale-[35%]" />
              </div>
              <div className="md:w-[44%] md:pb-4">
                <p className="font-display text-[clamp(3.5rem,8vw,7.5rem)] leading-none tracking-[-0.03em] text-accent">{p.figure}</p>
                <h3 className="font-display mt-3 text-h3 italic">{p.title}</h3>
                <p className="mt-4 max-w-[34ch] text-fg-2">{p.body}</p>
              </div>
            </article>
          ))}
          <div className="w-[8vw] shrink-0" aria-hidden="true" />
        </div>

        <div className="wrap mt-10 w-full motion-reduce:hidden" aria-hidden="true">
          <div className="h-px w-full bg-white/15">
            <div data-craft-progress className="h-px origin-left scale-x-0 bg-accent" />
          </div>
        </div>
      </div>
    </section>
  );
}
