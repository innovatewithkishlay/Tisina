import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/config/locales';
import { images } from '@/content/images';
import { getHours, getRestaurant } from '@/lib/data/restaurant';
import { openStatus } from '@/lib/hours';
import { localizedUrl, pageMetadata } from '@/lib/seo/metadata';
import { breadcrumbJsonLd, faqJsonLd } from '@/lib/seo/jsonld';
import { JsonLd } from '@/components/seo/JsonLd';
import { PageHeader } from '@/components/ui/PageHeader';
import { Reveal } from '@/components/ui/Reveal';
import { OpenStatus } from '@/components/layout/OpenStatus';
import { OpeningHours } from '@/components/visit/OpeningHours';
import { Location } from '@/components/visit/Location';
import { Faq } from '@/components/visit/Faq';
import { BookingCta } from '@/components/home/BookingCta';

export async function generateMetadata({ params }: PageProps<'/[locale]/visit'>) {
  const { locale } = (await params) as { locale: Locale };
  const [t, r] = await Promise.all([getTranslations({ locale, namespace: 'Meta' }), getRestaurant(locale)]);
  return pageMetadata({
    locale,
    path: '/visit',
    title: t('visitTitle'),
    description: t('visitDescription', { name: r.name }),
    restaurant: r,
  });
}

export default async function VisitPage({ params }: PageProps<'/[locale]/visit'>) {
  const { locale } = (await params) as { locale: Locale };
  setRequestLocale(locale);
  const [t, tHours, tHome, r, hours] = await Promise.all([
    getTranslations('Visit'),
    getTranslations('Hours'),
    getTranslations('Home'),
    getRestaurant(locale),
    getHours(),
  ]);
  const faq = t.raw('faq') as { q: string; a: string }[];

  return (
    <>
      <JsonLd data={faqJsonLd(faq, locale)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: r.name, url: localizedUrl(locale) },
          { name: t('eyebrow'), url: localizedUrl(locale, '/visit') },
        ])}
      />

      <PageHeader
        eyebrow={t('eyebrow')}
        title={t('title')}
        lede={t('lede')}
        aside={<OpenStatus hours={hours} timeZone={r.timezone} initial={openStatus(hours, r.timezone)} className="text-muted" />}
      />

      <section className="wrap grid gap-16 pb-[var(--section)] lg:grid-cols-12" aria-label={t('addressTitle')}>
        <div className="lg:col-span-5">
          <Reveal>
            <Location
              restaurant={r}
              locale={locale}
              labels={{ address: t('addressTitle'), contact: t('contactTitle'), directions: t('directions') }}
              headingLevel={2}
            />
          </Reveal>
          <Reveal delay={100} className="mt-14">
            <h2 className="label text-muted">{t('gettingHereTitle')}</h2>
            <p className="mt-4 text-fg-2">{t('gettingHere')}</p>
          </Reveal>
          <Reveal kind="mask" className="parallax-img relative mt-14 aspect-[16/10] overflow-hidden">
            <Image src={images.visit.src} alt="" fill sizes="(min-width: 1024px) 38vw, 100vw" className="object-cover" />
          </Reveal>
        </div>
        <Reveal delay={150} className="lg:col-span-6 lg:col-start-7">
          <h2 className="font-display text-h2">{tHours('title')}</h2>
          <OpeningHours
            hours={hours}
            locale={locale}
            timeZone={r.timezone}
            defaultLocale={r.defaultLocale}
            city={r.address.city}
            className="mt-8"
          />
        </Reveal>
      </section>

      <section className="night section" aria-labelledby="faq-title">
        <div className="wrap grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <h2 id="faq-title" className="font-display text-h2">
              {t('faqTitle')}
            </h2>
          </Reveal>
          <Reveal delay={120} className="lg:col-span-7 lg:col-start-6">
            <Faq items={faq} />
          </Reveal>
        </div>
      </section>

      <BookingCta label={tHome('bookLabel')} title={tHome('bookTitle')} body={tHome('bookBody')} />
    </>
  );
}
