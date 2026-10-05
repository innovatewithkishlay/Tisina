'use client';

/**
 * next/image loader for pre-built WebP files (see scripts/optimize-images.mjs).
 * Local photos resolve to the smallest generated width that covers the
 * request, served as static files — no on-demand optimizer, no quota.
 * Anything else (e.g. a Supabase Storage URL) is returned unchanged.
 */
const WIDTHS = [640, 1280, 1920];

export default function imageLoader({ src, width }: { src: string; width: number; quality?: number }) {
  if (!src.startsWith('/images/') || src.startsWith('/images/opt/') || !/\.(jpe?g|png)$/i.test(src)) return src;
  const w = WIDTHS.find((x) => x >= width) ?? WIDTHS[WIDTHS.length - 1];
  return `/images/opt/${src.slice('/images/'.length).replace(/\.(jpe?g|png)$/i, '')}-${w}.webp`;
}
