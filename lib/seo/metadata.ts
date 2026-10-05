import type { Metadata } from 'next';
import { knownLocales, type Locale } from '@/config/locales';
import { siteConfig } from '@/config/site';
import type { Restaurant } from '@/types/restaurant';

/** Absolute URL for a locale + path, e.g. ("hr", "/menu") → https://…/hr/menu */
export function localizedUrl(locale: Locale, path = ''): string {
  const clean = path === '/' ? '' : path;
  return `${siteConfig.siteUrl}/${locale}${clean}`;
}

/**
 * hreflang alternates for a path in every enabled locale, plus x-default
 * pointing at the default locale. Next renders these as
 * <link rel="alternate" hreflang="…">.
 */
export function languageAlternates(path = ''): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const l of siteConfig.locales) languages[knownLocales[l].hreflang] = localizedUrl(l, path);
  languages['x-default'] = localizedUrl(siteConfig.defaultLocale, path);
  return languages;
}

interface PageMetaInput {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  restaurant: Restaurant;
  image?: { url: string; alt: string };
  /** Use the title as-is instead of applying the "%s — Brand" template. */
  absoluteTitle?: boolean;
}

export function pageMetadata({
  locale,
  path,
  title,
  description,
  restaurant,
  image,
  absoluteTitle,
}: PageMetaInput): Metadata {
  const url = localizedUrl(locale, path);
  // Default share image: generated per locale by app/[locale]/opengraph-image.tsx.
  const og = image ?? { url: `/${locale}/opengraph-image`, alt: restaurant.metaTitle };
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url, languages: languageAlternates(path) },
    openGraph: {
      type: 'website',
      url,
      siteName: restaurant.name,
      title: absoluteTitle ? title : `${title} — ${restaurant.name}`,
      description,
      locale: knownLocales[locale].ogLocale,
      alternateLocale: siteConfig.locales.filter((l) => l !== locale).map((l) => knownLocales[l].ogLocale),
      images: [{ url: og.url, alt: og.alt, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: absoluteTitle ? title : `${title} — ${restaurant.name}`,
      description,
      images: [og.url],
    },
  };
}
