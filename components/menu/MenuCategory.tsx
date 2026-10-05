import { MenuCategory as MenuCategoryType } from '@/lib/restaurant/mock-menu';
import { FeaturedMenuItem } from './FeaturedMenuItem';
import { useLocale } from 'next-intl';

export function MenuCategory({ category }: { category: MenuCategoryType }) {
  const locale = useLocale();
  const name = category.name[locale] || category.name.en;

  if (!category.items || category.items.length === 0) return null;

  return (
    <section className="mb-24 relative">
      <div className="container max-w-screen-2xl mx-auto px-4 md:px-12 mb-12 flex items-center gap-6">
        <h3 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter shrink-0">
          {name}
        </h3>
        <div className="h-[1px] w-full bg-border" />
      </div>
      
      {/* Horizontal Scroll Snap Container */}
      <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-12 w-full">
        {category.items.map((item, index) => (
          <FeaturedMenuItem key={item.id} item={item} index={index} />
        ))}
      </div>
    </section>
  );
}
