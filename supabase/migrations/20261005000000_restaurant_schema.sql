-- =============================================================================
-- Kyro Studio restaurant starter — core schema
--
-- One Supabase project per restaurant is the recommended setup, but every
-- table is keyed by restaurant_id so a project can host several sites.
--
-- Security model
--   * Content tables (restaurant, menu, hours) are publicly readable through
--     RLS SELECT policies. Nobody but the service role can write them.
--   * booking_requests / contact_messages have RLS enabled and NO policies for
--     anon/authenticated: the public can neither read nor write them directly.
--     Inserts go through SECURITY DEFINER functions that validate every field,
--     enforce opening hours in the restaurant's own timezone and rate-limit.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Helpers
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Restaurants
-- -----------------------------------------------------------------------------
create table public.restaurants (
  id                    uuid primary key default gen_random_uuid(),
  slug                  text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name                  text not null,
  cuisine               text[] not null default '{}',
  street_address        text not null,
  postal_code           text not null,
  city                  text not null,
  region                text,
  country_code          char(2) not null,
  phone                 text not null,
  email                 text not null,
  website               text,
  -- IANA timezone, e.g. Europe/Zagreb. The cast below fails for unknown zones.
  timezone              text not null
                        check (('2000-01-01 00:00+00'::timestamptz at time zone timezone) is not null),
  default_locale        text not null,
  locales               text[] not null,
  currency              char(3) not null,
  price_range           text,
  latitude              numeric(9, 6),
  longitude             numeric(9, 6),
  maps_url              text,
  instagram_url         text,
  booking_enabled       boolean not null default true,
  booking_min_party     integer not null default 1 check (booking_min_party >= 1),
  booking_max_party     integer not null default 8 check (booking_max_party >= booking_min_party),
  booking_lead_minutes  integer not null default 120 check (booking_lead_minutes >= 0),
  booking_window_days   integer not null default 90 check (booking_window_days between 1 and 730),
  booking_slot_minutes  integer not null default 30 check (booking_slot_minutes in (15, 20, 30, 60)),
  -- Last bookable time = service closing time minus this many minutes.
  booking_last_seating_minutes integer not null default 90 check (booking_last_seating_minutes >= 0),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  check (default_locale = any (locales))
);

create trigger restaurants_updated_at before update on public.restaurants
  for each row execute function public.set_updated_at();

create table public.restaurant_localizations (
  restaurant_id     uuid not null references public.restaurants (id) on delete cascade,
  locale            text not null,
  tagline           text not null,
  short_description text not null,
  description       text not null,
  cuisine_label     text not null,
  meta_title        text not null,
  meta_description  text not null,
  primary key (restaurant_id, locale)
);

-- -----------------------------------------------------------------------------
-- Menu
-- -----------------------------------------------------------------------------
create table public.menu_categories (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  slug          text not null check (slug ~ '^[a-z0-9-]+$'),
  sort_order    integer not null default 0,
  active        boolean not null default true,
  unique (restaurant_id, slug)
);

create table public.menu_category_localizations (
  category_id uuid not null references public.menu_categories (id) on delete cascade,
  locale      text not null,
  name        text not null,
  description text,
  primary key (category_id, locale)
);

create table public.menu_items (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  category_id   uuid not null references public.menu_categories (id) on delete cascade,
  slug          text not null check (slug ~ '^[a-z0-9-]+$'),
  -- NULL price = "market price" / price on request.
  price         numeric(10, 2) check (price is null or price >= 0),
  -- NULL currency = inherit the restaurant currency.
  currency      char(3),
  image         text,
  featured      boolean not null default false,
  seasonal      boolean not null default false,
  available     boolean not null default true,
  active        boolean not null default true,
  sort_order    integer not null default 0,
  allergens     text[] not null default '{}',
  dietary_tags  text[] not null default '{}',
  updated_at    timestamptz not null default now(),
  unique (restaurant_id, slug)
);

create index menu_items_category_idx on public.menu_items (category_id, sort_order);
create index menu_items_restaurant_idx on public.menu_items (restaurant_id);
create trigger menu_items_updated_at before update on public.menu_items
  for each row execute function public.set_updated_at();

create table public.menu_item_localizations (
  item_id     uuid not null references public.menu_items (id) on delete cascade,
  locale      text not null,
  name        text not null,
  description text,
  primary key (item_id, locale)
);

