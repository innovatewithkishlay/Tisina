import { Archivo, Bodoni_Moda } from 'next/font/google';

/*
 * Typography
 * - Bodoni Moda: high-contrast Didone for headlines, dish names and the
 *   wordmark. Its optical-size axis keeps hairlines crisp at display sizes.
 * - Archivo: the working text face for body copy, labels and UI.
 * Both cover latin-ext (Croatian č ć đ š ž, Hungarian ő ű, German ß).
 * `subsets` only controls preloading; latin-ext loads on demand via unicode-range.
 */
export const display = Bodoni_Moda({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
  variable: '--font-display-face',
  display: 'swap',
});
export const sans = Archivo({ subsets: ['latin'], variable: '--font-sans-face', display: 'swap' });

export const fontVariables = `${display.variable} ${sans.variable}`;
