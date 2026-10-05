import Image from 'next/image';
import type { Locale } from '@/config/locales';
import { formatPrice } from '@/lib/format';
import type { MenuItem as MenuItemType } from '@/types/restaurant';
import { cn } from '@/lib/utils';

export interface MenuItemLabels {
  signature: string;
  seasonal: string;
  unavailable: string;
  marketPrice: string;
  allergensLabel: string;
  dietaryLabel: string;
  allergens: Record<string, string>;
  dietary: Record<string, string>;
}

export function MenuItem({ item, locale, labels }: { item: MenuItemType; locale: Locale; labels: MenuItemLabels }) {
  const price = item.price === null ? labels.marketPrice : formatPrice(item.price, item.currency, locale);

  return (
    <article
      id={item.slug}
      className={cn('group grid scroll-mt-40 gap-5 border-b hairline py-8 sm:grid-cols-[1fr_auto]', !item.available && 'opacity-55')}
    >
      <div className="flex gap-5">
        {item.image ? (
          <div className="relative size-24 shrink-0 overflow-hidden bg-bg-2 sm:size-28">
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes="112px"
              className="object-cover transition-transform duration-[var(--dur-3)] ease-[var(--ease-out)] group-hover:scale-[1.06]"
            />
          </div>
        ) : null}
        <div className="min-w-0">
          <h3 className="font-display text-[1.75rem] leading-[1.15]">
            {item.name}
            {!item.available ? <span className="label ml-3 align-middle text-accent">{labels.unavailable}</span> : null}
          </h3>
          {item.featured || item.seasonal ? (
            <p className="mt-2 flex flex-wrap gap-2">
              {item.featured ? <Tag>{labels.signature}</Tag> : null}
              {item.seasonal ? <Tag>{labels.seasonal}</Tag> : null}
            </p>
          ) : null}
          {item.description ? <p className="mt-2 max-w-[52ch] text-fg-2">{item.description}</p> : null}
          {item.dietary.length || item.allergens.length ? (
            <dl className="mt-3 space-y-0.5 text-small text-muted">
              {item.dietary.length ? (
                <div className="flex flex-wrap gap-x-2">
                  <dt className="sr-only">{labels.dietaryLabel}</dt>
                  <dd>{item.dietary.map((d) => labels.dietary[d] ?? d).join(' · ')}</dd>
                </div>
              ) : null}
              {item.allergens.length ? (
                <div className="flex flex-wrap gap-x-2">
                  <dt>{labels.allergensLabel}:</dt>
                  <dd>{item.allergens.map((a) => labels.allergens[a] ?? a).join(', ')}</dd>
                </div>
              ) : null}
            </dl>
          ) : null}
        </div>
      </div>
      <p className={cn('font-display whitespace-nowrap text-[1.5rem] tabular-nums sm:text-right', item.price === null && 'text-[1.125rem] italic text-fg-2')}>
        {price}
      </p>
    </article>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="label inline-flex items-center rounded-[var(--radius-pill)] border border-current px-2.5 py-1 text-[0.6875rem] text-accent">
      {children}
    </span>
  );
}
