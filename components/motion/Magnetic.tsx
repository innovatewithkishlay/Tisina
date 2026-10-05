'use client';

import { useRef, type ReactNode } from 'react';
import { m, useMotionValue, useSpring } from 'motion/react';
import { cn } from '@/lib/utils';

/**
 * Pulls its child towards the pointer while hovered (mouse only) and settles
 * back on leave — heavy and damped, never bouncy. Wrap a call-to-action with it; the label inside drifts a little
 * further than the pill, which gives the hover depth.
 */
export function Magnetic({ children, className, strength = 0.35 }: { children: ReactNode; className?: string; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 140, damping: 18, mass: 0.7 });
  const sy = useSpring(y, { stiffness: 140, damping: 18, mass: 0.7 });

  const move = (e: React.PointerEvent) => {
    // Mouse only — touch and pen never drag the button around.
    if (e.pointerType !== 'mouse' || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <m.div ref={ref} onPointerMove={move} onPointerLeave={reset} style={{ x: sx, y: sy }} className={cn('inline-block', className)}>
      {children}
    </m.div>
  );
}
