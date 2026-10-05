import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';
import { restaurant } from '@/content/restaurant';

export default function manifest(): MetadataRoute.Manifest {
  const l = restaurant.i18n[siteConfig.defaultLocale] ?? restaurant.i18n.en;
  return {
    name: siteConfig.brandName,
    short_name: siteConfig.brandName,
    description: l?.shortDescription,
    start_url: `/${siteConfig.defaultLocale}`,
    display: 'browser',
    background_color: '#efe9df',
    theme_color: '#efe9df',
    icons: [
      { src: '/icon.svg', type: 'image/svg+xml', sizes: 'any' },
      { src: '/apple-icon.png', type: 'image/png', sizes: '180x180' },
    ],
  };
}
