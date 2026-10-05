import type { Locale } from '@/config/locales';
import type { MenuCategory as MenuCategoryType } from '@/types/restaurant';
import { Reveal } from '@/components/ui/Reveal';
import { MenuItem, type MenuItemLabels } from './MenuItem';

export function MenuCategory({
  category,
  index,
  locale,
  labels,
}: {
  category: MenuCategoryType;
  index: number;
  locale: Locale;
  labels: MenuItemLabels;
}) {
  return (
    <section id={`c-${category.slug}`} aria-labelledby={`h-${category.slug}`} className="scroll-mt-32 grid gap-6 py-14 lg:grid-cols-12 lg:py-20">
      <Reveal className="lg:col-span-4">
        <div className="lg:sticky lg:top-40">
          <p className="label tabular-nums text-muted">{String(index + 1).padStart(2, '0')}</p>
          <h2 id={`h-${category.slug}`} className="font-display text-h2 mt-3">
            {category.name}
          </h2>
          {category.description ? <p className="mt-4 max-w-[30ch] text-fg-2">{category.description}</p> : null}
        </div>
      </Reveal>
      <div className="border-t hairline lg:col-span-7 lg:col-start-6">
        {category.items.map((item) => (
          <MenuItem key={item.slug} item={item} locale={locale} labels={labels} />
        ))}
      </div>
    </section>
  );
}
