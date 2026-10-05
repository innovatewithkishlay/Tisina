/**
 * Generates supabase/seed.sql from content/restaurant.ts.
 *
 *   npm run db:seed:generate
 *
 * The SQL embeds the restaurant as one JSON document and expands it with
 * jsonb functions, so the file stays readable and diff-friendly.
 *
 * It is idempotent: the restaurant is upserted by slug and its localizations,
 * menu and hours are replaced. Booking requests and contact messages are never
 * touched. Apply it with the Supabase SQL editor, `psql "$DATABASE_URL" -f`,
 * or `supabase db reset` (which runs seed.sql automatically).
 *
 *   --chunks   print one small `import_menu_category` call per category instead —
 *              handy for SQL editors with a payload size limit.
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { restaurant } from '../content/restaurant.ts';

const r = restaurant;

const doc = {
  restaurant: {
    slug: r.slug,
    name: r.name,
    cuisine: r.cuisine,
    street_address: r.address.street,
    postal_code: r.address.postalCode,
    city: r.address.city,
    region: r.address.region ?? null,
    country_code: r.address.countryCode,
    phone: r.phone,
    email: r.email,
    website: r.website ?? null,
    timezone: r.timezone,
    default_locale: r.defaultLocale,
    locales: r.locales,
    currency: r.currency,
    price_range: r.priceRange ?? null,
    latitude: r.geo?.lat ?? null,
    longitude: r.geo?.lng ?? null,
    maps_url: r.mapsUrl ?? null,
    instagram_url: r.instagram ?? null,
    booking_enabled: r.booking.enabled,
    booking_min_party: r.booking.minParty,
    booking_max_party: r.booking.maxParty,
    booking_lead_minutes: r.booking.leadMinutes,
    booking_window_days: r.booking.windowDays,
    booking_slot_minutes: r.booking.slotMinutes,
    booking_last_seating_minutes: r.booking.lastSeatingMinutes,
  },
  localizations: Object.entries(r.i18n).map(([locale, l]) => ({
    locale,
    tagline: l.tagline,
    short_description: l.shortDescription,
    description: l.description,
    cuisine_label: l.cuisineLabel,
    meta_title: l.metaTitle,
    meta_description: l.metaDescription,
  })),
  hours: r.hours.map((h) => ({ day_of_week: h.day, service: h.service, opens: h.opens, closes: h.closes })),
  special_hours: r.specialHours.map((s) => ({
    date: s.date,
    closed: s.closed,
    service: s.service ?? null,
    opens: s.opens ?? null,
    closes: s.closes ?? null,
    label: s.label,
  })),
  menu: r.menu.map((c, ci) => ({
    slug: c.slug,
    sort_order: ci * 10,
    i18n: c.i18n,
    items: c.items.map((i, ii) => ({
      slug: i.slug,
      price: i.price,
      currency: i.currency ?? null,
      image: i.image ?? null,
      featured: i.featured ?? false,
      seasonal: i.seasonal ?? false,
      available: i.available ?? true,
      sort_order: ii * 10,
      allergens: i.allergens ?? [],
      dietary_tags: i.dietary ?? [],
      i18n: i.i18n,
    })),
  })),
};

const MENU_SQL = `
  for cat in select * from jsonb_array_elements(doc->'menu') loop
    insert into public.menu_categories (restaurant_id, slug, sort_order)
    values (rid, cat->>'slug', (cat->>'sort_order')::int)
    on conflict (restaurant_id, slug) do update set sort_order = excluded.sort_order, active = true
    returning id into cid;

    delete from public.menu_category_localizations where category_id = cid;
    insert into public.menu_category_localizations (category_id, locale, name, description)
    select cid, key, value->>'name', value->>'description' from jsonb_each(cat->'i18n');

    delete from public.menu_items where category_id = cid;
    for item in select * from jsonb_array_elements(cat->'items') loop
      insert into public.menu_items (
        restaurant_id, category_id, slug, price, currency, image, featured, seasonal,
        available, sort_order, allergens, dietary_tags
      ) values (
        rid, cid, item->>'slug', (item->>'price')::numeric, item->>'currency', item->>'image',
        (item->>'featured')::boolean, (item->>'seasonal')::boolean, (item->>'available')::boolean,
        (item->>'sort_order')::int,
        array(select jsonb_array_elements_text(item->'allergens')),
        array(select jsonb_array_elements_text(item->'dietary_tags'))
      ) returning id into iid;

      insert into public.menu_item_localizations (item_id, locale, name, description)
      select iid, key, value->>'name', value->>'description' from jsonb_each(item->'i18n');
    end loop;
  end loop;`;

const RESTAURANT_SQL = `
  insert into public.restaurants
  select * from jsonb_populate_record(null::public.restaurants,
    doc->'restaurant' || jsonb_build_object('id', gen_random_uuid(), 'created_at', now(), 'updated_at', now()))
  on conflict (slug) do update set
    name = excluded.name, cuisine = excluded.cuisine, street_address = excluded.street_address,
    postal_code = excluded.postal_code, city = excluded.city, region = excluded.region,
    country_code = excluded.country_code, phone = excluded.phone, email = excluded.email,
    website = excluded.website, timezone = excluded.timezone, default_locale = excluded.default_locale,
    locales = excluded.locales, currency = excluded.currency, price_range = excluded.price_range,
    latitude = excluded.latitude, longitude = excluded.longitude, maps_url = excluded.maps_url,
    instagram_url = excluded.instagram_url, booking_enabled = excluded.booking_enabled,
    booking_min_party = excluded.booking_min_party, booking_max_party = excluded.booking_max_party,
    booking_lead_minutes = excluded.booking_lead_minutes, booking_window_days = excluded.booking_window_days,
    booking_slot_minutes = excluded.booking_slot_minutes,
    booking_last_seating_minutes = excluded.booking_last_seating_minutes
  returning id into rid;

  delete from public.restaurant_localizations where restaurant_id = rid;
  insert into public.restaurant_localizations
  select * from jsonb_populate_recordset(null::public.restaurant_localizations,
    (select jsonb_agg(l || jsonb_build_object('restaurant_id', rid)) from jsonb_array_elements(doc->'localizations') l));

  delete from public.opening_hours where restaurant_id = rid;
  insert into public.opening_hours (restaurant_id, day_of_week, service, opens, closes)
  select rid, (h->>'day_of_week')::smallint, h->>'service', (h->>'opens')::time, (h->>'closes')::time
  from jsonb_array_elements(doc->'hours') h;

  delete from public.special_hours where restaurant_id = rid;
  insert into public.special_hours (restaurant_id, date, closed, service, opens, closes, label)
  select rid, (s->>'date')::date, (s->>'closed')::boolean, s->>'service', (s->>'opens')::time, (s->>'closes')::time, s->'label'
  from jsonb_array_elements(doc->'special_hours') s;

  -- Categories that no longer exist in content are removed.
  delete from public.menu_categories
  where restaurant_id = rid
    and slug not in (select c->>'slug' from jsonb_array_elements(doc->'menu') c);`;

function build(payload: object, body: string): string {
  const json = JSON.stringify(payload, null, 1).replace(/\$json\$/g, '');
  return `-- Generated by scripts/generate-seed.ts from content/restaurant.ts — do not edit by hand.
-- Restaurant: ${r.name} (${r.slug})
do $seed$
declare
  doc  jsonb := $json$${json}$json$::jsonb;
  rid  uuid;
  cid  uuid;
  iid  uuid;
  cat  jsonb;
  item jsonb;
begin${body}
end
$seed$;
`;
}

const args = process.argv.slice(2);
if (args[0] === '--chunks') {
  // One small statement per menu category (requires the import_menu_category
  // migration). Run the full seed once first, or the restaurant must exist.
  for (const cat of doc.menu) {
    process.stdout.write(
      `select public.import_menu_category('${r.slug}', $j$${JSON.stringify(cat)}$j$);\n`,
    );
  }
} else {
  const target = fileURLToPath(new URL('../supabase/seed.sql', import.meta.url));
  writeFileSync(target, build(doc, RESTAURANT_SQL + '\n' + MENU_SQL));
  process.stdout.write(`Wrote ${target}\n`);
}
