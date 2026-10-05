'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { m, useMotionTemplate, useScroll, useTransform, type MotionValue } from 'motion/react';
import { Link } from '@/i18n/routing';
import { Logo } from '@/components/brand/Logo';
import { Magnetic } from '@/components/motion/Magnetic';
import { SplitReveal } from '@/components/motion/SplitReveal';
import { CircularText } from '@/components/motion/CircularText';
import { Img } from '@/components/ui/Img';
import { useCalm } from '@/lib/motion';
import { cn } from '@/lib/utils';

interface HeroVideoProps {
  name: string;
  eyebrow: string;
  /** Headline; `*word*` is set in italic and arrives a beat later. */
  line: string;
  ctaBook: string;
  ctaMenu: string;
  scroll: string;
  badge: string;
  cursorReserve: string;
  pauseLabel: string;
  playLabel: string;
  status: ReactNode;
  poster: string;
  sources: readonly { src: string; media?: string }[];
}

/**
 * Full-bleed film. The poster settles from 1.15× over 2.4 s (a slow Ken
 * Burns) while the headline rises line by line. Scrolling away frames the
 * picture — the bleed closes to a rounded card and the image leans in —
 * while the words lift faster than the film and blur out of focus.
 */
export function HeroVideo({
  name,
  eyebrow,
  line,
  ctaBook,
  ctaMenu,
  scroll,
  badge,
  cursorReserve,
  pauseLabel,
  playLabel,
  status,
  poster,
  sources,
}: HeroVideoProps) {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const calm = useCalm();
  const [playing, setPlaying] = useState(true);
  const [ready, setReady] = useState(false);
  const [src, setSrc] = useState<string | null>(null);

  // The poster is the first paint. Only well after load (once the overture
  // has lifted) do we pick the one file that suits this screen, so the film
  // never competes with the poster, fonts or scripts.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reflecting a client-only preference
      setPlaying(false);
      return;
    }
    let timer = 0;
    const start = () => {
      timer = window.setTimeout(() => {
        const pick = sources.find((x) => !x.media || window.matchMedia(x.media).matches) ?? sources[sources.length - 1];
        setSrc(pick.src);
      }, 1800);
    };
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
    return () => {
      window.removeEventListener('load', start);
      window.clearTimeout(timer);
    };
  }, [sources]);

  const { scrollYProgress, scrollY } = useScroll({ target: root, offset: ['start start', 'end start'] });
  const inset = useTransform(scrollYProgress, [0, 1], [0, 6]);
  const radius = useTransform(scrollYProgress, [0, 1], [0, 24]);
  const clipPath = useMotionTemplate`inset(${inset}% ${inset}% ${inset}% ${inset}% round ${radius}px)`;
  const mediaScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  // Layered parallax: the words travel faster than the picture behind them.
  const copyY = useTransform(scrollYProgress, [0, 1], ['0%', '-60%']);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const copyBlur = useTransform(scrollYProgress, [0, 0.55], [0, 8]);
  const copyFilter = useMotionTemplate`blur(${copyBlur}px)`;
  const markY = useTransform(scrollYProgress, [0, 1], ['0%', '-35%']);
  const cueOpacity = useTransform(scrollY, [0, 50], [1, 0]);

  const toggle = () => {
    const v = video.current;
    if (!v) {
      const pick = sources.find((x) => !x.media || window.matchMedia(x.media).matches) ?? sources[sources.length - 1];
      setSrc(pick.src);
      setPlaying(true);
      return;
    }
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
      <m.div className="absolute inset-0 overflow-hidden bg-night" style={calm ? undefined : { clipPath }}>
        <m.div className="absolute inset-0" style={calm ? undefined : { scale: mediaScale }}>
          <div className="ken-burns absolute inset-0">
            <Img src={poster} alt="" fill priority fetchPriority="high" sizes="100vw" className="object-cover" />
            {src ? (
              <video
                ref={video}
                className={cn('absolute inset-0 h-full w-full object-cover transition-opacity duration-1000', ready ? 'opacity-100' : 'opacity-0')}
                src={src}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                onCanPlay={() => setReady(true)}
                aria-hidden="true"
              />
            ) : null}
          </div>
        </m.div>
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgb(0_0_0/0.7)_0%,rgb(0_0_0/0.35)_45%,rgb(0_0_0/0.9)_100%)]" />
      </m.div>

      <div className="wrap relative z-10 flex h-full flex-col pb-5 pt-[calc(var(--header-h)+0.5rem)]">
        <div className="rise flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-bone/85" style={{ ['--delay' as string]: 300 }}>
          <p className="label">{eyebrow}</p>
          {status}
        </div>

        <m.div
          className="mt-auto pb-[clamp(1.25rem,3vw,2.5rem)]"
          style={calm ? undefined : { y: copyY, opacity: copyOpacity, filter: copyFilter }}
        >
          <div className="mb-8 flex items-end justify-between gap-6 md:hidden">
            <ScrollCue label={scroll} opacity={cueOpacity} />
            <ReserveBadge text={badge} label={ctaBook} cursor={cursorReserve} />
          </div>

          <div className="flex items-end justify-between gap-10">
            <div>
              <SplitReveal
                as="h1"
                mode="load"
                by="line"
                text={line}
                delay={0.15}
                stagger={0.11}
                emDelay={0.3}
                emClassName="italic text-[var(--brand-ember-light)]"
                className="font-display max-w-[21ch] text-[clamp(1.875rem,3.4vw,3.25rem)] leading-[1.06] text-bone"
              />
              <div className="rise mt-8 flex flex-wrap items-center gap-3" style={{ ['--delay' as string]: 900 }}>
                <Magnetic>
                  <Link
                    href="/book"
                    data-cursor={cursorReserve}
                    className="btn-fill label inline-flex min-h-13 items-center rounded-[var(--radius-pill)] bg-bone px-7 text-night [--btn-fill:var(--brand-ember-light)]"
                  >
                    {ctaBook}
                  </Link>
                </Magnetic>
                <Magnetic>
                  <Link
                    href="/menu"
                    className="label inline-flex min-h-13 items-center rounded-[var(--radius-pill)] border border-bone/50 px-7 text-bone backdrop-blur-sm transition-colors duration-[var(--dur-2)] hover:border-bone hover:bg-bone/10"
                  >
                    {ctaMenu}
                  </Link>
                </Magnetic>
              </div>
            </div>
            <div className="hidden items-end gap-12 md:flex">
              <ScrollCue label={scroll} opacity={cueOpacity} />
              <ReserveBadge text={badge} label={ctaBook} cursor={cursorReserve} />
            </div>
          </div>
        </m.div>

        <m.div id="hero-mark" style={calm ? undefined : { y: markY, opacity: copyOpacity }}>
          <div className="rise" style={{ ['--delay' as string]: 150 }}>
            <Logo title={name} className="w-full text-bone [--hacek:var(--brand-ember-light)]" />
          </div>
        </m.div>

        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? pauseLabel : playLabel}
          title={playing ? pauseLabel : playLabel}
          className="absolute bottom-4 right-[var(--gutter)] z-20 grid size-10 place-items-center rounded-full border border-bone/25 text-bone/70 backdrop-blur-sm transition-colors hover:border-bone hover:text-bone"
        >
          <svg viewBox="0 0 12 12" className="size-3" aria-hidden="true">
            {playing ? <path d="M3 2v8M9 2v8" stroke="currentColor" strokeWidth="1.6" /> : <path d="M3 1.5v9l7.5-4.5z" fill="currentColor" />}
          </svg>
        </button>
      </div>
    </section>
  );
}

