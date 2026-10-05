import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';
import { languageAlternates, localizedUrl } from '@/lib/seo/metadata';

/** Every page × every enabled locale, each entry listing its translations. */
const PAGES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '', priority: 1, changeFrequency: 'weekly' },
  { path: '/menu', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/book', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/visit', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/story', priority: 0.6, changeFrequency: 'yearly' },
  { path: '/contact', priority: 0.5, changeFrequency: 'yearly' },
  { path: '/privacy', priority: 0.2, changeFrequency: 'yearly' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return PAGES.flatMap(({ path, priority, changeFrequency }) =>
    siteConfig.locales.map((locale) => ({
      url: localizedUrl(locale, path),
      lastModified,
      changeFrequency,
      priority,
      alternates: { languages: languageAlternates(path) },
    })),
  );
}
