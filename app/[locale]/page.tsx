import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/config/locales';
import { images } from '@/content/images';
import { getFeaturedDishes, getHours, getRestaurant } from '@/lib/data/restaurant';
import { formatPrice } from '@/lib/format';
import { openStatus } from '@/lib/hours';
import { pageMetadata } from '@/lib/seo/metadata';
import { restaurantJsonLd, websiteJsonLd } from '@/lib/seo/jsonld';
import { JsonLd } from '@/components/seo/JsonLd';
import { OpenStatus } from '@/components/layout/OpenStatus';
import { Hero } from '@/components/home/Hero';
import { Statement } from '@/components/home/Statement';
import { Regions } from '@/components/home/Regions';
import { SignatureDish } from '@/components/home/SignatureDish';
import { Definition } from '@/components/home/Definition';
import { MenuPreview } from '@/components/home/MenuPreview';
import { RoomGallery } from '@/components/home/RoomGallery';
import { BookingCta } from '@/components/home/BookingCta';
import { OpeningHours } from '@/components/visit/OpeningHours';
import { Location } from '@/components/visit/Location';
import { ButtonLink } from '@/components/ui/Button';
import { Reveal, Words } from '@/components/ui/Reveal';

export async function generateMetadata({ params }: PageProps<'/[locale]'>) {
  const { locale } = (await params) as { locale: Locale };
  const r = await getRestaurant(locale);
  return pageMetadata({
    locale,
    path: '',
    title: r.metaTitle,
    description: r.metaDescription,
    restaurant: r,
    absoluteTitle: true,
  });
}

const REGION_KEYS = ['istra', 'dalmacija', 'jadran'] as const;
const GALLERY_KEYS = ['candles', 'wine', 'window', 'linen', 'dessert', 'garden'] as const;
/** Which menu item the "Signature" section features (falls back to the first featured dish). */
const SIGNATURE_SLUG = 'dalmatian-pasticada';

export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale } = (await params) as { locale: Locale };
  setRequestLocale(locale);

  const [t, tVisit, r, hours, featured] = await Promise.all([
    getTranslations('Home'),
    getTranslations('Visit'),
    getRestaurant(locale),
    getHours(),
    getFeaturedDishes(locale),
  ]);

  const signature = featured.find((d) => d.slug === SIGNATURE_SLUG) ?? featured[0];
  const price = (p: number | null, currency: string) => (p === null ? '' : formatPrice(p, currency, locale));

  return (
    <>
      <JsonLd data={restaurantJsonLd(r, hours, locale, [images.hero.src, images.signature.src, images.room.src])} />
      <JsonLd data={websiteJsonLd(r, locale)} />

      <Hero
        name={r.name}
        eyebrow={t('eyebrow')}
        line={t('heroLine')}
        imageAlt={t('heroImageAlt')}
        ctaBook={t('ctaBook')}
        ctaMenu={t('ctaMenu')}
        scroll={t('scroll')}
        status={<OpenStatus hours={hours} timeZone={r.timezone} initial={openStatus(hours, r.timezone)} />}
      />

      <Statement label={t('introLabel')} text={t('intro')} />

      <Regions
        label={t('regionsLabel')}
        items={REGION_KEYS.map((key) => ({
          key,
          region: t(`regions.${key}.region`),
          dish: t(`regions.${key}.dish`),
          body: t(`regions.${key}.body`),
          alt: t(`regions.${key}.alt`),
          image: images.regions[key],
        }))}
      />

      {signature ? (
        <SignatureDish
          label={t('signatureLabel')}
          name={signature.name}
          description={signature.description}
          note={t('signatureNote')}
          price={price(signature.price, signature.currency)}
          image={{ src: signature.image ?? images.signature.src, alt: t('regions.dalmacija.alt') }}
          cta={t('menuCta')}
        />
      ) : null}

      <Definition
        word={t('definitionWord')}
        pron={t('definitionPron')}
        kind={t('definitionKind')}
        senses={[t('definition1'), t('definition2')]}
      />

      <MenuPreview
        label={t('menuLabel')}
        title={t('menuTitle')}
        body={t('menuBody')}
        cta={t('menuCta')}
        dishes={featured.map((d) => ({
          slug: d.slug,
          name: d.name,
          category: d.category,
          description: d.description,
          price: price(d.price, d.currency),
          image: d.image,
        }))}
      />

      <RoomGallery
        label={t('roomLabel')}
        title={t('roomTitle')}
        body={t('roomBody')}
        galleryLabel={t('galleryLabel')}
        items={GALLERY_KEYS.map((key) => ({ key, ...images.gallery[key], caption: t(`gallery.${key}`) }))}
      />

      <section className="section" aria-labelledby="visit-title">
        <div className="wrap grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="label label-rule text-muted">{t('visitLabel')}</p>
            </Reveal>
            <Words as="h2" id="visit-title" text={t('visitTitle')} className="font-display text-h2 mt-6 block" />
            <Reveal kind="mask" className="parallax-img relative mt-10 aspect-[16/10] overflow-hidden">
              <Image src={images.visit.src} alt="" fill sizes="(min-width: 1024px) 38vw, 100vw" className="object-cover" />
            </Reveal>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <Reveal>
              <Location
                restaurant={r}
                locale={locale}
                labels={{ address: tVisit('addressTitle'), contact: tVisit('contactTitle'), directions: tVisit('directions') }}
              />
            </Reveal>
            <Reveal delay={120} className="mt-14">
              <OpeningHours
                hours={hours}
                locale={locale}
                timeZone={r.timezone}
                defaultLocale={r.defaultLocale}
                city={r.address.city}
              />
              <ButtonLink href="/visit" variant="text" arrow className="mt-6">
                {t('visitCta')}
              </ButtonLink>
            </Reveal>
          </div>
        </div>
      </section>

      <BookingCta label={t('bookLabel')} title={t('bookTitle')} body={t('bookBody')} />
    </>
  );
}
