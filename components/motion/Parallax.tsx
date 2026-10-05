'use client';

import { useRef, type ReactNode } from 'react';
import { m, useScroll, useTransform } from 'motion/react';
import { useCalm, useParallaxScale } from '@/lib/motion';
import { cn } from '@/lib/utils';

/**
 * Moves a picture inside a still frame as the frame crosses the viewport.
 * Negative speeds lag behind the page (depth), positive ones run ahead. The
 * frame never moves and the picture is oversized to cover the travel, so
 * there are no gaps and no layout shift. Phones travel half as far.
 */
export function Parallax({
  children,
  speed = -0.2,
  className,
}: {
  children: ReactNode;
  speed?: number;
  /** Classes for the frame (position/size). It always clips. */
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const calm = useCalm();
  const scale = useParallaxScale();
  const r = calm ? 0 : Math.abs(speed) * 0.5 * scale; // travel as a share of the frame height
  const dir = Math.sign(speed) || -1;
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  // y is a percentage of the oversized layer (1 + 2r frames tall).
  const travel = (r / (1 + 2 * r)) * 100;
  const y = useTransform(scrollYProgress, [0, 1], [`${dir * travel}%`, `${-dir * travel}%`]);

  return (
    <div ref={ref} className={cn('relative overflow-hidden', className)}>
      <m.div className="absolute inset-x-0" style={{ top: `${-r * 100}%`, bottom: `${-r * 100}%`, y: calm ? 0 : y }}>
        <div className="relative h-full w-full">{children}</div>
      </m.div>
    </div>
  );
}
