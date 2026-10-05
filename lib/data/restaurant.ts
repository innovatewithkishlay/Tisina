import 'server-only';
import { cache } from 'react';
import type { Locale } from '@/config/locales';
import { siteConfig } from '@/config/site';
import { restaurant as fallbackSeed } from '@/content/restaurant';
import { getPublicClient } from '@/lib/supabase/server';
import type {
  Allergen,
  DataSource,
  DietaryTag,
  Hours,
  IsoWeekday,
  Localized,
  MenuCategory,
  Restaurant,
  RestaurantSeed,
  ServiceKind,
} from '@/types/restaurant';

/**
 * Data access for the restaurant.
 *
 * Everything is loaded with ONE Supabase request (nested select), mapped into
 * the same `RestaurantSeed` shape as `content/restaurant.ts`, then resolved for
 * a locale. If Supabase is not configured or unreachable, the local content is
 * used so the site never renders empty.
 */

const SELECT = `
  slug, name, cuisine, street_address, postal_code, city, region, country_code,
  phone, email, website, timezone, default_locale, locales, currency, price_range,
  latitude, longitude, maps_url, instagram_url,
  booking_enabled, booking_min_party, booking_max_party, booking_lead_minutes,
  booking_window_days, booking_slot_minutes, booking_last_seating_minutes,
  restaurant_localizations ( locale, tagline, short_description, description, cuisine_label, meta_title, meta_description ),
  opening_hours ( day_of_week, service, opens, closes ),
  special_hours ( date, closed, service, opens, closes, label ),
  menu_categories (
    slug, sort_order,
    menu_category_localizations ( locale, name, description ),
    menu_items ( slug, price, currency, image, featured, seasonal, available, sort_order, allergens, dietary_tags,
      menu_item_localizations ( locale, name, description ) )
  )
`;

/* eslint-disable @typescript-eslint/no-explicit-any -- PostgREST rows are untyped JSON */
const hhmm = (t: string | null | undefined) => (t ? t.slice(0, 5) : undefined);

function toLocalized<T>(rows: any[], pick: (row: any) => T): Localized<T> {
  const out: Localized<T> = {};
  for (const row of rows ?? []) out[row.locale as Locale] = pick(row);
  return out;
}

