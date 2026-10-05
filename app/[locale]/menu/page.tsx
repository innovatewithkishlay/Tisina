import { useTranslations } from 'next-intl';
import { mockMenuData } from '@/lib/restaurant/mock-menu';
import { MenuCategory } from '@/components/menu/MenuCategory';

export default function MenuPage() {
  const t = useTranslations('Navigation');
  
  return (
    <main className="bg-background min-h-screen text-foreground pt-12">
      <div className="container max-w-screen-2xl mx-auto px-4 md:px-12 mb-12">
        <h1 className="text-6xl md:text-[10rem] font-black uppercase tracking-tighter leading-none mix-blend-difference z-10 relative">
          {t('menu')}
        </h1>
      </div>

      <div className="w-full">
        {mockMenuData.map((category) => (
           <MenuCategory key={category.id} category={category} />
        ))}
      </div>
    </main>
  );
}
