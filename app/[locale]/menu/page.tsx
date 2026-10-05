import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/config/locales';
import { getMenu, getRestaurant } from '@/lib/data/restaurant';
import { localizedUrl, pageMetadata } from '@/lib/seo/metadata';
import { breadcrumbJsonLd, menuJsonLd } from '@/lib/seo/jsonld';
import { JsonLd } from '@/components/seo/JsonLd';
import { PageHeader } from '@/components/ui/PageHeader';
import { MenuNav } from '@/components/menu/MenuNav';
import { MenuCategory } from '@/components/menu/MenuCategory';
import { BookingCta } from '@/components/home/BookingCta';
import type { MenuItemLabels } from '@/components/menu/MenuItem';

export async function generateMetadata({ params }: PageProps<'/[locale]/menu'>) {
  const { locale } = (await params) as { locale: Locale };
  const [t, r] = await Promise.all([getTranslations({ locale, namespace: 'Meta' }), getRestaurant(locale)]);
  return pageMetadata({
    locale,
    path: '/menu',
    title: t('menuTitle'),
    description: t('menuDescription', { name: r.name, currency: r.currency }),
    restaurant: r,
  });
}

const ALLERGENS = ['gluten', 'crustaceans', 'eggs', 'fish', 'peanuts', 'soy', 'milk', 'nuts', 'celery', 'mustard', 'sesame', 'sulphites', 'lupin', 'molluscs'] as const;
const DIETARY = ['vegetarian', 'vegan', 'gluten_free', 'dairy_free', 'pescatarian'] as const;

export default async function MenuPage({ params }: PageProps<'/[locale]/menu'>) {
  const { locale } = (await params) as { locale: Locale };
  setRequestLocale(locale);

  const [t, tNav, tHome, r, menu] = await Promise.all([
    getTranslations('Menu'),
    getTranslations('Navigation'),
    getTranslations('Home'),
    getRestaurant(locale),
    getMenu(locale),
  ]);

  const labels: MenuItemLabels = {
    signature: t('signature'),
    seasonal: t('seasonal'),
    unavailable: t('unavailable'),
    marketPrice: t('marketPrice'),
    allergensLabel: t('allergensLabel'),
    dietaryLabel: t('dietaryLabel'),
    allergens: Object.fromEntries(ALLERGENS.map((a) => [a, t(`allergens.${a}`)])),
    dietary: Object.fromEntries(DIETARY.map((d) => [d, t(`dietary.${d}`)])),
  };

  return (
    <>
      <JsonLd data={menuJsonLd(r, menu, locale)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: r.name, url: localizedUrl(locale) },
          { name: t('title'), url: localizedUrl(locale, '/menu') },
        ])}
      />

      <PageHeader eyebrow={t('eyebrow')} title={t('title')} lede={t('lede', { currency: r.currency })} />

      {menu.length > 0 ? (
        <>
          <MenuNav label={t('jumpTo')} categories={menu.map((c) => ({ slug: c.slug, name: c.name }))} />
          <div className="wrap">
            {menu.map((category, i) => (
              <MenuCategory key={category.slug} category={category} index={i} locale={locale} labels={labels} />
            ))}
          </div>
        </>
      ) : (
        <p className="wrap pb-24 text-lede text-fg-2">{t('empty')}</p>
      )}

      <section className="wrap grid gap-6 border-t hairline py-16 lg:grid-cols-12" aria-labelledby="legend-title">
        <h2 id="legend-title" className="label text-muted lg:col-span-4">
          {t('legendTitle')}
        </h2>
        <div className="lg:col-span-7 lg:col-start-6">
          <p className="max-w-[60ch] text-fg-2">{t('legendBody')}</p>
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-small text-muted">
            {ALLERGENS.map((a) => (
              <li key={a}>{labels.allergens[a]}</li>
            ))}
          </ul>
        </div>
      </section>

      <BookingCta label={tNav('book')} title={t('ctaTitle')} body={tHome('bookBody')} />
    </>
  );
}
