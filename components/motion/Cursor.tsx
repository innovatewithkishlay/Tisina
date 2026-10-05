'use client';

import { useEffect, useState } from 'react';
import { m, useMotionValue, useSpring } from 'motion/react';

type Mode = 'idle' | 'link' | 'media' | 'hidden';

/**
 * A soft cursor companion for mouse users: a small dot that trails the
 * pointer on a spring, grows into a ring over links and buttons, and into a
 * large outlined lens over photographs. The native cursor stays visible, so
 * nothing about pointing or clicking changes. Off for touch and reduced motion.
 */
export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<Mode>('hidden');
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.4 });

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || calm) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- enabling after a client-only media check
    setEnabled(true);
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target as Element | null;
      if (!t?.closest) return;
      if (t.closest('input, textarea, select, [contenteditable]')) setMode('hidden');
      else if (t.closest('a, button, [role="button"], label')) setMode('link');
      else if (t.closest('img, video, [data-cursor="media"]')) setMode('media');
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

  const size = { idle: 10, link: 44, media: 96, hidden: 0 }[mode];
  return (
    <m.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[95] mix-blend-difference"
      style={{ x: sx, y: sy }}
    >
      <m.div
        className="-translate-x-1/2 -translate-y-1/2 rounded-full border border-[#f0ebe0]"
        animate={{
          width: size,
          height: size,
          backgroundColor: mode === 'idle' ? '#f0ebe0' : 'rgba(240,235,224,0)',
          opacity: mode === 'hidden' ? 0 : 1,
        }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      />
    </m.div>
  );
}
