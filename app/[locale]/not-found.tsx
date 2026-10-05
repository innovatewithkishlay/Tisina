import { getTranslations } from 'next-intl/server';
import { ButtonLink } from '@/components/ui/Button';

export default async function NotFound() {
  const t = await getTranslations('NotFound');
  return (
    <section className="wrap flex min-h-[80svh] flex-col justify-center pt-[var(--header-h)]">
      <p className="index text-h3 text-muted">(404)</p>
      <h1 className="font-display text-h1 mt-6 max-w-[16ch]">{t('title')}</h1>
      <p className="mt-6 text-lede text-fg-2">{t('body')}</p>
      <ButtonLink href="/" variant="outline" arrow className="mt-10 w-fit">
        {t('cta')}
      </ButtonLink>
    </section>
  );
}
