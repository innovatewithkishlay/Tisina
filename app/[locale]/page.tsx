import { useTranslations } from 'next-intl';
import { restaurantConfig } from '@/config/restaurant';
import { Link } from '@/i18n/routing';

export default function Home() {
  const t = useTranslations('Index');
  const tNav = useTranslations('Navigation');
  
  return (
    <main className="min-h-screen flex flex-col">
      {/* Example Hero Section */}
      <section className="flex-1 flex flex-col justify-center items-center text-center p-8">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">
          {restaurantConfig.name}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          {t('description')}
        </p>
        
        <div className="flex gap-4">
          <Link 
            href="/menu" 
            className="px-6 py-3 bg-foreground text-background rounded-md font-medium hover:opacity-90 transition-opacity"
          >
            {tNav('menu')}
          </Link>
          <Link 
            href="/book" 
            className="px-6 py-3 border border-border rounded-md font-medium hover:bg-muted transition-colors"
          >
            {tNav('book')}
          </Link>
        </div>
      </section>
    </main>
  );
}
