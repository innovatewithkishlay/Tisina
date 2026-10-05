import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { restaurantConfig } from '@/config/restaurant';

export function Navbar() {
  const t = useTranslations('Navigation');
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center px-4 md:px-8 mx-auto">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="font-bold sm:inline-block">
            {restaurantConfig.name}
          </span>
        </Link>
        <nav className="flex flex-1 items-center space-x-6 text-sm font-medium">
          <Link href="/menu" className="transition-colors hover:text-foreground/80 text-foreground/60">{t('menu')}</Link>
          <Link href="/about" className="transition-colors hover:text-foreground/80 text-foreground/60">{t('about')}</Link>
          <Link href="/location" className="transition-colors hover:text-foreground/80 text-foreground/60">{t('location')}</Link>
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <Link href="/book" className="px-4 py-2 bg-foreground text-background rounded-md text-sm font-medium">
            {t('book')}
          </Link>
        </div>
      </div>
    </header>
  );
}
