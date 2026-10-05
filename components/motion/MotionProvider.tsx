'use client';

import type { ReactNode } from 'react';
import { LazyMotion, MotionConfig, domAnimation } from 'motion/react';

/**
 * Framer Motion (the `motion` package) for interaction-level animation —
 * cursor, magnetic buttons, page curtain, springy hovers. Scroll choreography
 * stays in GSAP. LazyMotion keeps the bundle small (components use `m.*`), and
 * MotionConfig honours the visitor's reduced-motion setting everywhere.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user" transition={{ type: 'spring', stiffness: 260, damping: 28 }}>
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
