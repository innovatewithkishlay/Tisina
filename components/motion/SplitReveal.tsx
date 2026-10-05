'use client';

import { useLayoutEffect, useRef, type CSSProperties, type ElementType } from 'react';
import { useInView, useMotionValueEvent, useScroll, type MotionValue } from 'motion/react';
import { parseEmphasis, stripEmphasis, useCalm } from '@/lib/motion';
import { cn } from '@/lib/utils';

type By = 'line' | 'word' | 'char';
type Mode = 'trigger' | 'load' | 'scrub';
type Effect = 'rise' | 'light';
type ScrollOffset = NonNullable<Parameters<typeof useScroll>[0]>['offset'];

interface SplitRevealProps {
  /** Text; `*word*` sets the emphasised (italic) voice. */
  text: string;
  as?: ElementType;
  /** Unit of the reveal. `line` masks words but staggers them by measured line. */
  by?: By;
  /**
   * trigger — plays once on entering the viewport;
   * load — plays on first paint with CSS only (above the fold, no JS wait);
   * scrub — tied to scroll progress, forwards and back.
   */
  mode?: Mode;
  /** rise: units slide up out of a mask. light: units brighten in place (scrub). */
  effect?: Effect;
  /** Seconds before the first unit moves. */
  delay?: number;
  /** Seconds between units (or lines). */
  stagger?: number;
  /** Extra seconds for emphasised words — they arrive a beat later. */
  emDelay?: number;
  emClassName?: string;
  className?: string;
  style?: CSSProperties;
  id?: string;
  /** Scrub mode: scroll window, as a useScroll offset. */
  offset?: ScrollOffset;
  /** Scrub mode: drive from an external 0–1 progress instead. */
  progress?: MotionValue<number>;
  /** Trigger mode: how much must be visible. */
  amount?: number;
  /** Trigger mode: let the parent decide when to play instead of the viewport. */
  play?: boolean;
}

/**
 * Splits text into masked lines, words or characters and lifts each one into
 * place. Screen readers and search engines get the plain sentence; the split
 * copy is decorative. Without JavaScript or with reduced motion the text is
 * simply there.
 */
export function SplitReveal({
  text,
  as: Tag = 'p',
  by = 'word',
  mode = 'trigger',
  effect = 'rise',
  delay = 0,
  stagger,
  emDelay = 0,
  emClassName = 'italic',
  className,
  style,
  id,
  offset = ['start 85%', 'end 55%'],
  progress,
  amount = 0.35,
  play,
}: SplitRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const calm = useCalm();
  const inView = useInView(ref, { once: true, amount });
  const runs = parseEmphasis(text);

  // Lines are only known after layout: group words by their top edge and let
  // every word on a line share one delay.
  // A CSS-only entrance can still be re-timed while it waits behind the
  // intro curtain; otherwise its first-paint word cascade stands.
  useLayoutEffect(() => {
    if (by !== 'line' || !ref.current) return;
    const html = document.documentElement.classList;
    if (mode === 'load' && !(html.contains('intro') && !html.contains('intro-done'))) return;
    ref.current.style.setProperty('--st', `${stagger ?? 0.12}s`);
    const masks = Array.from(ref.current.querySelectorAll<HTMLElement>('[data-u]'));
    // Read every position first, then write: one layout, no thrashing.
    const tops = masks.map((el) => el.offsetTop);
    let line = -1;
    let lastTop = -Infinity;
    const lines = tops.map((top) => {
      if (top > lastTop + 4) {
        line += 1;
        lastTop = top;
      }
      return line;
    });
    masks.forEach((el, k) => el.style.setProperty('--i', String(lines[k])));
  }, [by, mode, text, stagger]);

  // Scrub: one CSS variable per frame; every unit derives its own state from it.
  const { scrollYProgress } = useScroll({ target: ref, offset });
  const source = progress ?? scrollYProgress;
  useMotionValueEvent(source, 'change', (v) => {
    if (mode === 'scrub' && !calm) ref.current?.style.setProperty('--p', v.toFixed(4));
  });

  let n = 0;
  const units = runs.flatMap((run, r) => {
    const words = run.text.split(/(\s+)/);
    return words.map((w, wi) => {
      if (!w) return null;
      if (/^\s+$/.test(w)) return ' ';
      const extra = run.em ? emDelay : 0;
      if (by === 'char') {
        return (
          <span key={`${r}-${wi}`} className="split-word">
            {Array.from(w).map((ch, ci) => (
              <span key={ci} data-u className="split-mask">
                <span
                  className={cn('split-unit', run.em && emClassName)}
                  style={{ ['--i' as string]: n++, ['--x' as string]: `${extra}s` }}
                >
                  {ch}
                </span>
              </span>
            ))}
          </span>
        );
      }
      return (
        <span key={`${r}-${wi}`} data-u className="split-mask" style={{ ['--i' as string]: n++ }}>
          <span className={cn('split-unit', run.em && emClassName)} style={{ ['--x' as string]: `${extra}s` }}>
            {w}
          </span>
        </span>
      );
    });
  });

  return (
    <Tag
      ref={ref}
      id={id}
      className={cn('split', `split-${mode}`, `split-${effect}`, className)}
      data-in={mode === 'trigger' && ((play ?? inView) || calm) ? '' : undefined}
      style={{
        ...style,
        ['--delay' as string]: `${delay}s`,
        // Lines are measured on the client; until then words cascade quickly.
        ['--st' as string]: `${by === 'line' ? 0.035 : (stagger ?? (by === 'char' ? 0.035 : 0.06))}s`,
        ['--n' as string]: n,
      }}
    >
      <span className="sr-only">{stripEmphasis(text)}</span>
      <span aria-hidden="true">{units}</span>
    </Tag>
  );
}
