'use client';

import type { ReactNode } from 'react';
import { LazyMotion, MotionConfig, domAnimation } from 'motion/react';

/**
 * Motion (the `motion` package) drives all movement on the site — scroll
 * choreography and interaction alike. LazyMotion keeps the bundle small
 * (components use `m.*`), and MotionConfig honours the visitor's
 * reduced-motion setting everywhere.
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
