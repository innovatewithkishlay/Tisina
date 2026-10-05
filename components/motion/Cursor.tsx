'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, m, useMotionValue, useSpring } from 'motion/react';
import { ease } from '@/lib/motion';

type Mode = 'idle' | 'link' | 'label' | 'hidden';

const SIZE = 92;
const SCALE: Record<Mode, number> = { idle: 10 / SIZE, link: 40 / SIZE, label: 1, hidden: 0 };

/**
 * Desktop cursor companion: a small dot (mix-blend-difference) that trails
 * the pointer and opens into a labelled disc over anything carrying
 * `data-cursor="View"` — photographs, the kitchen strip, reservation calls.
 * Grows by scale only. The native cursor stays; touch screens and reduced
 * motion never mount it.
 */
export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<Mode>('hidden');
  const [label, setLabel] = useState('');
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const sx = useSpring(x, { stiffness: 420, damping: 42, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 420, damping: 42, mass: 0.5 });

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || calm) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- enabling after a client-only media check
    setEnabled(true);
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target as Element | null;
      if (!t?.closest) return;
      const labelled = t.closest<HTMLElement>('[data-cursor]');
      if (t.closest('input, textarea, select, [contenteditable]')) setMode('hidden');
      else if (labelled?.dataset.cursor) {
        setLabel(labelled.dataset.cursor);
        setMode('label');
      } else if (t.closest('a, button, [role="button"], label, summary')) setMode('link');
      else setMode('idle');
    };
    const leave = () => setMode('hidden');
    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);
    return () => {
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', leave);
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <m.div aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[95] mix-blend-difference" style={{ x: sx, y: sy }}>
      <m.div
        className="grid place-items-center rounded-full bg-[#f0ebe0] text-[#0f1c16]"
        style={{ width: SIZE, height: SIZE, marginLeft: -SIZE / 2, marginTop: -SIZE / 2 }}
        initial={false}
        animate={{ scale: SCALE[mode], opacity: mode === 'hidden' ? 0 : mode === 'link' ? 0.9 : 1 }}
        transition={{ duration: 0.55, ease: ease.out }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {mode === 'label' ? (
            <m.span
              key={label}
              className="label text-[0.6875rem]"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: ease.out }}
            >
              {label}
            </m.span>
          ) : null}
        </AnimatePresence>
      </m.div>
    </m.div>
  );
}
