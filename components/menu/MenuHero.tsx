'use client';

import { useRef } from 'react';
import { Img } from '@/components/ui/Img';
import { Kicker } from '@/components/ui/Kicker';
import { gsap, reducedMotion, useGSAP } from '@/components/motion/gsap';

export function MenuHero({
  eyebrow,
  title,
  lede,
  count,
  plates,
}: {
  eyebrow: string;
  title: string;
  lede: string;
  count: string;
  plates: { src: string; alt: string }[];
}) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      // Horizontal scroll effect tied to vertical scroll
      gsap.to(track.current, {
        xPercent: -100,
        x: () => window.innerWidth,
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
        },
      });

      // Parallax text
      gsap.to('[data-hero-text]', {
        yPercent: -20,
        opacity: 0.1,
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="night relative h-[250svh] w-full bg-night">
      <div className="sticky top-0 flex h-[100svh] w-full flex-col overflow-hidden pt-[var(--header-h)]">
        
        {/* Massive Background Typography */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-30 pointer-events-none">
          <h1 
            data-hero-text
            className="font-display text-[clamp(10rem,25vw,25rem)] leading-none tracking-tighter text-bone whitespace-nowrap opacity-20"
          >
            {title}
          </h1>
        </div>

        <div className="relative z-10 flex flex-1 flex-col justify-center">
          {/* Top text */}
          <div className="wrap flex justify-between items-end pb-8">
             <div>
               <Kicker className="rise mb-4" index={undefined}>{eyebrow}</Kicker>
               <p className="rise max-w-[28ch] text-h4 text-bone md:text-h3" style={{ '--delay': '200ms' } as React.CSSProperties}>
                 {lede}
               </p>
             </div>
             <p className="rise hidden md:block text-lede text-fg-2" style={{ '--delay': '400ms' } as React.CSSProperties}>
               {count}
             </p>
          </div>

          {/* Horizontal Image Track */}
          <div className="mt-8 flex items-center overflow-hidden">
            <div ref={track} className="flex gap-6 px-[var(--gutter)] md:gap-12 md:px-12 w-max items-center">
              {/* Add an empty div for starting offset */}
              <div className="w-[10vw] shrink-0 md:w-[20vw]" />
              
              {plates.map((p, i) => (
                <div
                  key={p.src}
                  className="relative shrink-0 overflow-hidden rounded-[var(--radius-card)] shadow-[var(--shadow-float)]"
                  style={{ 
                    width: i % 2 === 0 ? 'clamp(280px, 35vw, 600px)' : 'clamp(220px, 25vw, 400px)',
                    aspectRatio: i % 2 === 0 ? '4/5' : '3/4',
                    marginTop: i % 2 === 1 ? '4rem' : '0'
                  }}
                >
                  <Img 
                    src={p.src} 
                    alt={p.alt} 
                    fill 
                    sizes="(min-width: 1024px) 35vw, 70vw" 
                    className="object-cover transition-transform duration-[2s] hover:scale-105" 
                  />
                </div>
              ))}
              
              {/* Extra images to make the scroll track longer */}
              {plates.map((p, i) => (
                <div
                  key={p.src + '-dup'}
                  className="relative shrink-0 overflow-hidden rounded-[var(--radius-card)] shadow-[var(--shadow-float)]"
                  style={{ 
                    width: i % 2 === 1 ? 'clamp(280px, 35vw, 600px)' : 'clamp(220px, 25vw, 400px)',
                    aspectRatio: i % 2 === 1 ? '4/5' : '3/4',
                    marginTop: i % 2 === 0 ? '4rem' : '0'
                  }}
                >
                  <Img 
                    src={p.src} 
                    alt={p.alt} 
                    fill 
                    sizes="(min-width: 1024px) 35vw, 70vw" 
                    className="object-cover transition-transform duration-[2s] hover:scale-105" 
                  />
                </div>
              ))}
              
              <div className="w-[10vw] shrink-0" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
