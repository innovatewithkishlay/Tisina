import type { ElementType, ReactNode } from 'react';
import { Hacek } from '@/components/brand/Logo';
import { cn } from '@/lib/utils';

/** Section eyebrow: the brand háček followed by a short uppercase label. */
export function Kicker({
  children,
  as: Tag = 'p',
  className,
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
}) {
  return (
    <Tag className={cn('label kicker text-muted', className)}>
      <Hacek />
      <span>{children}</span>
    </Tag>
  );
}
