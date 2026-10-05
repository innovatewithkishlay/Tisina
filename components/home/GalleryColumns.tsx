'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, LazyMotion, m, useInView } from 'motion/react';
import { Img } from '@/components/ui/Img';
import { Kicker } from '@/components/ui/Kicker';
import { ClipReveal } from '@/components/motion/ClipReveal';
import { Parallax } from '@/components/motion/Parallax';
import { SplitReveal } from '@/components/motion/SplitReveal';
import { useLenis } from '@/components/motion/SmoothScroll';
import { ease } from '@/lib/motion';
import { cn } from '@/lib/utils';

export interface GalleryImage {
  key: string;
  src: string;
  caption: string;
}

// Layout animations (layoutId) need the larger feature set; load it only here.
const loadMax = () => import('motion/react').then((mod) => mod.domMax);

/** Depth per picture: each drifts at its own pace (-0.1 … -0.35). */
const SPEEDS = [-0.12, -0.3, -0.2, -0.35, -0.1, -0.25];
/** Asymmetric frames for the wall on desktop. */
const SHAPES = ['aspect-[4/5]', 'aspect-[3/4] lg:mt-40', 'aspect-[5/4]', 'aspect-[4/5] lg:mt-24', 'aspect-[3/4] lg:-mt-16', 'aspect-[1/1] lg:mt-20'];
const RATIOS = [4 / 5, 3 / 4, 5 / 4, 4 / 5, 3 / 4, 1];

/**
 * Evenings at Tišina. On desktop the heading stays put while an asymmetric
 * wall of photographs scrolls past it, each picture at its own depth; every
 * frame opens like a blind and its caption follows a beat later. The
 * candlelit table flickers, very slightly. Tap or click any picture and it
 * grows out of its place in the wall to fill the screen. On phones the wall
 * becomes a swipe carousel with the picture in focus brought forward.
 */
export function GalleryColumns({
  label,
  title,
  body,
  items,
  view,
  close,
}: {
  label: string;
  title: string;
  body: string;
  items: GalleryImage[];
  view: string;
  close: string;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const [focus, setFocus] = useState(0);
  const list = useRef<HTMLUListElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const lenis = useLenis();

  const onScroll = () => {
    const el = list.current;
    if (!el || el.scrollWidth <= el.clientWidth) return;
    const mid = el.scrollLeft + el.clientWidth / 2;
    const kids = Array.from(el.children) as HTMLElement[];
    let best = 0;
    kids.forEach((k, i) => {
      if (Math.abs(k.offsetLeft + k.offsetWidth / 2 - mid) < Math.abs(kids[best].offsetLeft + kids[best].offsetWidth / 2 - mid)) best = i;
    });
    setFocus(best);
  };

  const dismiss = useCallback(() => {
    setOpen(null);
    opener.current?.focus();
  }, []);

  useEffect(() => {
    if (open === null) return;
    lenis?.stop();
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && dismiss();
    document.addEventListener('keydown', onKey);
    return () => {
      lenis?.start();
      document.documentElement.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, dismiss, lenis]);

  return (
    <LazyMotion features={loadMax}>
      <section className="paper section" aria-labelledby="gallery-title">
        <div className="wrap grid gap-12 lg:grid-cols-12 lg:gap-x-10">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+2.5rem)] lg:col-span-4 lg:self-start">
            <Kicker>{label}</Kicker>
            <SplitReveal as="h2" id="gallery-title" by="line" text={title} className="font-display mt-6 text-h2" />
            <p className="mt-6 max-w-[42ch] text-lede text-fg-2">{body}</p>
          </div>

          <ul
            ref={list}
            onScroll={onScroll}
            className={cn(
              'no-scrollbar -mx-[var(--gutter)] flex snap-x snap-mandatory gap-4 overflow-x-auto px-[11vw]',
              'lg:col-span-8 lg:mx-0 lg:grid lg:snap-none lg:grid-cols-2 lg:gap-x-10 lg:gap-y-20 lg:overflow-visible lg:px-0',
            )}
          >
            {items.map((it, i) => (
              <Frame
                key={it.key}
                item={it}
                index={i}
                focused={focus === i}
                view={view}
                onOpen={(btn) => {
                  opener.current = btn;
                  setOpen(i);
                }}
              />
            ))}
          </ul>
        </div>

        <AnimatePresence>
          {open !== null ? (
            <m.div
              key="lightbox"
              role="dialog"
              aria-modal="true"
              aria-label={items[open].caption}
              className="fixed inset-0 z-[90] grid place-items-center p-[var(--gutter)]"
              initial={{ opacity: 1 }}
              exit={{ opacity: 1 }}
            >
              <m.button
                type="button"
                aria-label={close}
                onClick={dismiss}
                className="absolute inset-0 cursor-zoom-out bg-[rgb(10_18_14/0.92)] backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: ease.out }}
              />
              <figure className="pointer-events-none relative flex max-h-full flex-col items-center">
                <m.div
                  layoutId={`gallery-${items[open].key}`}
                  className={cn('relative overflow-hidden rounded-[18px]', items[open].key === 'candles' && 'candle-flicker')}
                  style={{
                    aspectRatio: RATIOS[open],
                    width: `min(88vw, calc(80svh * ${RATIOS[open]}))`,
                  }}
                  transition={{ duration: 0.75, ease: ease.inOut }}
                >
                  <Img src={items[open].src} alt={items[open].caption} fill sizes="90vw" className="object-cover" />
                </m.div>
                <m.figcaption
                  className="mt-4 text-small text-bone/80"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.45, duration: 0.6, ease: ease.out } }}
                  exit={{ opacity: 0, transition: { duration: 0.2 } }}
                >
                  {items[open].caption}
                </m.figcaption>
              </figure>
              <m.button
                type="button"
                onClick={dismiss}
                autoFocus
                className="label absolute right-[var(--gutter)] top-[calc(var(--gutter)*0.8)] z-10 inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-pill)] border border-bone/30 px-5 text-bone transition-colors hover:border-bone"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {close} <span aria-hidden="true">✕</span>
              </m.button>
            </m.div>
          ) : null}
        </AnimatePresence>
      </section>
    </LazyMotion>
  );
}

