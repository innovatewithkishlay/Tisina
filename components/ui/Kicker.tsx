import type { ElementType, ReactNode } from 'react';
import { Hacek } from '@/components/brand/Logo';
import { cn } from '@/lib/utils';

/** Section eyebrow: the brand háček followed by a short uppercase label. */
export function Kicker({
  children,
  as: Tag = 'p',
  className,
  index,
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Optional "(01)" style index shown before the label. */
  index?: number;
}) {
  return (
    <Tag className={cn('label kicker text-muted', className)}>
      <Hacek />
      {index !== undefined ? <span className="index text-[1.15em] normal-case">({String(index).padStart(2, '0')})</span> : null}
      <span>{children}</span>
    </Tag>
  );
}
