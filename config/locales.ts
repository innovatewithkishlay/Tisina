/**
 * Every locale the starter knows how to render.
 *
 * A restaurant enables a subset of these in `config/site.ts` → `locales`.
 * Adding a brand-new language means: add it here, add `messages/<code>.json`,
 * add localized rows in `content/restaurant.ts` and re-run the seed.
 */
export const knownLocales = {
  en: { label: 'English', short: 'EN', hreflang: 'en', intl: 'en-GB', ogLocale: 'en_GB' },
  hr: { label: 'Hrvatski', short: 'HR', hreflang: 'hr', intl: 'hr-HR', ogLocale: 'hr_HR' },
  de: { label: 'Deutsch', short: 'DE', hreflang: 'de', intl: 'de-DE', ogLocale: 'de_DE' },
  hu: { label: 'Magyar', short: 'HU', hreflang: 'hu', intl: 'hu-HU', ogLocale: 'hu_HU' },
} as const;

export type Locale = keyof typeof knownLocales;

export function intlLocale(locale: Locale): string {
  return knownLocales[locale].intl;
}
