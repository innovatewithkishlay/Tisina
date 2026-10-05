import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';
import { siteConfig } from '@/config/site';

/**
 * Locale routing is driven entirely by `config/site.ts`: enable a language
 * there and `/<locale>/…` routes, the switcher, hreflang and the sitemap all
 * follow. Every URL carries its locale prefix so each language has one
 * canonical URL (no duplicate content between `/` and `/hr`).
 */
export const routing = defineRouting({
  locales: siteConfig.locales,
  defaultLocale: siteConfig.defaultLocale,
  localePrefix: 'always',
  // We emit our own hreflang tags in metadata (see lib/seo/metadata.ts).
  alternateLinks: false,
});

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
