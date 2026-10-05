import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/config/locales';
import { videos } from '@/content/images';
import { getHours, getRestaurant } from '@/lib/data/restaurant';
import { telHref } from '@/lib/format';
import { zonedNow } from '@/lib/hours';
import { localizedUrl, pageMetadata } from '@/lib/seo/metadata';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { JsonLd } from '@/components/seo/JsonLd';
import { Kicker } from '@/components/ui/Kicker';
import { Words } from '@/components/ui/Reveal';
import { FireFilm } from '@/components/booking/FireFilm';
import { BookingForm } from '@/components/booking/BookingForm';
import { ClientMessages } from '@/components/i18n/ClientMessages';
import { ButtonA } from '@/components/ui/Button';

export async function generateMetadata({ params }: PageProps<'/[locale]/book'>) {
  const { locale } = (await params) as { locale: Locale };
  const [t, r] = await Promise.all([getTranslations({ locale, namespace: 'Meta' }), getRestaurant(locale)]);
  return pageMetadata({
    locale,
    path: '/book',
    title: t('bookTitle'),
    description: t('bookDescription', { name: r.name }),
    restaurant: r,
  });
}

export default async function BookPage({ params }: PageProps<'/[locale]/book'>) {
  const { locale } = (await params) as { locale: Locale };
  setRequestLocale(locale);
  const [t, r, hours] = await Promise.all([getTranslations('Booking'), getRestaurant(locale), getHours()]);
  const sideItems = (t.raw('sideItems') as string[]).map((s) => s.replace('{max}', String(r.booking.maxParty)));

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: r.name, url: localizedUrl(locale) },
          { name: t('title'), url: localizedUrl(locale, '/book') },
        ])}
      />
      <div className="night lg:grid lg:grid-cols-2">
        {/* The fire — pinned on the left while the form scrolls */}
        <section className="relative flex h-[78svh] min-h-[34rem] flex-col justify-end overflow-hidden lg:sticky lg:top-0 lg:h-[100svh]">
          <FireFilm poster={videos.fire.poster} src={videos.fire.src} />
          <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgb(15_13_11/0.55),transparent_35%,rgb(15_13_11/0.85))]" />
          <div className="relative px-[var(--gutter)] pb-10 lg:pb-14">
            <Kicker className="rise text-bone/80">{t('eyebrow')}</Kicker>
            <Words
              as="h1"
              mode="load"
              text={t('title')}
              className="font-display mt-6 block max-w-[10ch] text-[clamp(3.5rem,8vw,8.5rem)] italic leading-[0.88] tracking-[-0.03em] text-bone"
            />
            <p className="rise mt-8 max-w-[42ch] text-bone/80" style={{ ['--delay' as string]: 400 }}>
              {t('lede')}
            </p>
          </div>
        </section>

        {/* The invitation */}
        <div className="paper relative z-10 -mt-8 rounded-t-[var(--radius-card)] px-[var(--gutter)] pb-[var(--section)] pt-14 lg:mt-0 lg:rounded-none lg:pt-[calc(var(--header-h)+4rem)]">
          <div className="mx-auto max-w-[40rem]">
            <p className="font-display text-center text-h3 italic text-fg-2">{t('invitation', { name: r.name })}</p>
            <div className="mx-auto mb-14 mt-5 flex items-center justify-center gap-4 text-accent" aria-hidden="true">
              <span className="h-px w-12 bg-current opacity-40" />
              <svg viewBox="0 0 24 14" className="h-2.5"><path d="M1 1 L12 13 L23 1" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
              <span className="h-px w-12 bg-current opacity-40" />
            </div>

            {r.booking.enabled ? (
              <ClientMessages namespaces={['Booking', 'Hours']}>
                <BookingForm
                  hours={hours}
                  booking={r.booking}
                  timeZone={r.timezone}
                  restaurantName={r.name}
                  phone={r.phone}
                  phoneHref={telHref(r.phone)}
                  today={zonedNow(r.timezone).date}
                />
              </ClientMessages>
            ) : (
              <div className="border-t hairline pt-10">
                <p className="text-lede">{t('errors.booking_disabled')}</p>
                <ButtonA href={telHref(r.phone)} className="mt-8">
                  {r.phone}
                </ButtonA>
              </div>
            )}

            <aside className="mt-20 rounded-[var(--radius-card)] bg-bg-2 p-8" aria-labelledby="book-side">
              <h2 id="book-side" className="font-display text-h3 italic">
                {t('sideTitle')}
              </h2>
              <ul className="mt-6 space-y-3 text-fg-2">
                {sideItems.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span aria-hidden="true" className="text-accent">
                      ˇ
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
