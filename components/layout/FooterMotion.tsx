'use client';

import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';
import { m, useInView, useMotionValue, useMotionValueEvent, useScroll, useTransform, type MotionValue } from 'motion/react';
import { Link } from '@/i18n/routing';
import { LogoLetters } from '@/components/brand/Logo';
import { Img } from '@/components/ui/Img';
import { Magnetic } from '@/components/motion/Magnetic';
import { parseEm, useCalm, useParallaxScale } from '@/lib/motion';
import { cn } from '@/lib/utils';

/** How far the footer has been uncovered: 0 as the page's last edge reaches the bottom, 1 when it is fully open. */
const RevealContext = createContext<MotionValue<number> | null>(null);
const useReveal = () => useContext(RevealContext);

/**
 * Footer reveal. The page (main) lifts away like a curtain and uncovers the
 * footer pinned beneath it (desktop; on phones it simply follows). Children
 * read the reveal progress from context.
 */
export function FooterReveal({ children }: { children: ReactNode }) {
  const progress = useMotionValue(0);
  const { scrollY } = useScroll();
  const main = useRef<HTMLElement | null>(null);

  useEffect(() => {
    main.current = document.getElementById('main');
  }, []);
  useMotionValueEvent(scrollY, 'change', () => {
    const el = main.current;
    if (!el) return;
    const vh = window.innerHeight;
    const bottom = el.getBoundingClientRect().bottom;
    progress.set(Math.min(Math.max((vh - bottom) / (vh * 0.85), 0), 1));
  });

  return <RevealContext.Provider value={progress}>{children}</RevealContext.Provider>;
}

/**
 * "A table is waiting." — set huge; letters rise and gain ink as the footer
 * is uncovered (scrubbed). The emphasised word keeps breathing afterwards: a
 * slow widening of its letter-spacing, drawn with transforms only.
 */
export function FooterCta({ html, className }: { html: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const calm = useCalm();
  const reveal = useReveal();
  const runs = parseEm(html);
  const plain = runs.map((r) => r.text).join('');
  const total = Array.from(plain).length;

  const fallback = useMotionValue(1);
  useMotionValueEvent(reveal ?? fallback, 'change', (v) => {
    // The type finishes rising in the first two-thirds of the reveal.
    if (!calm) ref.current?.style.setProperty('--p', Math.min(v / 0.66, 1).toFixed(4));
  });

  let n = 0;
  return (
    <p ref={ref} className={cn('split split-scrub split-rise', className)} style={{ ['--n' as string]: total, ['--w' as string]: 8 }}>
      <span className="sr-only">{plain}</span>
      <span aria-hidden="true">
        {runs.map((run, r) => {
          const words = run.text.split(/(\s+)/);
          let c = 0;
          const body = words.map((w, wi) =>
            /^\s+$/.test(w) || !w ? (
              w ? ' ' : null
            ) : (
              <span key={wi} className="split-word">
                {Array.from(w).map((ch, ci) => (
                  <span key={ci} className="split-mask ls-char" style={{ ['--c' as string]: c++ }}>
                    <span className="split-unit" style={{ ['--i' as string]: n++ }}>
                      {ch}
                    </span>
                  </span>
                ))}
              </span>
            ),
          );
          return run.em ? (
            <em key={r} className="breathe-ls inline-block italic text-accent">
              {body}
            </em>
          ) : (
            <span key={r}>{body}</span>
          );
        })}
      </span>
    </p>
  );
}

/** The reservation call: magnetic on desktop, a fill rising from below, the arrow looping out and back. */
export function FooterBook({ label, cursor }: { label: string; cursor: string }) {
  return (
    <Magnetic className="w-fit" strength={0.25}>
      <Link
        href="/book"
        data-cursor={cursor}
        className="btn-fill group label inline-flex min-h-16 w-fit items-center gap-4 rounded-[var(--radius-pill)] bg-bone px-9 text-night transition-colors duration-[var(--dur-2)] [--btn-fill:var(--brand-ember-light)]"
      >
        {label}
        <span className="btn-arrow" aria-hidden="true">
          <span>→</span>
        </span>
      </Link>
    </Magnetic>
  );
}

/** A candle burning behind everything, barely there, drifting slowly as the footer opens. */
export function FooterBackdrop({ src }: { src: string }) {
  const reveal = useReveal();
  const calm = useCalm();
  const k = useParallaxScale();
  const fallback = useMotionValue(1);
  const y = useTransform(reveal ?? fallback, [0, 1], [`${-12 * k}%`, '0%']);
  const opacity = useTransform(reveal ?? fallback, [0, 1], [0, 0.16]);
  return (
    <m.div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-[12%] bottom-0" style={calm ? { opacity: 0.16 } : { y, opacity }}>
      <Img src={src} alt="" fill sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,var(--brand-night)_0%,transparent_40%,var(--brand-night)_100%)]" />
    </m.div>
  );
}

/** The closing wordmark: letters rise one after another once the footer is open. */
export function FooterMark({ title, className }: { title: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.5 });
  return (
    <div ref={ref} className={cn('letters-rise flex min-h-0 items-end', className)} data-in={seen ? '' : undefined}>
      <LogoLetters title={title} className="max-h-full w-full text-bone" />
    </div>
  );
}
