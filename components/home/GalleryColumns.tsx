'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, LazyMotion, m, useInView, useScroll, useSpring, useTransform } from 'motion/react';
import { Img } from '@/components/ui/Img';
import { Kicker } from '@/components/ui/Kicker';
import { ClipReveal } from '@/components/motion/ClipReveal';
import { Parallax } from '@/components/motion/Parallax';
import { SplitReveal } from '@/components/motion/SplitReveal';
import { useLenis } from '@/components/motion/SmoothScroll';
import { ease, scrollSpring, useCalm, useDesktop } from '@/lib/motion';
import { cn } from '@/lib/utils';

export interface GalleryImage {
  key: string;
  src: string;
  caption: string;
}

const loadMax = () => import('motion/react').then((mod) => mod.domMax);

const SPEEDS = [-0.12, -0.3, -0.2, -0.35, -0.1, -0.25];
const RATIOS = [4 / 5, 3 / 4, 5 / 4, 4 / 5, 3 / 4, 1];

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
  const root = useRef<HTMLElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const lenis = useLenis();
  const calm = useCalm();
  const desktop = useDesktop();
  const pinned = desktop && !calm;
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    const el = list.current;
    if (!el || !pinned) return;
    const measure = () => setDistance(Math.max(el.scrollWidth - window.innerWidth, 1));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [pinned]);

  const { scrollYProgress } = useScroll({ target: root, offset: ['start start', 'end end'] });
  const progress = useSpring(scrollYProgress, scrollSpring);
  const x = useTransform(progress, (v) => -v * distance);

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
      <section 
        ref={root} 
        className="paper relative md:h-[calc(var(--n)*100svh)] md:motion-reduce:h-auto"
        style={{ ['--n' as string]: items.length }}
        aria-labelledby="gallery-title"
      >
        <div className="relative py-[var(--section)] md:sticky md:top-0 md:flex md:h-[100svh] md:flex-col md:justify-center md:overflow-hidden md:py-0 md:pt-[var(--header-h)] md:motion-reduce:static md:motion-reduce:h-auto md:motion-reduce:py-[var(--section)]">
          <div className="wrap mb-10 md:hidden">
            <Kicker>{label}</Kicker>
            <SplitReveal as="h2" id="gallery-title" by="line" text={title} className="font-display mt-6 text-h2" />
            <p className="mt-6 max-w-[42ch] text-lede text-fg-2">{body}</p>
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-[min(45vw,40rem)] flex-col justify-center bg-bg px-[var(--gutter)] pt-[var(--header-h)] md:flex">
            <div className="pointer-events-auto w-[min(78vw,30rem)]">
              <Kicker>{label}</Kicker>
              <SplitReveal as="h2" id="gallery-title-desktop" by="line" text={title} className="font-display mt-6 text-h2" />
              <p className="mt-6 max-w-[42ch] text-lede text-fg-2">{body}</p>
            </div>
          </div>

          <m.ul
            ref={list}
            className={cn(
              'relative flex flex-col gap-12 px-[var(--gutter)]',
              'md:w-max md:flex-row md:items-center md:gap-[clamp(1.5rem,4vw,4rem)] md:px-0 md:pl-[min(50vw,45rem)] md:pr-[var(--gutter)]',
              'md:motion-reduce:w-auto md:motion-reduce:overflow-x-auto md:motion-reduce:pl-[var(--gutter)]',
            )}
            style={pinned ? { x } : undefined}
          >


            {items.map((it, i) => (
              <Frame
                key={it.key}
                item={it}
                index={i}
                view={view}
                onOpen={(btn) => {
                  opener.current = btn;
                  setOpen(i);
                }}
              />
            ))}
            <li className="w-[1px] shrink-0 md:w-[8vw]" aria-hidden="true" />
          </m.ul>
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
  view,
  onOpen,
}: {
  item: GalleryImage;
  index: number;
  view: string;
  onOpen: (btn: HTMLButtonElement) => void;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.25 });

  return (
    <li
      ref={ref}
      className="w-full shrink-0 md:w-[min(45vw,35rem)]"
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
            className="relative w-full overflow-hidden rounded-[18px] bg-bg-2"
            style={{ aspectRatio: RATIOS[index] }}
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
