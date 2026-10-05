-- Service-only helper: upserts one menu category (with items and translations)
-- from a JSON document. Used by `scripts/generate-seed.ts --chunks` when the
-- full seed is too large for an SQL editor. Not callable by anon/authenticated.
create or replace function public.import_menu_category(p_restaurant_slug text, cat jsonb)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare rid uuid; cid uuid; iid uuid; item jsonb;
begin
  select id into strict rid from public.restaurants where slug = p_restaurant_slug;
  insert into public.menu_categories (restaurant_id, slug, sort_order)
  values (rid, cat->>'slug', (cat->>'sort_order')::int)
  on conflict (restaurant_id, slug) do update set sort_order = excluded.sort_order, active = true
  returning id into cid;
  insert into public.menu_category_localizations (category_id, locale, name, description)
  select cid, key, value->>'name', value->>'description' from jsonb_each(cat->'i18n')
  on conflict (category_id, locale) do update set name = excluded.name, description = excluded.description;
  for item in select * from jsonb_array_elements(cat->'items') loop
    insert into public.menu_items (restaurant_id, category_id, slug, price, currency, image, featured, seasonal, available, sort_order, allergens, dietary_tags)
    values (rid, cid, item->>'slug', (item->>'price')::numeric, item->>'currency', item->>'image',
      coalesce((item->>'featured')::boolean, false), coalesce((item->>'seasonal')::boolean, false),
      coalesce((item->>'available')::boolean, true), coalesce((item->>'sort_order')::int, 0),
      array(select jsonb_array_elements_text(coalesce(item->'allergens', '[]'))),
      array(select jsonb_array_elements_text(coalesce(item->'dietary_tags', '[]'))))
    on conflict (restaurant_id, slug) do update set
      category_id = excluded.category_id, price = excluded.price, currency = excluded.currency,
      image = excluded.image, featured = excluded.featured, seasonal = excluded.seasonal,
      available = excluded.available, active = true, sort_order = excluded.sort_order,
      allergens = excluded.allergens, dietary_tags = excluded.dietary_tags
    returning id into iid;
    insert into public.menu_item_localizations (item_id, locale, name, description)
    select iid, key, value->>'name', value->>'description' from jsonb_each(item->'i18n')
    on conflict (item_id, locale) do update set name = excluded.name, description = excluded.description;
  end loop;
end;
$$;

revoke all on function public.import_menu_category(text, jsonb) from public, anon, authenticated;
