import Link from 'next/link';
import { siteConfig } from '@/config/site';
import './globals.css';

/** Fallback for paths outside any locale (the proxy normally prevents these). */
export default function RootNotFound() {
  return (
    <html lang={siteConfig.defaultLocale}>
      <body>
        <main className="wrap flex min-h-svh flex-col justify-center gap-6">
          <p className="label text-muted">404</p>
          <h1 style={{ fontFamily: 'Georgia, serif' }} className="text-h1">
            {siteConfig.brandName}
          </h1>
          <Link href={`/${siteConfig.defaultLocale}`} className="link-static w-fit">
            {siteConfig.siteUrl.replace(/^https?:\/\//, '')}
          </Link>
        </main>
      </body>
    </html>
  );
}
