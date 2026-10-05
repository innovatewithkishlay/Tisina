import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/config/locales';
import { getMenu, getRestaurant } from '@/lib/data/restaurant';
import { localizedUrl, pageMetadata } from '@/lib/seo/metadata';
import { breadcrumbJsonLd, menuJsonLd } from '@/lib/seo/jsonld';
import { JsonLd } from '@/components/seo/JsonLd';
import { images } from '@/content/images';
import { formatPrice } from '@/lib/format';
import { MenuHero } from '@/components/menu/MenuHero';
import { MenuBoard, type BoardCategory } from '@/components/menu/MenuBoard';

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

/**
 * Photograph shown for each course (by category slug) in the pinned frame.
 * Dishes with their own photo override it while they are in view.
 */
const COURSE_IMAGES = images.courses;
const COURSE_FALLBACK = images.kitchen.hands.src;
const HERO_PLATES = [
  '/images/photo/oysters.jpg',
  images.hero.src,
  '/images/photo/octopus.jpg',
  '/images/photo/panna-cotta.jpg',
  '/images/photo/tuna-tartare.jpg',
  '/images/photo/beef-stew.jpg',
  '/images/photo/burrata.jpg',
  '/images/photo/rozata.jpg',
];

export default async function MenuPage({ params }: PageProps<'/[locale]/menu'>) {
  const { locale } = (await params) as { locale: Locale };
  setRequestLocale(locale);

  const [t, r, menu] = await Promise.all([getTranslations('Menu'), getRestaurant(locale), getMenu(locale)]);

  const allergen = (a: string) => t(`allergens.${a as (typeof ALLERGENS)[number]}`);
  const categories: BoardCategory[] = menu.map((c) => ({
    slug: c.slug,
    name: c.name,
    description: c.description,
    image: COURSE_IMAGES[c.slug] ?? COURSE_FALLBACK,
    items: c.items.map((i) => ({
      slug: i.slug,
      name: i.name,
      description: i.description,
      price: i.price === null ? t('marketPrice') : formatPrice(i.price, i.currency, locale),
      marketPrice: i.price === null,
      image: i.image,
      featured: i.featured,
      seasonal: i.seasonal,
      available: i.available,
      allergens: i.allergens.map(allergen),
      dietary: i.dietary,
    })),
  }));
  const dishCount = categories.reduce((n, c) => n + c.items.length, 0);

  return (
    <>
      <JsonLd data={menuJsonLd(r, menu, locale)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: r.name, url: localizedUrl(locale) },
          { name: t('title'), url: localizedUrl(locale, '/menu') },
        ])}
      />

      <MenuHero
        eyebrow={t('eyebrow')}
        title={t('title')}
        lede={t('lede', { currency: r.currency })}
        count={(dishCount === 1 ? t('countOne') : t('countOther')).replace('#', String(dishCount))}
        plates={HERO_PLATES.map((src) => ({ src, alt: t('plateAlt') }))}
      />

      {categories.length > 0 ? (
        <MenuBoard
          categories={categories}
          labels={{
            signature: t('signature'),
            seasonal: t('seasonal'),
            unavailable: t('unavailable'),
            allergensLabel: t('allergensLabel'),
            dietaryLabel: t('dietaryLabel'),
            jumpTo: t('jumpTo'),
            filterLabel: t('filterLabel'),
            filterAll: t('filterAll'),
            countOne: t('countOne'),
            countOther: t('countOther'),
            noMatch: t('noMatch'),
            dietary: Object.fromEntries(DIETARY.map((d) => [d, t(`dietary.${d}`)])),
          }}
        />
      ) : (
        <p className="wrap py-24 text-lede text-fg-2">{t('empty')}</p>
      )}

      <section className="paper wrap grid gap-6 border-t hairline py-16 lg:grid-cols-12" aria-labelledby="legend-title">
        <h2 id="legend-title" className="label text-muted lg:col-span-4">
          {t('legendTitle')}
        </h2>
        <div className="lg:col-span-7 lg:col-start-6">
          <p className="max-w-[60ch] text-fg-2">{t('legendBody')}</p>
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-small text-muted">
            {ALLERGENS.map((a) => (
              <li key={a}>{allergen(a)}</li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
