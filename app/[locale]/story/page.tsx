import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/config/locales';
import { images } from '@/content/images';
import { getRestaurant } from '@/lib/data/restaurant';
import { localizedUrl, pageMetadata } from '@/lib/seo/metadata';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { JsonLd } from '@/components/seo/JsonLd';
import { PageHeader } from '@/components/ui/PageHeader';
import { Reveal, Words } from '@/components/ui/Reveal';
import { ButtonLink } from '@/components/ui/Button';

export async function generateMetadata({ params }: PageProps<'/[locale]/story'>) {
  const { locale } = (await params) as { locale: Locale };
  const [t, r] = await Promise.all([getTranslations({ locale, namespace: 'Meta' }), getRestaurant(locale)]);
  return pageMetadata({
    locale,
    path: '/story',
    title: t('storyTitle'),
    description: t('storyDescription', { name: r.name }),
    restaurant: r,
  });
}

export default async function StoryPage({ params }: PageProps<'/[locale]/story'>) {
  const { locale } = (await params) as { locale: Locale };
  setRequestLocale(locale);
  const [t, r] = await Promise.all([getTranslations('Story'), getRestaurant(locale)]);

  const chapters = [1, 2, 3].map((n) => ({ title: t(`chapter${n}Title`), body: t(`chapter${n}Body`) }));

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: r.name, url: localizedUrl(locale) },
          { name: t('eyebrow'), url: localizedUrl(locale, '/story') },
        ])}
      />
      <PageHeader eyebrow={t('eyebrow')} title={t('title')} lede={t('lede')} />

      <div className="wrap">
        <Reveal kind="mask" className="scale-on-scroll parallax-img relative aspect-[4/3] overflow-hidden sm:aspect-[21/8]">
          <Image src={images.story.band.src} alt={t('imageAlt2')} fill priority sizes="100vw" className="object-cover" />
        </Reveal>
      </div>

      {/* Chapter 1 — text and a portrait image, offset */}
      <section className="section">
        <div className="wrap grid items-start gap-12 md:grid-cols-12">
          <div className="md:col-span-5 md:col-start-2 md:pt-24">
            <p className="label tabular-nums text-muted">01</p>
            <Words as="h2" text={chapters[0].title} className="font-display text-h2 mt-4 block" />
            <Reveal delay={120}>
              <p className="mt-8 text-lede text-fg-2">{chapters[0].body}</p>
            </Reveal>
          </div>
          <Reveal kind="mask" className="parallax-img relative aspect-[4/5] overflow-hidden md:col-span-5 md:col-start-8">
            <Image src={images.story.one.src} alt={t('imageAlt1')} fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
          </Reveal>
        </div>
      </section>

      {/* Quote — quiet, centered, dark */}
      <section className="night section">
        <Reveal className="wrap grid md:grid-cols-12">
          <figure className="md:col-span-10 md:col-start-2">
            <blockquote className="font-display text-statement italic">“{t('quote')}”</blockquote>
            <figcaption className="label kicker mt-10 text-muted">{t('quoteBy')}</figcaption>
          </figure>
        </Reveal>
      </section>

      {/* Chapters 2 & 3 — two columns of reading */}
      <section className="section">
        <div className="wrap grid gap-16 md:grid-cols-12">
          {chapters.slice(1).map((c, i) => (
            <Reveal key={c.title} delay={i * 120} className={i === 0 ? 'md:col-span-5 md:col-start-2' : 'md:col-span-5 md:col-start-8 md:pt-32'}>
              <h2 className="font-display text-h2 mt-4">{c.title}</h2>
              <p className="mt-8 text-lede text-fg-2">{c.body}</p>
            </Reveal>
          ))}
        </div>
        <div className="wrap mt-24 grid gap-10 md:grid-cols-12">
          <Reveal kind="mask" className="parallax-img relative aspect-square overflow-hidden md:col-span-4 md:col-start-2">
            <Image src={images.story.two.src} alt={t('imageAlt2')} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
          </Reveal>
          <Reveal className="flex flex-col justify-end gap-4 md:col-span-5 md:col-start-7">
            <ButtonLink href="/menu" variant="outline" arrow className="w-fit">
              {t('ctaMenu')}
            </ButtonLink>
            <ButtonLink href="/book" className="w-fit">
              {t('ctaBook')}
            </ButtonLink>
          </Reveal>
        </div>
      </section>
    </>
  );
}
