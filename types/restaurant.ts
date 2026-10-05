import type { Locale } from '@/config/locales';

/** A value translated into some of the known locales. */
export type Localized<T = string> = Partial<Record<Locale, T>>;

export type ServiceKind = 'breakfast' | 'lunch' | 'dinner' | 'all_day' | 'bar';

/** ISO day of week: 1 = Monday … 7 = Sunday. */
export type IsoWeekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** EU FIC 1169/2011 — the 14 allergens that must be declared. */
export type Allergen =
  | 'gluten' | 'crustaceans' | 'eggs' | 'fish' | 'peanuts' | 'soy' | 'milk'
  | 'nuts' | 'celery' | 'mustard' | 'sesame' | 'sulphites' | 'lupin' | 'molluscs';

export type DietaryTag = 'vegetarian' | 'vegan' | 'gluten_free' | 'dairy_free' | 'pescatarian';

export interface ServicePeriod {
  service: ServiceKind;
  /** "HH:MM", restaurant-local time. */
  opens: string;
  closes: string;
}

export interface WeeklyHours extends ServicePeriod {
  day: IsoWeekday;
}

export interface SpecialHours {
  /** "YYYY-MM-DD", restaurant-local date. */
  date: string;
  closed: boolean;
  service?: ServiceKind;
  opens?: string;
  closes?: string;
  label: Localized;
}

export interface BookingSettings {
  enabled: boolean;
  minParty: number;
  maxParty: number;
  leadMinutes: number;
  windowDays: number;
  slotMinutes: number;
  lastSeatingMinutes: number;
}

// ---------------------------------------------------------------------------
// Seed shape — every locale at once. Mirrors the Supabase tables and is used
// both to generate `supabase/seed.sql` and as the offline fallback.
// ---------------------------------------------------------------------------

export interface RestaurantLocalization {
  tagline: string;
  shortDescription: string;
  description: string;
  cuisineLabel: string;
  metaTitle: string;
  metaDescription: string;
}

export interface MenuItemSeed {
  slug: string;
  /** null = market price. */
  price: number | null;
  currency?: string;
  image?: string;
  featured?: boolean;
  seasonal?: boolean;
  available?: boolean;
  allergens?: Allergen[];
  dietary?: DietaryTag[];
  i18n: Localized<{ name: string; description?: string }>;
}

export interface MenuCategorySeed {
  slug: string;
  i18n: Localized<{ name: string; description?: string }>;
  items: MenuItemSeed[];
}

export interface RestaurantSeed {
  slug: string;
  name: string;
  cuisine: string[];
  address: {
    street: string;
    postalCode: string;
    city: string;
    region?: string;
    countryCode: string;
  };
  geo?: { lat: number; lng: number };
  mapsUrl?: string;
  phone: string;
  email: string;
  website?: string;
  instagram?: string;
  timezone: string;
  currency: string;
  priceRange?: string;
  defaultLocale: Locale;
  locales: Locale[];
  booking: BookingSettings;
  i18n: Localized<RestaurantLocalization>;
  hours: WeeklyHours[];
  specialHours: SpecialHours[];
  menu: MenuCategorySeed[];
}

// ---------------------------------------------------------------------------
// View shape — resolved for one locale, what components receive.
// ---------------------------------------------------------------------------

export interface Restaurant extends RestaurantLocalization {
  slug: string;
  name: string;
  cuisine: string[];
  address: RestaurantSeed['address'];
  geo?: { lat: number; lng: number };
  mapsUrl?: string;
  phone: string;
  email: string;
  website?: string;
  instagram?: string;
  timezone: string;
  currency: string;
  priceRange?: string;
  defaultLocale: Locale;
  locales: Locale[];
  booking: BookingSettings;
}

export interface MenuItem {
  slug: string;
  name: string;
  description?: string;
  price: number | null;
  currency: string;
  image?: string;
  featured: boolean;
  seasonal: boolean;
  available: boolean;
  allergens: Allergen[];
  dietary: DietaryTag[];
}

export interface MenuCategory {
  slug: string;
  name: string;
  description?: string;
  items: MenuItem[];
}

export interface Hours {
  weekly: WeeklyHours[];
  special: SpecialHours[];
}

/** Where the data came from — surfaced in dev tooling, never to guests. */
export type DataSource = 'supabase' | 'fallback';
