'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Link, usePathname } from '@/i18n/routing';
import { knownLocales, type Locale } from '@/config/locales';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';

/**
 * Inline list of the enabled languages. Switching keeps the visitor on the
 * same page (and query string), e.g. /hr/menu → /de/menu.
 */
export function LanguageSwitcher({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const t = useTranslations('Navigation');
  const current = useLocale() as Locale;
  const pathname = usePathname();
  const search = useSearchParams();
  const query = Object.fromEntries(search?.entries() ?? []);

  if (siteConfig.locales.length < 2) return null;

  return (
    <nav aria-label={t('language')} className={className}>
      <ul className="flex items-center gap-1">
        {siteConfig.locales.map((locale) => {
          const active = locale === current;
          return (
            <li key={locale}>
              <Link
                href={{ pathname, query }}
                locale={locale}
                hrefLang={knownLocales[locale].hreflang}
                lang={knownLocales[locale].hreflang}
                aria-current={active ? 'true' : undefined}
                onClick={onNavigate}
                scroll={false}
                className={cn(
                  'label inline-flex min-h-10 min-w-10 items-center justify-center rounded-[var(--radius-pill)] px-2 transition-opacity duration-[var(--dur-1)]',
                  active ? 'opacity-100' : 'opacity-55 hover:opacity-100',
                )}
              >
                <span aria-hidden="true" className={cn(active && 'border-b border-current pb-0.5')}>
                  {knownLocales[locale].short}
                </span>
                <span className="sr-only">
                  {active ? t('currentLanguage', { language: knownLocales[locale].label }) : knownLocales[locale].label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
