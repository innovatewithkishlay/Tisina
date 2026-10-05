'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations('Error');
  const tNav = useTranslations('Navigation');

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="wrap flex min-h-[80svh] flex-col justify-center pt-[var(--header-h)]" role="alert">
      <p className="label label-rule text-muted">{error.digest ?? '500'}</p>
      <h1 className="font-display text-h1 mt-6 max-w-[18ch]">{t('title')}</h1>
      <p className="mt-6 max-w-[48ch] text-lede text-fg-2">{t('body')}</p>
      <div className="mt-10 flex flex-wrap items-center gap-8">
        <button
          type="button"
          onClick={reset}
          className="label inline-flex min-h-12 items-center rounded-[var(--radius-pill)] bg-fg px-7 text-bg"
        >
          {t('retry')}
        </button>
        <Link href="/" className="label link-draw inline-flex min-h-12 items-center">
          {tNav('home')}
        </Link>
      </div>
    </section>
  );
}
