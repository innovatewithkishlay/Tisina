import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { intlLocale, type Locale } from '@/config/locales';
import { siteConfig } from '@/config/site';
import { getHours, getRestaurant } from '@/lib/data/restaurant';
import { formatTime, regionName, telHref, weekdayName } from '@/lib/format';
import { openStatus, weeklyTable } from '@/lib/hours';
import { Logo } from '@/components/brand/Logo';
import { OpenStatus } from './OpenStatus';
import { LocalClock } from './LocalClock';

/**
 * Curtain footer: it sits under the page (sticky to the viewport bottom) and
 * is uncovered as the last section scrolls away. Hours are set like a menu
 * card; the wordmark closes the page at full width.
 */
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
  const now = new Intl.DateTimeFormat(intlLocale(locale), {
    timeZone: r.timezone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date());

  const rows: { from: number; to: number; text: string }[] = [];
  for (const { day, periods } of weeklyTable(hours)) {
    const text = periods.length
      ? periods.map((p) => `${formatTime(p.opens, locale)}–${formatTime(p.closes, locale)}`).join(' · ')
      : tHours('closed');
    const prev = rows[rows.length - 1];
    if (prev && prev.text === text && prev.to === day - 1) prev.to = day;
    else rows.push({ from: day, to: day, text });
  }
  const directions = r.geo ? `https://www.google.com/maps/dir/?api=1&destination=${r.geo.lat},${r.geo.lng}` : r.mapsUrl;

  return (
    <footer className="night relative z-0 flex min-h-[100svh] flex-col justify-between overflow-hidden pt-[calc(var(--header-h)+2rem)] lg:sticky lg:bottom-0 lg:h-[100svh]">
      <div className="wrap shrink-0">
        <div className="flex flex-col gap-8 border-b hairline pb-12 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p
              className="font-display text-[clamp(2.75rem,7vw,6.5rem)] leading-[0.95] tracking-[-0.02em] [&_em]:text-accent"
              dangerouslySetInnerHTML={{ __html: t.raw('ctaTitle') as string }}
            />
            <p className="mt-4 text-lede text-fg-2">{t('ctaBody')}</p>
          </div>
          <Link
            href="/book"
            className="btn-fill label inline-flex min-h-16 w-fit items-center gap-4 rounded-[var(--radius-pill)] bg-bone px-9 text-night transition-colors duration-[var(--dur-2)] [--btn-fill:var(--brand-ember-light)]"
          >
            {tNav('bookLong')}
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="grid gap-10 py-12 text-fg-2 sm:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <h2 className="label text-muted">{t('visit')}</h2>
            <address className="mt-4 not-italic">
              {r.address.street}
              <br />
              {r.address.postalCode} {r.address.city}, {regionName(r.address.countryCode, locale)}
            </address>
            {directions ? (
              <a href={directions} target="_blank" rel="noopener noreferrer" className="link-static mt-3 inline-block text-fg">
                {t('directions')} ↗
              </a>
            ) : null}
          </div>

          <div className="lg:col-span-5">
            <h2 className="label text-muted">{t('hours')}</h2>
            <dl className="mt-4 space-y-1.5">
              {rows.map((row) => (
                <div key={row.from} className="flex items-baseline">
                  <dt className="capitalize">
                    {weekdayName(row.from as 1, locale, 'short')}
                    {row.to !== row.from ? `–${weekdayName(row.to as 1, locale, 'short')}` : ''}
                  </dt>
                  <span aria-hidden="true" className="leader" />
                  <dd className="tabular-nums">{row.text}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="lg:col-span-3 lg:col-start-10">
            <h2 className="label text-muted">{t('localTime', { city: r.address.city })}</h2>
            <p className="font-display mt-3 text-[3.25rem] leading-none text-fg">
              <LocalClock timeZone={r.timezone} initial={now} />
            </p>
            <OpenStatus hours={hours} timeZone={r.timezone} initial={openStatus(hours, r.timezone)} className="mt-4 text-muted" />
            <p className="mt-4 space-y-1">
              <a className="link-static block w-fit" href={telHref(r.phone)}>
                {r.phone}
              </a>
              <a className="link-static block w-fit break-all" href={`mailto:${r.email}`}>
                {r.email}
              </a>
            </p>
          </div>
        </div>
      </div>

      <div className="wrap flex flex-1 flex-col justify-end min-h-0 overflow-hidden">
        <Logo className="w-full h-auto max-h-[30vh] shrink text-bone mt-auto" title={r.name} />
        <div className="flex shrink-0 flex-col gap-4 border-t hairline py-6 text-small text-muted md:flex-row md:items-center md:justify-between mt-8">
          <nav aria-label={t('explore')}>
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
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
    </footer>
  );
}
