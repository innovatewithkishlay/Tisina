import type { Metadata, Viewport } from 'next';
import { fontVariables } from '@/lib/fonts';
import { siteConfig } from '@/config/site';
import '../globals.css';


export const metadata: Metadata = {
  title: { default: `Admin — ${siteConfig.brandName}`, template: `%s — ${siteConfig.brandName} admin` },
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { themeColor: '#0f0d0b' };
export const dynamic = 'force-dynamic';

/** Staff area. English only, never indexed, outside the localized site. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <body className="night min-h-svh antialiased">{children}</body>
    </html>
  );
}
