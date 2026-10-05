import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/config/locales';
import { images, videos } from '@/content/images';
import { getFeaturedDishes, getHours, getMenu, getRestaurant } from '@/lib/data/restaurant';
import { formatPrice } from '@/lib/format';
import { openStatus } from '@/lib/hours';
import { pageMetadata } from '@/lib/seo/metadata';
import { restaurantJsonLd, websiteJsonLd } from '@/lib/seo/jsonld';
import { JsonLd } from '@/components/seo/JsonLd';
import { OpenStatus } from '@/components/layout/OpenStatus';
import { HeroVideo } from '@/components/home/HeroVideo';
import { Manifesto } from '@/components/home/Manifesto';
import { CraftHorizontal } from '@/components/home/CraftHorizontal';
import { RegionsScroll } from '@/components/home/RegionsScroll';
import { SignatureDish } from '@/components/home/SignatureDish';
import { MenuGlance } from '@/components/home/MenuGlance';
import { GalleryColumns } from '@/components/home/GalleryColumns';
import { OpeningHours } from '@/components/visit/OpeningHours';
import { Location } from '@/components/visit/Location';
import { Kicker } from '@/components/ui/Kicker';
import { Img } from '@/components/ui/Img';
import { SplitReveal } from '@/components/motion/SplitReveal';
import { ClipReveal } from '@/components/motion/ClipReveal';
import { Parallax } from '@/components/motion/Parallax';
import { LocalClock } from '@/components/layout/LocalClock';
import { intlLocale } from '@/config/locales';
import { ButtonLink } from '@/components/ui/Button';

export async function generateMetadata({ params }: PageProps<'/[locale]'>) {
  const { locale } = (await params) as { locale: Locale };
  const r = await getRestaurant(locale);
  return pageMetadata({ locale, path: '', title: r.metaTitle, description: r.metaDescription, restaurant: r, absoluteTitle: true });
}

/*
 * The three constants below tie the editorial copy (messages/*.json → Home)
 * to imagery and menu data. Adjust them when forking for another restaurant.
 */
const REGION_KEYS = ['istra', 'dalmacija', 'jadran'] as const;
const KITCHEN_KEYS = ['dough', 'fire', 'hands', 'chefs'] as const;
const GALLERY_KEYS = ['candles', 'wine', 'garden', 'window', 'linen', 'dessert'] as const;
/** Which menu item the "Signature" section features (falls back to the first featured dish). */
const SIGNATURE_SLUG = 'octopus-peka';