function Frame({
  item,
  index,
  focused,
  view,
  onOpen,
}: {
  item: GalleryImage;
  index: number;
  focused: boolean;
  view: string;
  onOpen: (btn: HTMLButtonElement) => void;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.25 });

  return (
    <li
      ref={ref}
      className={cn(
        'w-[78vw] shrink-0 snap-center transition-[transform,opacity] duration-700 ease-[var(--ease-out)] lg:w-auto lg:transition-none',
        !focused && 'max-lg:scale-[0.92] max-lg:opacity-70',
        SHAPES[index].split(' ').filter((c) => c.startsWith('lg:')).join(' '),
      )}
    >
      <figure>
        <button
          type="button"
          onClick={(e) => onOpen(e.currentTarget)}
          data-cursor={view}
          aria-label={`${view}: ${item.caption}`}
          className="block w-full cursor-zoom-in"
        >
          <m.div
            layoutId={`gallery-${item.key}`}
            className={cn('relative w-full overflow-hidden rounded-[18px] bg-bg-2', SHAPES[index].split(' ')[0])}
            transition={{ duration: 0.75, ease: ease.inOut }}
          >
            <ClipReveal className="absolute inset-0" amount={0.2}>
              <Parallax speed={SPEEDS[index % SPEEDS.length]} className="absolute inset-0">
                <Img
                  src={item.src}
                  alt={item.caption}
                  fill
                  sizes="(min-width: 1024px) 30vw, 78vw"
                  className={cn('object-cover', item.key === 'candles' && 'candle-flicker')}
                />
              </Parallax>
            </ClipReveal>
          </m.div>
        </button>
        <figcaption
          className={cn(
            'mt-3 text-small text-muted transition-[opacity,transform] delay-200 duration-700 ease-[var(--ease-out)]',
            !seen && 'js:translate-y-3 js:opacity-0',
          )}
        >
          {item.caption}
        </figcaption>
      </figure>
    </li>
  );
}
