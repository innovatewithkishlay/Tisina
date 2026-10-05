import { Anton, Archivo, Bodoni_Moda } from 'next/font/google';

/*
 * Typography
 * - Anton: ultra-condensed display caps for headlines, numbers and the wordmark.
 * - Bodoni Moda italic: high-contrast accent for dish names, quotes and asides.
 * - Archivo: the working text face for body copy, labels and UI.
 * All three cover latin-ext (Croatian č ć đ š ž, Hungarian ő ű, German ß).
 * `subsets` only controls preloading; latin-ext loads on demand via unicode-range.
 */
export const display = Anton({ subsets: ['latin'], weight: '400', variable: '--font-display-face', display: 'swap' });
export const serif = Bodoni_Moda({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  weight: '400',
  variable: '--font-serif-face',
  display: 'swap',
  // Used for accents below the fold — not worth competing with the first paint.
  preload: false,
});
export const sans = Archivo({ subsets: ['latin'], variable: '--font-sans-face', display: 'swap' });

export const fontVariables = `${display.variable} ${serif.variable} ${sans.variable}`;