-- -----------------------------------------------------------------------------
-- Opening hours
-- -----------------------------------------------------------------------------
-- One row per service period. A day may have several (lunch + dinner).
-- A day without rows is closed. day_of_week is ISO: 1 = Monday … 7 = Sunday.
create table public.opening_hours (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  day_of_week   smallint not null check (day_of_week between 1 and 7),
  service       text not null default 'dinner'
                check (service in ('breakfast', 'lunch', 'dinner', 'all_day', 'bar')),
  opens         time not null,
  closes        time not null,
  check (closes > opens)
);

create index opening_hours_restaurant_idx on public.opening_hours (restaurant_id, day_of_week);

-- Date-specific overrides (holidays, closures, special services).
-- If any row exists for a date it replaces the weekly schedule for that date.
-- closed = true → closed all day; otherwise opens/closes describe one service.
create table public.special_hours (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  date          date not null,
  closed        boolean not null default false,
  service       text check (service in ('breakfast', 'lunch', 'dinner', 'all_day', 'bar')),
  opens         time,
  closes        time,
  -- Localized label, e.g. {"en": "Christmas Eve", "hr": "Badnjak"}
  label         jsonb not null default '{}'::jsonb,
  check (closed or (opens is not null and closes is not null and closes > opens))
);

create index special_hours_restaurant_date_idx on public.special_hours (restaurant_id, date);

-- -----------------------------------------------------------------------------
-- Private: booking requests and contact messages
-- -----------------------------------------------------------------------------
create table public.booking_requests (
  id                  uuid primary key default gen_random_uuid(),
  restaurant_id       uuid not null references public.restaurants (id) on delete cascade,
  reference           text not null unique,
  status              text not null default 'pending'
                      check (status in ('pending', 'confirmed', 'declined', 'cancelled')),
  name                text not null check (char_length(name) between 2 and 120),
  email               text not null check (char_length(email) between 5 and 254),
  phone               text not null check (char_length(phone) between 6 and 32),
  party_size          integer not null check (party_size between 1 and 60),
  booking_date        date not null,
  booking_time        time not null,
  -- Absolute instant, computed from date + time in the restaurant timezone.
  starts_at           timestamptz not null,
  occasion            text check (occasion in ('birthday', 'anniversary', 'business', 'celebration', 'other')),
  seating             text not null default 'no_preference'
                      check (seating in ('no_preference', 'dining_room', 'chefs_counter', 'terrace')),
  message             text check (char_length(message) <= 1000),
  locale              text not null,
  notification_status text not null default 'pending'
                      check (notification_status in ('pending', 'sent', 'failed', 'skipped')),
  created_at          timestamptz not null default now()
);

create index booking_requests_restaurant_starts_idx on public.booking_requests (restaurant_id, starts_at);
create index booking_requests_email_created_idx on public.booking_requests (lower(email), created_at);

create table public.contact_messages (
  id                  uuid primary key default gen_random_uuid(),
  restaurant_id       uuid not null references public.restaurants (id) on delete cascade,
  name                text not null check (char_length(name) between 2 and 120),
  email               text not null check (char_length(email) between 5 and 254),
  phone               text check (char_length(phone) <= 32),
  subject             text not null default 'general'
                      check (subject in ('general', 'private_dining', 'events', 'press', 'other')),
  message             text not null check (char_length(message) between 10 and 4000),
  locale              text not null,
  status              text not null default 'new' check (status in ('new', 'answered', 'archived')),
  notification_status text not null default 'pending'
                      check (notification_status in ('pending', 'sent', 'failed', 'skipped')),
  created_at          timestamptz not null default now()
);

create index contact_messages_restaurant_created_idx on public.contact_messages (restaurant_id, created_at);
create index contact_messages_email_created_idx on public.contact_messages (lower(email), created_at);

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
alter table public.restaurants                 enable row level security;
alter table public.restaurant_localizations    enable row level security;
alter table public.menu_categories             enable row level security;
alter table public.menu_category_localizations enable row level security;
alter table public.menu_items                  enable row level security;
alter table public.menu_item_localizations     enable row level security;
alter table public.opening_hours               enable row level security;
alter table public.special_hours               enable row level security;
alter table public.booking_requests            enable row level security;
alter table public.contact_messages            enable row level security;

create policy "Public read restaurants"
  on public.restaurants for select to anon, authenticated using (true);

create policy "Public read restaurant localizations"
  on public.restaurant_localizations for select to anon, authenticated using (true);

create policy "Public read active categories"
  on public.menu_categories for select to anon, authenticated using (active);