/** Restaurant-local "HH:MM" for the first paint of the clock. */
const nowAt = (timeZone: string, locale: Locale) =>
  new Intl.DateTimeFormat(intlLocale(locale), { timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date());

export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale } = (await params) as { locale: Locale };
  setRequestLocale(locale);

  const [t, tVisit, tCommon, tFooter, r, hours, featured, menu] = await Promise.all([
    getTranslations('Home'),
    getTranslations('Visit'),
    getTranslations('Common'),
    getTranslations('Footer'),
        getRestaurant(locale),
    getHours(),
    getFeaturedDishes(locale),
    getMenu(locale),
  ]);

  const signature = featured.find((d) => d.slug === SIGNATURE_SLUG) ?? featured[0];
  const price = (p: number | null, currency: string) => (p === null ? '' : formatPrice(p, currency, locale));
  const status = <OpenStatus hours={hours} timeZone={r.timezone} initial={openStatus(hours, r.timezone)} />;

  return (
    <>
      <JsonLd data={restaurantJsonLd(r, hours, locale, [images.signature.src, images.hero.src, images.room.src])} />
      <JsonLd data={websiteJsonLd(r, locale)} />

      <HeroVideo
        name={r.name}
        eyebrow={t('eyebrow')}
        line={t('heroLine')}
        ctaBook={t('ctaBook')}
        ctaMenu={t('ctaMenu')}
        scroll={t('scroll')}
        badge={`${t('ctaBook')} · ${r.address.street} · ${r.address.city} · `}
        cursorReserve={tCommon('cursorReserve')}
        pauseLabel={t('videoPause')}
        playLabel={t('videoPlay')}
        status={status}
        poster={videos.hero.poster}
        sources={videos.hero.sources}
      />

      <Manifesto
        label={t('introLabel')}
        text={t('manifesto')}
        images={{ dough: images.kitchen.dough.src, truffle: images.hero.src, fire: images.kitchen.fire.src }}
      />

      <CraftHorizontal
        label={t('kitchenLabel')}
        title={t('kitchenTitle')}
        drag={tCommon('cursorDrag')}
        swipe={t('swipe')}
        panels={KITCHEN_KEYS.map((key) => ({
          key,
          figure: t(`kitchen.${key}.figure`),
          title: t(`kitchen.${key}.title`),
          body: t(`kitchen.${key}.body`),
          alt: t(`kitchen.${key}.alt`),
          image: images.kitchen[key].src,
        }))}
      />

      <RegionsScroll
        label={t('regionsLabel')}
        items={REGION_KEYS.map((key) => ({
          key,
          region: t(`regions.${key}.region`),
          dish: t(`regions.${key}.dish`),
          body: t(`regions.${key}.body`),
          alt: t(`regions.${key}.alt`),
          image: images.regions[key].src,
          ring: t(`regions.${key}.ring`),
        }))}
      />

      {signature ? (
        <SignatureDish
          label={t('signatureLabel')}
          name={signature.name}
          description={signature.description}
          note={t('signatureNote')}
          stamp={t('signatureStamp')}
          cursorView={tCommon('cursorView')}
          price={price(signature.price, signature.currency)}
          image={{ src: signature.image ?? images.signature.src, alt: signature.name }}
          cta={t('menuCta')}
        />
      ) : null}

      <MenuGlance
        label={t('menuLabel')}
        title={t('menuTitle')}
        cta={t('menuCta')}
        courses={menu.map((c) => ({ slug: c.slug, name: c.name }))}
      />

      <GalleryColumns
        label={t('galleryLabel')}
        title={t('roomTitle')}
        body={t('roomBody')}
        items={GALLERY_KEYS.map((key) => ({ key, src: images.gallery[key].src, caption: t(`gallery.${key}`) }))}
        view={tCommon('cursorView')}
        close={t('galleryClose')}
      />

      <section className="section bg-bg-2" aria-labelledby="visit-title">
        <div className="wrap grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Kicker>{t('visitLabel')}</Kicker>
            <SplitReveal as="h2" id="visit-title" by="line" text={t('visitTitle')} className="font-display text-[clamp(3rem,6vw,4.5rem)] leading-[0.95] mt-6 tracking-tight" />
            <ClipReveal className="mt-10 aspect-[16/10] rounded-[var(--radius-card)]">
              <Parallax speed={-0.25} className="absolute inset-0">
                <Img src={images.visit.src} alt="" fill sizes="(min-width: 1024px) 38vw, 100vw" className="object-cover" />
              </Parallax>
            </ClipReveal>
            <div className="mt-10 flex items-end justify-between gap-6 border-t hairline pt-6">
              <p className="label text-muted">{tFooter('localTime', { city: r.address.city })}</p>
              <p className="font-display text-[clamp(2rem,4vw,3rem)] leading-none">
                <LocalClock timeZone={r.timezone} initial={nowAt(r.timezone, locale)} />
              </p>
            </div>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <Location
              restaurant={r}
              locale={locale}
              labels={{ address: tVisit('addressTitle'), contact: tVisit('contactTitle'), directions: tVisit('directions') }}
            />
            <div className="mt-14">
              <OpeningHours hours={hours} locale={locale} timeZone={r.timezone} defaultLocale={r.defaultLocale} city={r.address.city} />
              <ButtonLink href="/visit" variant="text" arrow className="mt-6">
                {t('visitCta')}
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
