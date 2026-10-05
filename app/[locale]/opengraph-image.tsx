import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import type { Locale } from '@/config/locales';
import { images } from '@/content/images';
import { getRestaurant } from '@/lib/data/restaurant';
import { siteConfig } from '@/config/site';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = siteConfig.brandName;

/** Social sharing card, generated per locale at build time in the brand typography. */
export default async function OpengraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const [r, display, photo] = await Promise.all([
    getRestaurant(locale as Locale),
    readFile(join(process.cwd(), 'assets/fonts/Anton-Regular.ttf')),
    readFile(join(process.cwd(), 'public', images.hero.src)),
  ]);
  const src = `data:image/jpeg;base64,${photo.toString('base64')}`;

  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%', background: '#0e0e0d', color: '#ecebe6' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '64px 56px 56px 64px', width: 660 }}>
          <div style={{ fontFamily: 'Display', fontSize: 22, letterSpacing: 3, textTransform: 'uppercase', color: '#93a0ff' }}>
            {`${r.address.street} · ${r.address.city}`}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontFamily: 'Display', fontSize: 210, lineHeight: 0.85, textTransform: 'uppercase' }}>{r.name}</div>
            <div style={{ fontFamily: 'Display', fontSize: 40, lineHeight: 1.1, marginTop: 28, color: '#cfcec7', maxWidth: 540, textTransform: 'uppercase' }}>
              {r.tagline}
            </div>
          </div>
        </div>
        <img src={src} alt="" width={540} height={630} style={{ objectFit: 'cover', width: 540, height: 630 }} />
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Display', data: display, style: 'normal', weight: 400 },
      ],
    },
  );
}