function mapRow(row: any): RestaurantSeed {
  return {
    slug: row.slug,
    name: row.name,
    cuisine: row.cuisine ?? [],
    address: {
      street: row.street_address,
      postalCode: row.postal_code,
      city: row.city,
      region: row.region ?? undefined,
      countryCode: row.country_code,
    },
    geo: row.latitude != null && row.longitude != null ? { lat: Number(row.latitude), lng: Number(row.longitude) } : undefined,
    mapsUrl: row.maps_url ?? undefined,
    phone: row.phone,
    email: row.email,
    website: row.website ?? undefined,
    instagram: row.instagram_url ?? undefined,
    timezone: row.timezone,
    currency: row.currency,
    priceRange: row.price_range ?? undefined,
    defaultLocale: row.default_locale,
    locales: row.locales,
    booking: {
      enabled: row.booking_enabled,
      minParty: row.booking_min_party,
      maxParty: row.booking_max_party,
      leadMinutes: row.booking_lead_minutes,
      windowDays: row.booking_window_days,
      slotMinutes: row.booking_slot_minutes,
      lastSeatingMinutes: row.booking_last_seating_minutes,
    },
    i18n: toLocalized(row.restaurant_localizations, (l) => ({
      tagline: l.tagline,
      shortDescription: l.short_description,
      description: l.description,
      cuisineLabel: l.cuisine_label,
      metaTitle: l.meta_title,
      metaDescription: l.meta_description,
    })),
    hours: (row.opening_hours ?? [])
      .map((h: any) => ({
        day: h.day_of_week as IsoWeekday,
        service: h.service as ServiceKind,
        opens: hhmm(h.opens)!,
        closes: hhmm(h.closes)!,
      }))
      .sort((a: any, b: any) => a.day - b.day || a.opens.localeCompare(b.opens)),
    specialHours: (row.special_hours ?? [])
      .map((s: any) => ({
        date: s.date,
        closed: s.closed,
        service: s.service ?? undefined,
        opens: hhmm(s.opens),
        closes: hhmm(s.closes),
        label: s.label ?? {},
      }))
      .sort((a: any, b: any) => a.date.localeCompare(b.date)),
    menu: [...(row.menu_categories ?? [])]
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map((c: any) => ({
        slug: c.slug,
        i18n: toLocalized(c.menu_category_localizations, (l) => ({ name: l.name, description: l.description ?? undefined })),
        items: [...(c.menu_items ?? [])]
          .sort((a: any, b: any) => a.sort_order - b.sort_order)
          .map((i: any) => ({
            slug: i.slug,
            price: i.price == null ? null : Number(i.price),
            currency: i.currency ?? undefined,
            image: i.image ?? undefined,
            featured: i.featured,
            seasonal: i.seasonal,
            available: i.available,
            allergens: i.allergens as Allergen[],
            dietary: i.dietary_tags as DietaryTag[],
            i18n: toLocalized(i.menu_item_localizations, (l) => ({ name: l.name, description: l.description ?? undefined })),
          })),
      })),
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Raw multi-locale data, deduplicated per request. */
export const loadRestaurantSeed = cache(async (): Promise<{ seed: RestaurantSeed; source: DataSource }> => {
  const supabase = getPublicClient();
  if (!supabase) return { seed: fallbackSeed, source: 'fallback' };

  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select(SELECT)
      .eq('slug', siteConfig.restaurantSlug)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error(`Restaurant "${siteConfig.restaurantSlug}" not found in Supabase`);
    return { seed: mapRow(data), source: 'supabase' };
  } catch (err) {
    console.warn('[data] Supabase unavailable, rendering bundled content:', (err as Error).message);
    return { seed: fallbackSeed, source: 'fallback' };
  }
});

/** Pick a translation with a sensible fallback chain. */
export function pick<T>(value: Localized<T>, locale: Locale, defaultLocale: Locale): T | undefined {
  return value[locale] ?? value[defaultLocale] ?? value.en ?? Object.values(value)[0];
}

export async function getRestaurant(locale: Locale): Promise<Restaurant> {
  const { seed } = await loadRestaurantSeed();
  const l = pick(seed.i18n, locale, seed.defaultLocale)!;
  return {
    slug: seed.slug,
    name: seed.name,
    cuisine: seed.cuisine,
    address: seed.address,
    geo: seed.geo,
    mapsUrl: seed.mapsUrl,
    phone: seed.phone,
    email: seed.email,
    website: seed.website,
    instagram: seed.instagram,
    timezone: seed.timezone,
    currency: seed.currency,
    priceRange: seed.priceRange,
    defaultLocale: seed.defaultLocale,
    locales: seed.locales,
    booking: seed.booking,
    ...l,
  };
}

export async function getMenu(locale: Locale): Promise<MenuCategory[]> {
  const { seed } = await loadRestaurantSeed();
  return seed.menu
    .map((c) => {
      const cl = pick(c.i18n, locale, seed.defaultLocale);
      return {
        slug: c.slug,
        name: cl?.name ?? c.slug,
        description: cl?.description,
        items: c.items.map((i) => {
          const il = pick(i.i18n, locale, seed.defaultLocale);
          return {
            slug: i.slug,
            name: il?.name ?? i.slug,
            description: il?.description,
            price: i.price,
            currency: i.currency ?? seed.currency,
            image: i.image,
            featured: i.featured ?? false,
            seasonal: i.seasonal ?? false,
            available: i.available ?? true,
            allergens: i.allergens ?? [],
            dietary: i.dietary ?? [],
          };
        }),
      };
    })
    .filter((c) => c.items.length > 0);
}

export async function getHours(): Promise<Hours> {
  const { seed } = await loadRestaurantSeed();
  return { weekly: seed.hours, special: seed.specialHours };
}

export async function getFeaturedDishes(locale: Locale) {
  const menu = await getMenu(locale);
  return menu.flatMap((c) => c.items.map((i) => ({ ...i, category: c.name }))).filter((i) => i.featured);
}
