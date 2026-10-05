import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/config/locales';
import { getRestaurant } from '@/lib/data/restaurant';
import { telHref } from '@/lib/format';
import { localizedUrl, pageMetadata } from '@/lib/seo/metadata';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { JsonLd } from '@/components/seo/JsonLd';
import { PageHeader } from '@/components/ui/PageHeader';
import { Reveal } from '@/components/ui/Reveal';
import { ContactForm } from '@/components/contact/ContactForm';
import { ClientMessages } from '@/components/i18n/ClientMessages';

export async function generateMetadata({ params }: PageProps<'/[locale]/contact'>) {
  const { locale } = (await params) as { locale: Locale };
  const [t, r] = await Promise.all([getTranslations({ locale, namespace: 'Meta' }), getRestaurant(locale)]);
  return pageMetadata({
    locale,
    path: '/contact',
    title: t('contactTitle'),
    description: t('contactDescription', { name: r.name }),
    restaurant: r,
  });
}

export default async function ContactPage({ params }: PageProps<'/[locale]/contact'>) {
  const { locale } = (await params) as { locale: Locale };
  setRequestLocale(locale);
  const [t, tVisit, r] = await Promise.all([getTranslations('Contact'), getTranslations('Visit'), getRestaurant(locale)]);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: r.name, url: localizedUrl(locale) },
          { name: t('title'), url: localizedUrl(locale, '/contact') },
        ])}
      />
      <PageHeader eyebrow={t('eyebrow')} title={t('title')} lede={t('lede')} />

      <div className="wrap grid gap-16 pb-[var(--section)] lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-7">
          <ClientMessages namespaces={['Contact', 'Booking']}>
            <ContactForm restaurantName={r.name} restaurantEmail={r.email} />
          </ClientMessages>
        </div>
        <Reveal className="lg:col-span-4 lg:col-start-9">
          <div className="night p-8 sm:p-10 lg:sticky lg:top-28">
            <h2 className="label text-muted">{t('direct')}</h2>
            <p className="mt-6 space-y-2 font-display text-h3">
              <a href={telHref(r.phone)} className="link-draw block w-fit">
                {r.phone}
              </a>
              <a href={`mailto:${r.email}`} className="link-draw block w-fit break-all text-[0.8em]">
                {r.email}
              </a>
            </p>
            <h2 className="label mt-10 text-muted">{tVisit('addressTitle')}</h2>
            <address className="mt-4 not-italic text-fg-2">
              {r.address.street}
              <br />
              {r.address.postalCode} {r.address.city}
            </address>
          </div>
        </Reveal>
      </div>
    </>
  );
}
