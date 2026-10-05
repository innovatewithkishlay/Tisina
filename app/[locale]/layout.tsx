import type { Metadata, Viewport } from 'next';
import { Hanken_Grotesk, Instrument_Serif } from 'next/font/google';
import { notFound } from 'next/navigation';
import { ViewTransition } from 'react';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { knownLocales, type Locale } from '@/config/locales';
import { siteConfig } from '@/config/site';
import { getHours, getRestaurant } from '@/lib/data/restaurant';
import { telHref } from '@/lib/format';
import { openStatus } from '@/lib/hours';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { OpenStatus } from '@/components/layout/OpenStatus';
import { RevealObserver } from '@/components/motion/RevealObserver';
import '../globals.css';

/*
 * Typography: a high-contrast display serif for headlines and the wordmark,
 * a quiet grotesk for text and UI. Both ship the latin-ext subset, which covers
 * Croatian (č ć đ š ž), Hungarian (ő ű) and German (ä ö ü ß).
 */
const display = Instrument_Serif({
  subsets: ['latin', 'latin-ext'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-display-face',
  display: 'swap',
});
// `subsets` only controls preloading; latin-ext still loads on demand via unicode-range.
const sans = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans-face',
  display: 'swap',
});

export const dynamicParams = false;
export const revalidate = 300;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: '#efe9df',
  colorScheme: 'light',
};

export async function generateMetadata({ params }: LayoutProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params;
  const r = await getRestaurant(locale as Locale);
  return {
    metadataBase: new URL(siteConfig.siteUrl),
    title: { default: r.metaTitle, template: `%s — ${r.name}` },
    description: r.metaDescription,
    applicationName: r.name,
    formatDetection: { telephone: false, address: false, email: false },
    robots: { index: true, follow: true },
  };
}

/**
 * Client components only receive the namespaces they use. Form pages add their
 * own (Booking, Contact, Hours) with a nested provider — see components/i18n.
 */
const CLIENT_NAMESPACES = ['Navigation', 'Status', 'Error', 'Common'] as const;

export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const [messages, t, r, hours] = await Promise.all([
    getMessages(),
    getTranslations({ locale, namespace: 'Meta' }),
    getRestaurant(locale),
    getHours(),
  ]);
  const clientMessages = Object.fromEntries(CLIENT_NAMESPACES.map((ns) => [ns, messages[ns]]));
  const status = <OpenStatus hours={hours} timeZone={r.timezone} initial={openStatus(hours, r.timezone)} />;

  return (
    <html lang={knownLocales[locale].hreflang} className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        {/* Enables reveal animations only when JS runs; content stays visible otherwise. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <NextIntlClientProvider locale={locale} messages={clientMessages}>
          <a
            href="#main"
            className="label fixed left-4 top-4 z-[70] -translate-y-24 rounded-[var(--radius-pill)] bg-fg px-5 py-3 text-bg transition-transform focus:translate-y-0"
          >
            {t('skipToContent')}
          </a>
          <Navbar
            address={`${r.address.street}, ${r.address.postalCode} ${r.address.city}`}
            phone={r.phone}
            phoneHref={telHref(r.phone)}
            status={status}
          />
          <ViewTransition>
            <main id="main" tabIndex={-1} className="outline-none">
              {children}
            </main>
          </ViewTransition>
          <Footer />
          <RevealObserver />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