/** A slow-turning seal that leads to the booking page. */
function ReserveBadge({ text, label, cursor }: { text: string; label: string; cursor: string }) {
  return (
    <Link
      href="/book"
      data-cursor={cursor}
      className="rise group block shrink-0 text-bone"
      style={{ ['--delay' as string]: 1100 }}
    >
      <span className="sr-only">{label}</span>
      <CircularText texts={[text]} className="size-[88px] md:size-[120px]" period={30}>
        <span className="grid size-9 place-items-center rounded-full border border-bone/30 transition-[background-color,border-color] duration-500 group-hover:border-[var(--brand-ember-light)] group-hover:bg-[var(--brand-ember-light)] group-hover:text-night md:size-11">
          <svg viewBox="0 0 16 16" className="size-3.5 -rotate-45 transition-transform duration-500 group-hover:rotate-0" aria-hidden="true">
            <path d="M2 8h11M9 3.5 13.5 8 9 12.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </span>
      </CircularText>
    </Link>
  );
}

/** A thin line with a bead of light travelling down it; gone after the first 50px. */
function ScrollCue({ label, opacity }: { label: string; opacity: MotionValue<number> }) {
  return (
    <m.div style={{ opacity }} aria-hidden="true">
      <div className="rise flex flex-col items-center gap-3 text-bone/70" style={{ ['--delay' as string]: 1300 }}>
      <span className="label text-[0.625rem] [writing-mode:vertical-rl]">{label}</span>
      <span className="relative block h-14 w-px overflow-hidden bg-bone/20">
        <span className="scroll-cue-dot absolute left-[-1px] top-0 block size-[3px] rounded-full bg-[var(--brand-ember-light)]" />
      </span>
      </div>
    </m.div>
  );
}
