import type { Metadata, Viewport } from 'next';
import { Hanken_Grotesk, Instrument_Serif } from 'next/font/google';
import { siteConfig } from '@/config/site';
import '../globals.css';

const display = Instrument_Serif({ subsets: ['latin', 'latin-ext'], weight: '400', style: ['normal', 'italic'], variable: '--font-display-face', display: 'swap' });
const sans = Hanken_Grotesk({ subsets: ['latin', 'latin-ext'], variable: '--font-sans-face', display: 'swap' });

export const metadata: Metadata = {
  title: { default: `Admin — ${siteConfig.brandName}`, template: `%s — ${siteConfig.brandName} admin` },
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { themeColor: '#0f0d0b' };
export const dynamic = 'force-dynamic';

/** Staff area. English only, never indexed, outside the localized site. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="night min-h-svh antialiased">{children}</body>
    </html>
  );
}
