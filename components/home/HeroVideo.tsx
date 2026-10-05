'use client';

import { useRef, useState, type ReactNode } from 'react';
import { Link } from '@/i18n/routing';
import { Logo } from '@/components/brand/Logo';
import { Img } from '@/components/ui/Img';
import { gsap, reducedMotion, useGSAP } from '@/components/motion/gsap';
import { cn } from '@/lib/utils';

interface HeroVideoProps {
  name: string;
  eyebrow: string;
  line: string;
  ctaBook: string;
  ctaMenu: string;
  scroll: string;
  pauseLabel: string;
  playLabel: string;
  status: ReactNode;
  poster: string;
  sources: readonly { src: string; media?: string }[];
}

/**
 * Full-bleed film with the wordmark set across its lower edge. The poster is
 * painted immediately (with a blur placeholder) so the first frame is never
 * text-only; the video fades in over it. On scroll the frame closes into a
 * rounded card while the wordmark lifts away.
 */
export function HeroVideo({ name, eyebrow, line, ctaBook, ctaMenu, scroll, pauseLabel, playLabel, status, poster, sources }: HeroVideoProps) {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const [ready, setReady] = useState(false);

  useGSAP(
    () => {
      if (reducedMotion()) {
        video.current?.pause();
        setPlaying(false);
        return;
      }
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      });
      tl.fromTo('[data-hero-frame]', { clipPath: 'inset(0% 0% 0% 0% round 0px)' }, { clipPath: 'inset(7% 4% 12% 4% round 28px)', ease: 'none' }, 0)
        .fromTo('[data-hero-media]', { scale: 1.02, yPercent: 0 }, { scale: 1.18, yPercent: 8, ease: 'none' }, 0)
        .to('[data-hero-mark]', { yPercent: -55, opacity: 0, ease: 'none' }, 0)
        .to('[data-hero-copy]', { y: -60, opacity: 0, ease: 'none' }, 0);
    },
    { scope: root },
  );

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) {
      void v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  return (
    <section ref={root} className="night relative h-[100svh] min-h-[38rem] overflow-hidden" aria-label={name}>
      <div data-hero-frame className="absolute inset-0 overflow-hidden bg-night will-change-[clip-path]">
        <div data-hero-media className="absolute inset-0 will-change-transform">
          <Img src={poster} alt="" fill priority fetchPriority="high" sizes="100vw" className="object-cover" />
          <video
            ref={video}
            className={cn('absolute inset-0 h-full w-full object-cover transition-opacity duration-1000', ready ? 'opacity-100' : 'opacity-0')}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={poster}
            onCanPlay={() => setReady(true)}
            aria-hidden="true"
          >
            {sources.map((s) => (
              <source key={s.src} src={s.src} media={s.media} type="video/mp4" />
            ))}
          </video>
        </div>
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgb(15_13_11/0.55)_0%,rgb(15_13_11/0.05)_35%,rgb(15_13_11/0.15)_60%,rgb(15_13_11/0.85)_100%)]" />
      </div>

      <div className="wrap relative z-10 flex h-full flex-col pb-5 pt-[calc(var(--header-h)+0.5rem)]">
        <div className="rise flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-bone/85" style={{ ['--delay' as string]: 300 }}>
          <p className="label">{eyebrow}</p>
          {status}
        </div>

        <div data-hero-copy className="mt-auto flex flex-col gap-8 pb-[clamp(1.25rem,3vw,2.5rem)] md:flex-row md:items-end md:justify-between">
          <p
            className="rise font-display max-w-[19ch] text-[clamp(1.75rem,3vw,2.75rem)] leading-[1.08] text-bone"
            style={{ ['--delay' as string]: 650 }}
          >
            {line}
          </p>
          <div className="rise flex flex-wrap items-center gap-3" style={{ ['--delay' as string]: 800 }}>
            <Link
              href="/book"
              className="btn-fill label inline-flex min-h-13 items-center rounded-[var(--radius-pill)] bg-bone px-7 text-night [--btn-fill:var(--brand-ember-light)]"
            >
              {ctaBook}
            </Link>
            <Link
              href="/menu"
              className="label inline-flex min-h-13 items-center rounded-[var(--radius-pill)] border border-bone/50 px-7 text-bone backdrop-blur-sm transition-colors duration-[var(--dur-2)] hover:border-bone hover:bg-bone/10"
            >
              {ctaMenu}
            </Link>
          </div>
        </div>

        <div id="hero-mark" data-hero-mark className="rise" style={{ ['--delay' as string]: 150 }}>
          <Logo animate title={name} className="w-full text-bone [--hacek:var(--brand-ember-light)]" />
        </div>

        <div className="mt-4 flex items-center justify-between text-bone/70">
          <p className="label flex items-center gap-3">
            <span aria-hidden="true" className="relative block h-8 w-px overflow-hidden bg-bone/25">
              <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_1.8s_var(--ease-in-out)_infinite] bg-bone motion-reduce:animate-none" />
            </span>
            {scroll}
          </p>
          <button
            type="button"
            onClick={toggle}
            className="label inline-flex min-h-11 items-center gap-2 px-1 transition-opacity hover:opacity-100"
            aria-pressed={!playing}
          >
            <span aria-hidden="true" className="inline-flex size-6 items-center justify-center rounded-full border border-current text-[0.55rem]">
              {playing ? '❚❚' : '▶'}
            </span>
            {playing ? pauseLabel : playLabel}
          </button>
        </div>
      </div>
    </section>
  );
}
