import { cn } from '@/lib/utils';

/**
 * Tišina wordmark. Letterforms are Anton outlines (converted with opentype.js,
 * tracked +6 units); the háček over the "S" is a separate stroke
 * so it can carry the accent colour and draw itself in. Replace this file with
 * the official logo when forking.
 */
export const LOGO_VIEWBOX = "0 -226 489 228";
const LETTERS = "M56.74 0L22.36 0L22.36-138.87L1.95-138.87L1.95-171.87L77.15-171.87L77.15-138.87L56.74-138.87 M124.36 0L91.16 0L91.16-171.87L124.36-171.87 M184.85 1.56Q161.32 1.56 150.92-10.16Q140.52-21.87 140.52-47.46L140.52-64.26L174.50-64.26L174.50-42.77Q174.50-36.82 176.31-33.45Q178.11-30.08 182.61-30.08Q187.29-30.08 189.10-32.81Q190.91-35.55 190.91-41.80Q190.91-49.71 189.34-55.03Q187.78-60.35 183.92-65.19Q180.07-70.02 173.23-76.46L157.80-91.11Q140.52-107.42 140.52-128.42Q140.52-150.39 150.72-161.91Q160.93-173.44 180.26-173.44Q203.89-173.44 213.81-160.84Q223.72-148.24 223.72-122.56L188.76-122.56L188.76-134.37Q188.76-137.89 186.76-139.84Q184.75-141.80 181.34-141.80Q177.23-141.80 175.33-139.50Q173.43-137.21 173.43-133.59Q173.43-129.98 175.38-125.78Q177.33-121.58 183.09-116.11L202.92-97.07Q208.88-91.41 213.86-85.11Q218.84-78.81 221.86-70.46Q224.89-62.11 224.89-50.10Q224.89-25.88 215.96-12.16Q207.02 1.56 184.85 1.56 M273.96 0L240.75 0L240.75-171.87L273.96-171.87 M327.22 0L293.63 0L293.63-171.87L328.98-171.87L344.80-89.55L344.80-171.87L378-171.87L378 0L344.41 0L327.22-85.94 M427.95 0L394.55 0L411.15-171.87L469.45-171.87L485.76 0L453.24 0L450.80-27.73L430.10-27.73L427.95 0M439.08-142.58L432.54-55.18L448.16-55.18L440.64-142.58";
export const HACEK_PATH = "M156.56 -217.88 L182.56 -193.88 L208.56 -217.88";
export const HACEK_STROKE = 9;

export function Logo({
  className,
  title = "Tišina",
  animate = false,
  hacekClassName,
}: {
  className?: string;
  title?: string;
  /** Draw the háček in on mount (CSS only). */
  animate?: boolean;
  hacekClassName?: string;
}) {
  return (
    <svg viewBox={LOGO_VIEWBOX} className={cn("block h-auto", className)} role="img" aria-label={title}>
      <path d={LETTERS} fill="currentColor" />
      <path
        d={HACEK_PATH}
        fill="none"
        stroke="var(--hacek, var(--accent))"
        strokeWidth={HACEK_STROKE}
        strokeLinecap="square"
        strokeLinejoin="miter"
        pathLength={1}
        className={cn(animate && "hacek-draw", hacekClassName)}
      />
    </svg>
  );
}

/** The háček on its own — the brand motif used for bullets, labels and loaders. */
export function Hacek({ className, draw = false }: { className?: string; draw?: boolean }) {
  return (
    <svg viewBox="-2 -2 28 18" className={cn("inline-block h-[0.55em] w-auto", className)} aria-hidden="true">
      <path
        d="M1 1 L12 13 L23 1"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        className={draw ? "hacek-draw" : undefined}
      />
    </svg>
  );
}
