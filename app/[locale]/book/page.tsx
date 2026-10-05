import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/config/locales';
import { images } from '@/content/images';
import { getHours, getRestaurant } from '@/lib/data/restaurant';
import { telHref } from '@/lib/format';
import { zonedNow } from '@/lib/hours';
import { localizedUrl, pageMetadata } from '@/lib/seo/metadata';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { JsonLd } from '@/components/seo/JsonLd';
import { PageHeader } from '@/components/ui/PageHeader';
import { Reveal } from '@/components/ui/Reveal';
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
      <PageHeader eyebrow={t('eyebrow')} title={t('title')} lede={t('lede')} />

      <div className="wrap grid gap-16 pb-[var(--section)] lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-7">
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
        </div>

        <aside className="lg:col-span-4 lg:col-start-9">
          <div className="lg:sticky lg:top-28">
            <Reveal kind="mask" className="relative aspect-[4/5] overflow-hidden">
              <Image src={images.booking.src} alt="" fill sizes="(min-width: 1024px) 30vw, 100vw" className="object-cover" />
            </Reveal>
            <Reveal delay={150} className="mt-8">
              <h2 className="label text-muted">{t('sideTitle')}</h2>
              <ul className="mt-4 space-y-3 text-fg-2">
                {sideItems.map((item) => (
                  <li key={item} className="flex gap-3 border-b hairline pb-3">
                    <span aria-hidden="true" className="text-accent">
                      ·
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </aside>
      </div>
    </>
  );
}
