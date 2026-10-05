import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/config/locales';
import { getRestaurant } from '@/lib/data/restaurant';
import { formatDate } from '@/lib/format';
import { pageMetadata } from '@/lib/seo/metadata';
import { PageHeader } from '@/components/ui/PageHeader';
import { photoCredits } from '@/content/photo-credits';

/** Update when the notice changes. */
const LAST_UPDATED = '2026-10-05';

export async function generateMetadata({ params }: PageProps<'/[locale]/privacy'>) {
  const { locale } = (await params) as { locale: Locale };
  const [t, r] = await Promise.all([getTranslations({ locale, namespace: 'Meta' }), getRestaurant(locale)]);
  return pageMetadata({
    locale,
    path: '/privacy',
    title: t('privacyTitle'),
    description: t('privacyDescription', { name: r.name }),
    restaurant: r,
  });
}

export default async function PrivacyPage({ params }: PageProps<'/[locale]/privacy'>) {
  const { locale } = (await params) as { locale: Locale };
  setRequestLocale(locale);
  const [t, r] = await Promise.all([getTranslations('Privacy'), getRestaurant(locale)]);
  const sections = t.raw('sections') as { title: string; body: string }[];

  return (
    <>
      <PageHeader eyebrow={t('eyebrow')} title={t('title')} lede={t('updated', { date: formatDate(LAST_UPDATED, locale, { day: 'numeric', month: 'long', year: 'numeric' }) })} />
      <div className="wrap grid pb-[var(--section)] md:grid-cols-12">
        <div className="space-y-12 md:col-span-7 md:col-start-5">
          {sections.map((s) => (
            <section key={s.title} className="border-t hairline pt-6">
              <h2 className="font-display text-h3">{s.title}</h2>
              <p className="mt-4 text-fg-2">{s.body.replace('{email}', r.email)}</p>
            </section>
          ))}
          <section id="credits" className="scroll-mt-32 border-t hairline pt-6">
            <h2 className="font-display text-h3">{t('creditsTitle')}</h2>
            <ul className="mt-4 space-y-1 text-small text-fg-2">
              {photoCredits.map((c) => (
                <li key={c.file}>
                  <span className="text-fg">{c.file}</span> — {c.author} ·{' '}
                  <a href={c.source} className="link-static" rel="noopener noreferrer" target="_blank">
                    {c.license}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
