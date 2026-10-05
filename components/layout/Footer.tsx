import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import type { Locale } from '@/config/locales';
import { siteConfig } from '@/config/site';
import { getHours, getRestaurant } from '@/lib/data/restaurant';
import { formatTime, regionName, telHref, weekdayName } from '@/lib/format';
import { weeklyTable } from '@/lib/hours';

export async function Footer() {
  const locale = (await getLocale()) as Locale;
  const [t, tNav, tHours, r, hours] = await Promise.all([
    getTranslations('Footer'),
    getTranslations('Navigation'),
    getTranslations('Hours'),
    getRestaurant(locale),
    getHours(),
  ]);
  const year = new Date().getFullYear();

  // Compress consecutive days with identical hours: "Tue – Thu".
  const rows: { from: number; to: number; text: string }[] = [];
  for (const { day, periods } of weeklyTable(hours)) {
    const text = periods.length
      ? periods.map((p) => `${formatTime(p.opens, locale)}–${formatTime(p.closes, locale)}`).join(' · ')
      : tHours('closed');
    const prev = rows[rows.length - 1];
    if (prev && prev.text === text && prev.to === day - 1) prev.to = day;
    else rows.push({ from: day, to: day, text });
  }

  return (
    <footer className="night relative overflow-hidden pt-[var(--section)]">
      <div className="wrap">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-display text-h3 max-w-[18ch] text-fg">{t('tagline')}</p>
            <Link
              href="/book"
              className="label mt-8 inline-flex min-h-12 items-center rounded-[var(--radius-pill)] border border-current px-7 transition-colors duration-[var(--dur-2)] hover:bg-fg hover:text-bg"
            >
              {tNav('bookLong')}
            </Link>
          </div>

          <div className="md:col-span-3">
            <h2 className="label text-muted">{t('visit')}</h2>
            <address className="mt-5 not-italic text-fg-2">
              {r.address.street}
              <br />
              {r.address.postalCode} {r.address.city}
              <br />
              {regionName(r.address.countryCode, locale)}
            </address>
            <p className="mt-5 space-y-1 text-fg-2">
              <a className="link-static block w-fit" href={telHref(r.phone)}>
                {r.phone}
              </a>
              <a className="link-static block w-fit" href={`mailto:${r.email}`}>
                {r.email}
              </a>
            </p>
          </div>

          <div className="md:col-span-4">
            <h2 className="label text-muted">{t('hours')}</h2>
            <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-fg-2">
              {rows.map((row) => (
                <div key={row.from} className="contents">
                  <dt className="capitalize">
                    {weekdayName(row.from as 1, locale, 'short')}
                    {row.to !== row.from ? `–${weekdayName(row.to as 1, locale, 'short')}` : ''}
                  </dt>
                  <dd className="tabular-nums">{row.text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-6 border-t hairline py-8 text-small text-muted md:flex-row md:items-center md:justify-between">
          <nav aria-label={t('explore')}>
            <ul className="flex flex-wrap gap-x-7 gap-y-2">
              {siteConfig.nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="link-draw">
                    {tNav(item.key)}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/privacy" className="link-draw">
                  {t('privacy')}
                </Link>
              </li>
              {r.instagram ? (
                <li>
                  <a href={r.instagram} className="link-draw" rel="noopener noreferrer" target="_blank">
                    Instagram
                  </a>
                </li>
              ) : null}
            </ul>
          </nav>
          <p>
            {t('rights', { year, name: r.name })} <span aria-hidden="true">·</span> {t('madeBy')}
          </p>
        </div>
      </div>

      {/* Oversized wordmark bleeding off the bottom edge */}
      <div
        aria-hidden="true"
        data-word={r.name}
        className="ghost-word pointer-events-none -mb-[0.2em] select-none text-center text-[26vw]"
      />
    </footer>
  );
}
