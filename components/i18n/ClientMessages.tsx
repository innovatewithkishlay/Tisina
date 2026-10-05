import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

/**
 * Ships extra message namespaces to the client for one subtree only, so the
 * booking/contact strings are not included in every page's HTML.
 */
export async function ClientMessages({ namespaces, children }: { namespaces: string[]; children: ReactNode }) {
  const [locale, messages] = await Promise.all([getLocale(), getMessages()]);
  const picked = Object.fromEntries(
    ['Navigation', 'Status', 'Error', 'Common', ...namespaces].map((ns) => [ns, messages[ns]]),
  );
  return (
    <NextIntlClientProvider locale={locale} messages={picked}>
      {children}
    </NextIntlClientProvider>
  );
}
