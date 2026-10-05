#!/usr/bin/env node
/**
 * Pre-builds responsive WebP copies of every photo in public/images, so the
 * site never depends on an on-demand image optimizer (Vercel's has a monthly
 * quota on the Hobby plan; past it, new sizes fail to load).
 *
 *   public/images/photo/octopus.jpg → public/images/opt/photo/octopus-{640,1280,1920}.webp
 *
 * lib/image-loader.ts points next/image at these files. Re-run after adding
 * or replacing a photo:  npm run media:optimize
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';

export const WIDTHS = [640, 1280, 1920];
const ROOT = 'public/images';
const OUT = join(ROOT, 'opt');
const force = process.argv.includes('--force');

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (p === OUT) return [];
    return statSync(p).isDirectory() ? walk(p) : /\.(jpe?g|png)$/i.test(name) ? [p] : [];
  });

let made = 0;
for (const file of walk(ROOT)) {
  const base = relative(ROOT, file).replace(/\.(jpe?g|png)$/i, '');
  for (const w of WIDTHS) {
    const out = join(OUT, `${base}-${w}.webp`);
    if (!force && existsSync(out) && statSync(out).mtimeMs >= statSync(file).mtimeMs) continue;
    mkdirSync(dirname(out), { recursive: true });
    // ">" never upscales: a 1024px source stays 1024px in the 1280/1920 files.
    execFileSync('convert', [file, '-auto-orient', '-strip', '-resize', `${w}x>`, '-quality', w <= 640 ? '74' : '70', '-define', 'webp:method=6', out]);
    made += 1;
  }
}
console.log(`optimize-images: ${made} file(s) written to ${OUT}`);