create policy "Public read category localizations"
  on public.menu_category_localizations for select to anon, authenticated
  using (exists (
    select 1 from public.menu_categories c
    where c.id = category_id and c.active
  ));

create policy "Public read active items"
  on public.menu_items for select to anon, authenticated
  using (active and exists (
    select 1 from public.menu_categories c
    where c.id = category_id and c.active
  ));

create policy "Public read item localizations"
  on public.menu_item_localizations for select to anon, authenticated
  using (exists (
    select 1 from public.menu_items i
    where i.id = item_id and i.active
  ));

create policy "Public read opening hours"
  on public.opening_hours for select to anon, authenticated using (true);

create policy "Public read special hours"
  on public.special_hours for select to anon, authenticated
  using (date >= current_date - 1);

-- booking_requests and contact_messages: intentionally no policies.
-- Only the service role (server-side, never shipped to the browser) and the
-- SECURITY DEFINER functions below can touch them.
revoke all on public.booking_requests from anon, authenticated;
revoke all on public.contact_messages from anon, authenticated;

-- Content tables are read-only for the public roles.
revoke insert, update, delete, truncate on
  public.restaurants, public.restaurant_localizations,
  public.menu_categories, public.menu_category_localizations,
  public.menu_items, public.menu_item_localizations,
  public.opening_hours, public.special_hours
from anon, authenticated;

-- -----------------------------------------------------------------------------
-- RPC: create_booking_request
-- Errors are raised as short machine codes (e.g. 'closed', 'too_soon') which
-- the website maps to localized messages.
-- -----------------------------------------------------------------------------
create or replace function public.create_booking_request(
  p_restaurant_slug text,
  p_name            text,
  p_email           text,
  p_phone           text,
  p_party_size      integer,
  p_date            date,
  p_time            time,
  p_occasion        text default null,
  p_seating         text default 'no_preference',
  p_message         text default null,
  p_locale          text default 'en'
)
returns table (id uuid, reference text, starts_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  r             public.restaurants%rowtype;
  v_starts_at   timestamptz;
  v_local_today date;
  v_has_special boolean;
  v_ok          boolean;
  v_reference   text;
  v_id          uuid;
  v_email       text := lower(btrim(coalesce(p_email, '')));
  v_name        text := btrim(coalesce(p_name, ''));
  v_phone       text := btrim(coalesce(p_phone, ''));
  v_message     text := nullif(btrim(coalesce(p_message, '')), '');
begin
  select * into r from public.restaurants where slug = p_restaurant_slug;
  if not found then
    raise exception 'restaurant_not_found' using errcode = 'P0001';
  end if;
  if not r.booking_enabled then
    raise exception 'booking_disabled' using errcode = 'P0001';
  end if;

  -- Field validation (the website validates too; this is the trust boundary).
  if char_length(v_name) < 2 or char_length(v_name) > 120 then
    raise exception 'invalid_name' using errcode = 'P0001';
  end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$' or char_length(v_email) > 254 then
    raise exception 'invalid_email' using errcode = 'P0001';
  end if;
  if v_phone !~ '^\+?[0-9 ()./-]{6,32}$' then
    raise exception 'invalid_phone' using errcode = 'P0001';
  end if;
  if p_party_size is null or p_party_size < r.booking_min_party or p_party_size > r.booking_max_party then
    raise exception 'invalid_party_size' using errcode = 'P0001';
  end if;
  if v_message is not null and char_length(v_message) > 1000 then
    raise exception 'invalid_message' using errcode = 'P0001';
  end if;
  if p_locale is null or not (p_locale = any (r.locales)) then
    p_locale := r.default_locale;
  end if;
  if p_date is null or p_time is null then
    raise exception 'invalid_datetime' using errcode = 'P0001';
  end if;

  -- Interpret the requested wall-clock time in the restaurant's timezone.
  v_starts_at   := (p_date + p_time) at time zone r.timezone;
  v_local_today := (now() at time zone r.timezone)::date;

  if v_starts_at < now() + make_interval(mins => r.booking_lead_minutes) then
    raise exception 'too_soon' using errcode = 'P0001';
  end if;
  if p_date > v_local_today + r.booking_window_days then
    raise exception 'too_far' using errcode = 'P0001';
  end if;

  -- Opening hours: date-specific overrides win over the weekly schedule.
  select exists (
    select 1 from public.special_hours s
    where s.restaurant_id = r.id and s.date = p_date
  ) into v_has_special;

  if v_has_special then
    select exists (
      select 1 from public.special_hours s
      where s.restaurant_id = r.id and s.date = p_date and not s.closed
        and p_time >= s.opens
        and p_time <= s.closes - make_interval(mins => r.booking_last_seating_minutes)
    ) and not exists (
      select 1 from public.special_hours s
      where s.restaurant_id = r.id and s.date = p_date and s.closed
    ) into v_ok;
  else
    select exists (
      select 1 from public.opening_hours h
      where h.restaurant_id = r.id
        and h.day_of_week = extract(isodow from p_date)
        and p_time >= h.opens
        and p_time <= h.closes - make_interval(mins => r.booking_last_seating_minutes)
    ) into v_ok;
  end if;

  if not v_ok then
    raise exception 'closed' using errcode = 'P0001';
  end if;

  -- Abuse protection: per-email and per-restaurant burst limits.
  if (select count(*) from public.booking_requests b
      where lower(b.email) = v_email and b.created_at > now() - interval '10 minutes') >= 3 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;
  if (select count(*) from public.booking_requests b
      where b.restaurant_id = r.id and b.created_at > now() - interval '1 minute') >= 20 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;

  -- Human-friendly reference, e.g. "K7Q2MD". No 0/O/1/I to avoid confusion.
  loop
    v_reference := (
      select string_agg(substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 1 + floor(random() * 32)::int, 1), '')
      from generate_series(1, 6)
    );
    exit when not exists (select 1 from public.booking_requests b where b.reference = v_reference);
  end loop;

  insert into public.booking_requests (
    restaurant_id, reference, name, email, phone, party_size,
    booking_date, booking_time, starts_at, occasion, seating, message, locale
  ) values (
    r.id, v_reference, v_name, v_email, v_phone, p_party_size,
    p_date, p_time, v_starts_at,
    nullif(p_occasion, ''), coalesce(nullif(p_seating, ''), 'no_preference'),
    v_message, p_locale
  )
  returning booking_requests.id into v_id;

  return query select v_id, v_reference, v_starts_at;
