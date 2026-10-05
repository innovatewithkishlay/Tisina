import { MenuItem as MenuItemType } from '@/lib/restaurant/mock-menu';
import { useLocale } from 'next-intl';
import Image from 'next/image';

export function FeaturedMenuItem({ item, index }: { item: MenuItemType, index: number }) {
  const locale = useLocale();
  const name = item.name[locale] || item.name.en;
  const description = item.description[locale] || item.description.en;

  // Format currency
  const priceFormatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: item.currency,
  }).format(item.price);

  return (
    <div className="w-screen h-[85vh] flex-shrink-0 flex items-center justify-center snap-center px-4 md:px-12 relative overflow-hidden group">
      <div className="w-full max-w-screen-2xl grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-16 items-center">
        
        {/* Left Column: Huge Title */}
        <div className="flex flex-col space-y-4 text-left z-10 mix-blend-difference lg:mix-blend-normal">
          <span className="text-accent uppercase tracking-widest text-sm font-semibold">
            {index < 9 ? `0${index + 1}` : index + 1} // Signature
          </span>
          <h2 className="text-5xl md:text-7xl xl:text-8xl font-black uppercase leading-[0.85] tracking-tighter">
            {name}
          </h2>
        </div>

        {/* Center Column: Big Image */}
        <div className="relative w-full aspect-square md:aspect-[4/5] rounded-none overflow-hidden mx-auto max-w-[600px] z-0">
          {item.image_url ? (
             <Image
             src={item.image_url}
             alt={name}
             fill
             className="object-cover transition-transform duration-1000 group-hover:scale-110"
             sizes="(max-width: 1024px) 100vw, 33vw"
             priority={index === 0}
           />
          ) : (
            <div className="w-full h-full bg-muted/30" />
          )}
          {/* Cursive badge overlay like Don Bisho */}
          {item.is_featured && (
            <div className="absolute -bottom-6 -right-6 md:-bottom-12 md:-right-12 w-32 h-32 md:w-48 md:h-48 rounded-full border border-accent/20 flex items-center justify-center bg-background/80 backdrop-blur-sm transform rotate-12 z-20">
              <span className="text-accent font-serif italic text-xl md:text-2xl text-center leading-tight">
                Current <br/> Selection
              </span>
            </div>
          )}
        </div>

        {/* Right Column: Details */}
        <div className="flex flex-col space-y-8 z-10 bg-background/80 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none p-6 lg:p-0 rounded-xl">
          <p className="text-lg md:text-2xl text-muted-foreground font-light leading-relaxed">
            {description}
          </p>
          
          <div className="flex items-end justify-between">
            <div className="space-y-4">
               <span className="text-4xl md:text-5xl font-medium">{priceFormatted}</span>
               {(item.dietary_info.length > 0) && (
                 <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wider">
                   {item.dietary_info.map((diet) => (
                     <span key={diet} className="text-accent/80 border border-accent/30 px-3 py-1 rounded-full">
                       {diet}
                     </span>
                   ))}
                 </div>
               )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
