import { knownLocales, type Locale } from '@/config/locales';
import { siteConfig } from '@/config/site';
import { getHours, getMenu, getRestaurant } from '@/lib/data/restaurant';
import { formatPrice, formatTime, regionName, weekdayName } from '@/lib/format';
import { weeklyTable } from '@/lib/hours';
import { localizedUrl } from '@/lib/seo/metadata';

export const revalidate = 300;

/**
 * /llms.txt — a plain-language, factual summary of the restaurant for AI
 * assistants and answer engines (https://llmstxt.org). Generated from the same
 * data as the website, so it never drifts from the menu or opening hours.
 */
export async function GET() {
  const locale: Locale = (siteConfig.locales as readonly Locale[]).includes('en') ? 'en' : siteConfig.defaultLocale;
  const [r, hours, menu] = await Promise.all([getRestaurant(locale), getHours(), getMenu(locale)]);

  const hoursLines = weeklyTable(hours).map(({ day, periods }) => {
    const times = periods.length
      ? periods.map((p) => `${p.service.replace('_', ' ')} ${formatTime(p.opens, locale)}–${formatTime(p.closes, locale)}`).join(', ')
      : 'closed';
    return `- ${weekdayName(day, locale)}: ${times}`;
  });

  const menuLines = menu.flatMap((c) => [
    `### ${c.name}`,
    ...c.items.map(
      (i) =>
        `- ${i.name}${i.description ? ` — ${i.description}` : ''} (${i.price === null ? 'market price' : formatPrice(i.price, i.currency, locale)})${i.dietary.length ? ` [${i.dietary.join(', ')}]` : ''}`,
    ),
    '',
  ]);

  const body = [
    `# ${r.name}`,
    '',
    `> ${r.description}`,
    '',
    '## Facts',
    `- Type: restaurant (${r.cuisineLabel})`,
    `- Address: ${r.address.street}, ${r.address.postalCode} ${r.address.city}, ${regionName(r.address.countryCode, locale)}`,
    ...(r.geo ? [`- Coordinates: ${r.geo.lat}, ${r.geo.lng}`] : []),
    `- Phone: ${r.phone}`,
    `- Email: ${r.email}`,
    `- Price range: ${r.priceRange ?? 'n/a'}; prices in ${r.currency}`,
    `- Languages spoken on the website: ${r.locales.map((l) => knownLocales[l].label).join(', ')}`,
    `- Reservations: online booking requests at ${localizedUrl(locale, '/book')} (confirmed personally by the restaurant), or by phone`,
    `- Time zone: ${r.timezone}`,
    '',
    '## Opening hours',
    ...hoursLines,
    '',
    '## Pages',
    `- [Menu](${localizedUrl(locale, '/menu')}): full menu with prices and EU allergens`,
    `- [Visit](${localizedUrl(locale, '/visit')}): address, directions, opening hours, FAQ`,
    `- [Reserve a table](${localizedUrl(locale, '/book')})`,
    `- [Story](${localizedUrl(locale, '/story')})`,
    `- [Contact](${localizedUrl(locale, '/contact')})`,
    ...siteConfig.locales
      .filter((l) => l !== locale)
      .map((l) => `- [${knownLocales[l].label} version](${localizedUrl(l)})`),
    '',
    '## Menu',
    ...menuLines,
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400' },
  });
}