end;
$$;

-- -----------------------------------------------------------------------------
-- RPC: create_contact_message
-- -----------------------------------------------------------------------------
create or replace function public.create_contact_message(
  p_restaurant_slug text,
  p_name            text,
  p_email           text,
  p_message         text,
  p_phone           text default null,
  p_subject         text default 'general',
  p_locale          text default 'en'
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  r         public.restaurants%rowtype;
  v_id      uuid;
  v_email   text := lower(btrim(coalesce(p_email, '')));
  v_name    text := btrim(coalesce(p_name, ''));
  v_phone   text := nullif(btrim(coalesce(p_phone, '')), '');
  v_message text := btrim(coalesce(p_message, ''));
begin
  select * into r from public.restaurants where slug = p_restaurant_slug;
  if not found then
    raise exception 'restaurant_not_found' using errcode = 'P0001';
  end if;
  if char_length(v_name) < 2 or char_length(v_name) > 120 then
    raise exception 'invalid_name' using errcode = 'P0001';
  end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$' or char_length(v_email) > 254 then
    raise exception 'invalid_email' using errcode = 'P0001';
  end if;
  if v_phone is not null and v_phone !~ '^\+?[0-9 ()./-]{6,32}$' then
    raise exception 'invalid_phone' using errcode = 'P0001';
  end if;
  if char_length(v_message) < 10 or char_length(v_message) > 4000 then
    raise exception 'invalid_message' using errcode = 'P0001';
  end if;
  if p_locale is null or not (p_locale = any (r.locales)) then
    p_locale := r.default_locale;
  end if;
  if (select count(*) from public.contact_messages m
      where lower(m.email) = v_email and m.created_at > now() - interval '10 minutes') >= 3 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;

  insert into public.contact_messages (restaurant_id, name, email, phone, subject, message, locale)
  values (
    r.id, v_name, v_email, v_phone,
    case when p_subject in ('general', 'private_dining', 'events', 'press', 'other') then p_subject else 'general' end,
    v_message, p_locale
  )
  returning contact_messages.id into v_id;

  return v_id;
end;
$$;

revoke all on function public.create_booking_request(text, text, text, text, integer, date, time, text, text, text, text) from public;
revoke all on function public.create_contact_message(text, text, text, text, text, text, text) from public;
grant execute on function public.create_booking_request(text, text, text, text, integer, date, time, text, text, text, text) to anon, authenticated;
grant execute on function public.create_contact_message(text, text, text, text, text, text, text) to anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;
