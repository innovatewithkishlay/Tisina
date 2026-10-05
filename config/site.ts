import type { Locale } from './locales';

/**
 * Site-level configuration for the restaurant this repository is deployed for.
 *
 * This is the first file to edit when forking the starter for a new
 * restaurant. Restaurant *facts* (address, hours, menu…) live in
 * `content/restaurant.ts` and in Supabase; this file controls identity,
 * routing and presentation.
 */
export const siteConfig = {
  /** Must match `restaurants.slug` in Supabase. */
  restaurantSlug: 'tisina',

  /** Wordmark text. Swap `logo` in when an official logo file exists. */
  brandName: 'Tišina',
  /** Optional official logo (SVG in /public). When null the text wordmark is used. */
  logo: null as null | { src: string; width: number; height: number },

  /** Enabled languages, in switcher order. The first one is not special. */
  locales: ['hr', 'en', 'de', 'hu'] as const satisfies readonly Locale[],
  /** Locale served at `/` and used as x-default. */
  defaultLocale: 'hr' as Locale,

  /** Canonical origin, no trailing slash. */
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, ''),

  /** Primary navigation. Keys map to `Navigation.*` in messages. */
  nav: [
    { key: 'menu', href: '/menu' },
    { key: 'story', href: '/story' },
    { key: 'visit', href: '/visit' },
    { key: 'contact', href: '/contact' },
  ] as const,

  /** Seconds between ISR refreshes of Supabase-backed pages. */
  revalidateSeconds: 300,
} as const;

export type SiteLocale = (typeof siteConfig.locales)[number];
