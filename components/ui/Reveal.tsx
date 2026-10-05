import type { CSSProperties, ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type RevealKind = 'fade' | 'mask' | 'words';

interface RevealProps {
  as?: ElementType;
  kind?: RevealKind;
  /** Delay in milliseconds. */
  delay?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  id?: string;
}

/** Scroll-triggered reveal. Pure markup; RevealObserver does the rest. */
export function Reveal({ as: Tag = 'div', kind = 'fade', delay = 0, className, style, children, id }: RevealProps) {
  return (
    <Tag
      id={id}
      data-reveal={kind === 'fade' ? '' : kind}
      className={className}
      style={{ ...style, ['--delay' as string]: delay }}
    >
      {children}
    </Tag>
  );
}

/**
 * Splits text into word spans for staggered or scroll-linked reveals.
 * `mode="rise"` animates on entry; `mode="read"` brightens word by word while
 * scrolling (CSS scroll timelines, progressive enhancement); `mode="load"`
 * animates immediately with CSS only — use it above the fold so the largest
 * paint never waits for JavaScript.
 */
export function Words({
  text,
  mode = 'rise',
  as: Tag = 'span',
  className,
  delay = 0,
  id,
}: {
  text: string;
  mode?: 'rise' | 'read' | 'load';
  as?: ElementType;
  className?: string;
  delay?: number;
  id?: string;
}) {
  const words = text.split(/\s+/).filter(Boolean);
  const spans = words.map((w, i) => (
    <span key={i}>
      <span
        className="w"
        style={{ ['--i' as string]: i, ['--p' as string]: (i / Math.max(words.length - 1, 1)).toFixed(3) }}
      >
        {w}
      </span>
      {i < words.length - 1 ? ' ' : null}
    </span>
  ));

  if (mode === 'load') {
    return (
      <Tag id={id} className={cn('words-load', className)} style={{ ['--delay' as string]: delay }}>
        <span className="sr-only">{text}</span>
        <span aria-hidden="true">{spans}</span>
      </Tag>
    );
  }
  if (mode === 'read') {
    return (
      <Tag id={id} className={cn('scroll-read', className)}>
        <span className="sr-only">{text}</span>
        <span aria-hidden="true">{spans}</span>
      </Tag>
    );
  }
  return (
    <Tag id={id} data-reveal="words" className={className} style={{ ['--delay' as string]: delay }}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{spans}</span>
    </Tag>
  );
}
