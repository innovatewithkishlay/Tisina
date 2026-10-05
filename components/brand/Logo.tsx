import { cn } from '@/lib/utils';

/**
 * Tišina wordmark. Letterforms are Bodoni Moda capitals (96 pt optical size,
 * weight 500, converted with opentype.js and tracked wide); the háček over the "S" is a separate stroke
 * so it can carry the accent colour and draw itself in. Replace this file with
 * the official logo when forking.
 */
export const LOGO_VIEWBOX = "0 -198 801 200";
const LETTERS = "M97.70 0L31.30 0L31.30-0.40L53.30-0.40L53.30-149.60L35.20-149.60Q26.60-149.60 20.80-146.10Q15-142.60 11.40-136.40Q7.80-130.20 6.05-121.95Q4.30-113.70 4-104.20L3.60-104.20L3.60-150L125.40-150L125.40-104.20L124.90-104.20Q124.60-113.70 122.90-121.95Q121.20-130.20 117.60-136.40Q114-142.60 108.10-146.10Q102.20-149.60 93.70-149.60L75.70-149.60L75.70-0.40L97.70-0.40 M222.90 0L154.50 0L154.50-0.40L176.40-0.40L176.40-149.60L154.50-149.60L154.50-150L222.90-150L222.90-149.60L198.90-149.60L198.90-0.40L222.90-0.40 M307.20 3Q294.30 3 285.40-1.05Q276.50-5.10 270.60-12.10L257.50 2L257.10 2L257.10-40.70L257.50-40.70Q259.60-31.80 263.30-23.95Q267-16.10 272.80-10.20Q278.60-4.30 286.70-0.95Q294.80 2.40 305.80 2.40Q316.20 2.40 323.85-1.40Q331.50-5.20 335.80-12.50Q340.10-19.80 340.10-30.20Q340.10-38.80 335.70-44.70Q331.30-50.60 324.10-55Q316.90-59.40 308.25-63.20Q299.60-67 290.95-71.20Q282.30-75.40 275.10-81.05Q267.90-86.70 263.50-94.70Q259.10-102.70 259.10-114.20Q259.10-125.60 265-134.10Q270.90-142.60 280.50-147.30Q290.10-152 301.30-152Q311.20-152 319.20-148.90Q327.20-145.80 333-139.20L345.90-152L346.30-152L346.30-109.90L345.90-109.90Q343.30-123.80 337.45-133Q331.60-142.20 322.80-146.75Q314-151.30 303-151.30Q289.30-151.30 282.15-144.15Q275-137 275-125.60Q275-117.80 279.35-112.40Q283.70-107 290.70-102.85Q297.70-98.70 306.20-94.85Q314.70-91 323.15-86.55Q331.60-82.10 338.65-76.05Q345.70-70 350-61.50Q354.30-53 354.30-40.80Q354.30-27.60 348.45-17.75Q342.60-7.90 331.95-2.45Q321.30 3 307.20 3 M456.10 0L387.70 0L387.70-0.40L409.60-0.40L409.60-149.60L387.70-149.60L387.70-150L456.10-150L456.10-149.60L432.10-149.60L432.10-0.40L456.10-0.40 M485.20-150L505.40-150L505.40-0.40L529.30-0.40L529.30 0L485.20 0L485.20-0.40L505-0.40L505-149.60L485.20-149.60L485.20-150M580.10-150L625.20-150L625.20-149.60L604.20-149.60L604.20 2L603.80 2L505.20-150L532-150L603.80-36.10L603.80-149.60L580.10-149.60 M752.50-48.60L690.80-48.60L690.80-49L752.50-49L752.50-48.60M726.90-153L730-153L782.90-0.40L797.10-0.40L797.10 0L736.30 0L736.30-0.40L757.10-0.40L717.30-123.80L674-0.40L698.30-0.40L698.30 0L654.30 0L654.30-0.40L673.60-0.40";
export const HACEK_PATH = "M286.05 -176.00 L305.25 -159.00 L324.45 -176.00";
export const HACEK_STROKE = 6;

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

/** The wordmark's six letters as separate paths (T, I, S, I, N, A), left to right. */
export const LETTER_PATHS: string[] = (() => {
  const bounds = [140, 240, 370, 470, 640, Infinity];
  const groups: string[][] = bounds.map(() => []);
  for (const part of LETTERS.split(/(?=M)/)) {
    const x = Number.parseFloat(part.slice(1));
    groups[bounds.findIndex((b) => x < b)].push(part.trim());
  }
  return groups.map((g) => g.join(' '));
})();

/**
 * The wordmark with each letter in its own mask, for letter-by-letter
 * entrances. Every letter is its own small <svg> inside an HTML mask, so the
 * entrance is a plain transform the compositor can run — no SVG repaints.
 * Letters carry `.logo-letter` (with `--i`), the háček `.logo-hacek`; the
 * parent decides when they move (see globals.css).
 */
export function LogoLetters({ className, title = "Tišina" }: { className?: string; title?: string }) {
  return (
    <div role="img" aria-label={title} className={cn("logo-letters relative block", className)} style={{ aspectRatio: "801 / 200" }}>
      {LETTER_PATHS.map((d, i) => (
        // Mask: the letters' band (y −158…+8 of the 200-unit box).
        <div key={i} aria-hidden="true" className="absolute inset-x-0 bottom-0 top-[20%] overflow-hidden">
          <svg viewBox={LOGO_VIEWBOX} className="logo-letter absolute inset-x-0 bottom-0 h-[125%] w-full" style={{ ["--i" as string]: i }}>
            <path d={d} fill="currentColor" />
          </svg>
        </div>
      ))}
      <svg viewBox={LOGO_VIEWBOX} aria-hidden="true" className="logo-hacek absolute inset-0 h-full w-full overflow-visible">
        <path d={HACEK_PATH} fill="none" stroke="var(--hacek, var(--accent))" strokeWidth={HACEK_STROKE} strokeLinecap="square" strokeLinejoin="miter" />
      </svg>
    </div>
  );
}
