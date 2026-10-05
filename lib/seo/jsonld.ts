import type { Locale } from '@/config/locales';
import { knownLocales } from '@/config/locales';
import { siteConfig } from '@/config/site';
import type { Hours, MenuCategory, Restaurant } from '@/types/restaurant';
import { localizedUrl } from './metadata';

/**
 * schema.org builders. Only facts that exist in the data are emitted — no
 * ratings, reviews, awards or other claims are ever generated.
 */

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const abs = (path: string) => (path.startsWith('http') ? path : `${siteConfig.siteUrl}${path}`);

export function restaurantId() {
  return `${siteConfig.siteUrl}/#restaurant`;
}

export function restaurantJsonLd(r: Restaurant, hours: Hours, locale: Locale, images: string[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': restaurantId(),
    name: r.name,
    description: r.description,
    slogan: r.tagline,
    url: localizedUrl(locale),
    telephone: r.phone,
    email: r.email,
    image: images.map(abs),
    servesCuisine: r.cuisine,
    priceRange: r.priceRange,
    currenciesAccepted: r.currency,
    acceptsReservations: r.booking.enabled ? localizedUrl(locale, '/book') : false,
    hasMenu: localizedUrl(locale, '/menu'),
    inLanguage: knownLocales[locale].hreflang,
    availableLanguage: r.locales.map((l) => knownLocales[l].label),
    address: {
      '@type': 'PostalAddress',
      streetAddress: r.address.street,
      postalCode: r.address.postalCode,
      addressLocality: r.address.city,
      addressRegion: r.address.region,
      addressCountry: r.address.countryCode,
    },
    ...(r.geo && { geo: { '@type': 'GeoCoordinates', latitude: r.geo.lat, longitude: r.geo.lng } }),
    ...(r.mapsUrl && { hasMap: r.mapsUrl }),
    ...(r.instagram && { sameAs: [r.instagram] }),
    openingHoursSpecification: [
      ...hours.weekly.map((h) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: `https://schema.org/${DAY_NAMES[h.day - 1]}`,
        opens: h.opens,
        closes: h.closes,
      })),
      ...hours.special.map((s) => ({
        '@type': 'OpeningHoursSpecification',
        validFrom: s.date,
        validThrough: s.date,
        ...(s.closed ? { opens: '00:00', closes: '00:00' } : { opens: s.opens, closes: s.closes }),
      })),
    ],
  };
}

export function websiteJsonLd(r: Restaurant, locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteConfig.siteUrl}/#website`,
    name: r.name,
    url: localizedUrl(locale),
    inLanguage: knownLocales[locale].hreflang,
    publisher: { '@id': restaurantId() },
  };
}

export function menuJsonLd(r: Restaurant, menu: MenuCategory[], locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    '@id': `${localizedUrl(locale, '/menu')}#menu`,
    name: `${r.name} — Menu`,
    inLanguage: knownLocales[locale].hreflang,
    url: localizedUrl(locale, '/menu'),
    hasMenuSection: menu.map((c) => ({
      '@type': 'MenuSection',
      name: c.name,
      description: c.description,
      hasMenuItem: c.items.map((i) => ({
        '@type': 'MenuItem',
        name: i.name,
        description: i.description,
        ...(i.image && { image: abs(i.image) }),
        ...(i.price !== null && {
          offers: {
            '@type': 'Offer',
            price: i.price.toFixed(2),
            priceCurrency: i.currency,
            availability: i.available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          },
        }),
        ...(i.dietary.some((d) => DIET_MAP[d]) && {
          suitableForDiet: i.dietary.map((d) => DIET_MAP[d]).filter(Boolean),
        }),
      })),
    })),
  };
}

const DIET_MAP: Record<string, string | undefined> = {
  vegetarian: 'https://schema.org/VegetarianDiet',
  vegan: 'https://schema.org/VeganDiet',
  gluten_free: 'https://schema.org/GlutenFreeDiet',
};

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function faqJsonLd(faq: { q: string; a: string }[], locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: knownLocales[locale].hreflang,
    mainEntity: faq.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}
