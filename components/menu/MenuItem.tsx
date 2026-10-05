import { MenuItem as MenuItemType } from '@/lib/restaurant/mock-menu';
import { useLocale } from 'next-intl';
import Image from 'next/image';

export function MenuItem({ item }: { item: MenuItemType }) {
  const locale = useLocale();
  const name = item.name[locale] || item.name.en;
  const description = item.description[locale] || item.description.en;

  // Format currency
  const priceFormatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: item.currency,
  }).format(item.price);

  return (
    <div className="flex flex-col gap-6 py-12 md:py-20 border-b border-border/40 last:border-0 group">
      {item.image_url && (
        <div className="w-full aspect-[4/3] md:aspect-[21/9] relative overflow-hidden rounded-xl bg-muted">
          <Image
            src={item.image_url}
            alt={name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 1200px) 100vw, 1200px"
          />
        </div>
      )}
      
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mt-4">
        <div className="flex-1">
          <div className="flex items-start gap-4 mb-3">
            <h4 className="text-2xl md:text-4xl font-bold tracking-tight text-foreground group-hover:text-foreground/80 transition-colors">
              {name}
              {item.is_featured && (
                <span className="ml-4 inline-block px-3 py-1 text-sm font-semibold bg-accent text-accent-foreground rounded-full align-middle">
                  Featured
                </span>
              )}
            </h4>
          </div>
          
          <p className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-3xl">
            {description}
          </p>

          {(item.dietary_info.length > 0 || item.allergens.length > 0) && (
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              {item.dietary_info.map((diet) => (
                <span key={diet} className="text-emerald-700 dark:text-emerald-400 font-semibold px-3 py-1.5 bg-emerald-500/10 rounded-md">
                  {diet}
                </span>
              ))}
              {item.allergens.length > 0 && (
                <span className="text-muted-foreground/80 px-3 py-1.5 border border-border/80 rounded-md font-medium">
                  Contains: {item.allergens.join(', ')}
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className="mt-2 md:mt-0">
          <span className="text-3xl md:text-4xl font-light whitespace-nowrap">{priceFormatted}</span>
        </div>
      </div>
    </div>
  );
}
