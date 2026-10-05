'use client';

import { useRef, type CSSProperties, type ElementType, type ReactNode } from 'react';
import { useInView } from 'motion/react';
import { useCalm } from '@/lib/motion';
import { cn } from '@/lib/utils';

/**
 * Opens a photograph like a blind being raised: the frame unclips from the
 * bottom up while the picture inside settles from 1.25× to its natural size.
 * Plays once. The frame keeps its box from the start, so nothing shifts.
 */
export function ClipReveal({
  children,
  as: Tag = 'div',
  className,
  innerClassName,
  delay = 0,
  amount = 0.2,
  style,
  ...rest
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  innerClassName?: string;
  /** Seconds. */
  delay?: number;
  amount?: number;
  style?: CSSProperties;
} & Record<`data-${string}`, string | undefined>) {
  const ref = useRef<HTMLElement>(null);
  const calm = useCalm();
  const inView = useInView(ref, { once: true, amount });
  return (
    <Tag
      ref={ref}
      className={cn('clip-reveal', className)}
      data-in={inView || calm ? '' : undefined}
      style={{ ...style, ['--delay' as string]: `${delay}s` }}
      {...rest}
    >
      {/* The clip lives one layer down: an element clipped to nothing is never "in view". */}
      <div className="clip-reveal-mask absolute inset-0">
        <div className={cn('clip-reveal-inner absolute inset-0', innerClassName)}>{children}</div>
      </div>
    </Tag>
  );
}
