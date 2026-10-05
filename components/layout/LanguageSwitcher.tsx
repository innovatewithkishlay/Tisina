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
    <div className={cn("group relative z-[100]", className)}>
      <button type="button" className="label inline-flex min-h-11 items-center justify-center gap-2 px-4 transition-opacity hover:opacity-70">
        <span>{knownLocales[current].short}</span>
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-50 transition-transform duration-300 group-hover:-scale-y-100">
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <nav aria-label={t('language')} className="absolute right-0 top-[calc(100%-0.5rem)] mt-2 flex min-w-[100px] origin-top-right scale-95 flex-col rounded-2xl border hairline border-white/10 bg-night/95 p-2 opacity-0 shadow-2xl backdrop-blur-2xl transition-all duration-300 group-hover:scale-100 group-hover:opacity-100 group-hover:pointer-events-auto pointer-events-none">
        <ul className="flex flex-col">
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
                    'label flex min-h-10 w-full items-center rounded-xl px-4 transition-colors duration-[var(--dur-1)]',
                    active ? 'bg-white/10 text-white' : 'text-white/55 hover:bg-white/5 hover:text-white',
                  )}
                >
                  <span aria-hidden="true" className="w-full text-center">
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
    </div>
  );
}
