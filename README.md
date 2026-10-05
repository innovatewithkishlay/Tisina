# Tišina — Kyro Studio European Restaurant Starter

A production-ready restaurant website that also serves as Kyro Studio's reusable starter. The
shared code is built once, and each new restaurant is created by changing configuration, content
and data.

The repository ships as a finished site for **Tišina**, a fictional restaurant in Zagreb's Upper
Town that serves Croatian regional cuisine in HR · EN · DE · HU and prices in EUR. Every component,
table and route is generic, so the same code can become a Zagreb fine-dining room (HR/EN), an
Adriatic konoba (HR/EN/DE) or a Budapest bistro (HU/EN, HUF).

> **Fictional brand.** Tišina, its address number, phone, email, Instagram handle and menu are
> invented for the starter. There are no ratings, awards, reviews or press claims anywhere, in the
> UI or in the structured data. Replace all of these facts when forking.

---

## Contents

1. [Project overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Local setup](#3-local-setup)
4. [Environment variables](#4-environment-variables)
5. [Supabase setup](#5-supabase-setup)
6. [Database schema](#6-database-schema)
7. [SMTP setup](#7-smtp-setup)
8. [How booking works](#8-how-booking-works)
9. [How the contact form works](#9-how-the-contact-form-works)
10. [How localization works](#10-how-localization-works)
11. [How to add a language](#11-how-to-add-a-language)
12. [How to change branding](#12-how-to-change-branding)
13. [How to change the menu](#13-how-to-change-the-menu)
14. [How to change opening hours](#14-how-to-change-opening-hours)
15. [How to change the location](#15-how-to-change-the-location)
16. [How to configure booking](#16-how-to-configure-booking)
17. [How SEO works](#17-how-seo-works)
18. [How hreflang works](#18-how-hreflang-works)
19. [How structured data works](#19-how-structured-data-works)
20. [How to deploy](#20-how-to-deploy)
21. [How to test](#21-how-to-test)
22. [How to run Lighthouse](#22-how-to-run-lighthouse)
23. [**How to turn this starter into a new restaurant**](#23-how-to-turn-this-starter-into-a-new-restaurant)

---

## 1. Project overview

| | |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack, React 19.2) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4, with design tokens in `app/globals.css` |
| i18n | next-intl 4, with `/hr`, `/en`, `/de`, `/hu` routes |
| Data | Supabase (Postgres + RLS + RPC), with bundled content as an offline fallback |
| Email | SMTP via Nodemailer (any provider) |
| Validation | Zod on the server, re-validated inside Postgres |
| Motion | GSAP + ScrollTrigger for scroll choreography, Lenis for smooth scrolling, CSS for load reveals and the React `<ViewTransition>`. Everything is switched off under `prefers-reduced-motion`. |

Pages: **Home**, **Menu**, **Story**, **Visit** (location, hours, FAQ), **Reserve**, **Contact** and
**Privacy**. There is also a localized 404, an error boundary, a sitemap, robots.txt, llms.txt, a
web manifest and per-locale Open Graph images.

Measured with Lighthouse (mobile, simulated slow 4G) on a production build, after the motion
redesign. Scores vary by a few points between runs:

| Page | Performance | Accessibility | Best practices | SEO |
|---|---|---|---|---|
| `/en` | 82–89 | 100 | 100 | 100 |
| `/en/menu` | 85 | 100 | 100 | 100 |
| `/en/book` | 84 | 100 | 100 | 100 |

The home page streams a 1.2 MB (phones) or 3.8 MB (desktop) film. Only one file is loaded, and
only after the page has finished loading. Its poster and every photograph paint first with a
blurred placeholder, so the page is never text-only while media loads.
CLS is 0 on every page.

## 2. Architecture

```
app/
  [locale]/            one set of pages for every language
    page.tsx           home (editorial sections)
    menu/ story/ visit/ book/ contact/ privacy/
    layout.tsx         fonts, nav, footer, providers, ViewTransition
    opengraph-image.tsx  per-locale share image in the brand fonts
    not-found.tsx error.tsx [...rest]/
  sitemap.ts robots.ts manifest.ts llms.txt/route.ts icon.svg
components/
  brand/Logo.tsx       the wordmark as SVG paths, with the háček (ˇ) as a separate stroke
  layout/              Navbar (solid bar + side menu), LanguageSwitcher,
                       OpenStatus, LocalClock, Footer (curtain reveal)
  home/                HeroVideo, Manifesto, CraftHorizontal (pinned sideways scroll),
                       RegionsScroll, SignatureDish, MenuGlance, GalleryColumns
  menu/                MenuHero, MenuBoard (photo-first courses + dish cards, diet filter)
  admin/               LoginForm, DecisionForm (staff panel, see §8a)
  visit/               OpeningHours, Location, Faq
  booking/ contact/    BookingForm (+ live ticket stub), FireFilm, ContactForm
  ui/                  Button, Field, Img (blur placeholders), Kicker, Reveal/Words, PageHeader
  motion/              SmoothScroll (Lenis), gsap.ts, RevealObserver
app/admin/             staff panel: /admin/login and /admin (not localized, noindex)
config/
  site.ts              ← brand name, enabled locales, nav, revalidation
  locales.ts           every language the starter knows
content/
  restaurant.ts        ← facts, translations, hours, menu (seed + fallback)
  images.ts            ← every photograph, by role
messages/<locale>.json ← UI strings and editorial copy
lib/
  data/restaurant.ts   one Supabase query → typed, locale-resolved data
  hours.ts             opening hours, "open now" and booking slots, all in the restaurant's timezone
  format.ts            Intl price/date/time/region formatting
  booking/             zod schemas, server actions (booking + contact)
  email/               SMTP transport and HTML templates
  seo/                 metadata/hreflang helpers and JSON-LD builders
  supabase/server.ts   public (anon) and optional admin clients, server-only
supabase/
  migrations/          schema, RLS, RPC functions
  seed.sql             generated from content/restaurant.ts
scripts/generate-seed.ts
```

The rules that keep it forkable:

- **Components never hold restaurant facts.** Facts come from Supabase or `content/`, copy comes
  from `messages/`, photos come from `content/images.ts`.
- **One implementation per page.** Language is a route segment, not a copy of the page.
- **Server Components by default.** Pages fetch and translate on the server; client components
  receive plain props and only animate or handle input (navbar, scroll sections, menu board, forms).
- **Never blank.** If Supabase is not configured or can't be reached, the site renders the bundled
  `content/restaurant.ts` and logs a warning.

## 3. Local setup

Requires Node.js ≥ 20.9.

```bash
npm install
cp .env.example .env.local     # fill in the values (see below)
npm run dev                    # http://localhost:3000 → redirects to /hr
```

Production build:

```bash
npm run build && npm run start
```

Without any environment variables the site still runs on the bundled content. In that case booking
and contact submissions fail gracefully, because there is nowhere to store or send them.

## 4. Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | public | Canonical origin, used for canonical, hreflang, sitemap, OG and email links |
| `NEXT_PUBLIC_SUPABASE_URL` | public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | Publishable/anon key. RLS limits it to public content plus the two RPCs. |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only, optional** | Records email delivery status on bookings and messages. Never prefix it with `NEXT_PUBLIC_`. |
| `SMTP_HOST` / `SMTP_PORT` | server | SMTP server. Port 465 uses implicit TLS; 587 uses STARTTLS. |
| `SMTP_USER` / `SMTP_PASSWORD` | **server only** | SMTP credentials |
| `SMTP_FROM` | server | Sender, e.g. `Tišina <rezervacije@tisina-zagreb.hr>` |
| `RESTAURANT_NOTIFICATION_EMAIL` | server | Where requests are delivered (comma-separated allowed). Falls back to the restaurant email. |
| `SEND_GUEST_ACKNOWLEDGEMENT` | server | `false` disables the guest acknowledgement email |

Only `NEXT_PUBLIC_*` values ever reach the browser. The Supabase clients and email modules import
`server-only`, so the build fails if they are pulled into client code.

## 5. Supabase setup

The starter's own project is **`kyro-restaurant-starter`** (ref `fgivqkbggfhqjxvrtdko`, EU Central).
The migrations in this repository have already been applied to it, and it is seeded with Tišina.
Each restaurant should get **its own project**.

1. Create a project in an EU region.
2. Apply the migrations in `supabase/migrations/` in order. Use the SQL editor, `supabase db push`,
   or `psql "$DATABASE_URL" -f <file>`.
3. Seed the restaurant:
   ```bash
   npm run db:seed:generate        # writes supabase/seed.sql from content/restaurant.ts
   psql "$DATABASE_URL" -f supabase/seed.sql
   ```
   If your SQL editor rejects the large payload, paste the output of `npm run db:seed:chunks`
   instead, one statement per menu category. Insert the restaurant row first from `seed.sql`.
4. Copy the URL and publishable key from **Project Settings → API** into the environment.
5. Run the database advisors (**Advisors → Security**). Two warnings are expected: `anon` can
   execute `create_booking_request` and `create_contact_message`, because that is the public write
   path, guarded by validation and rate limits. The INFO notes about "RLS enabled, no policy" on
   `booking_requests` and `contact_messages` are intentional too: nobody but the service role may
   touch those tables.

Staff read and confirm bookings in the Supabase table editor
(`booking_requests.status`: `pending` → `confirmed` / `declined` / `cancelled`). No admin dashboard
is included on purpose.

## 6. Database schema

| Table | Purpose | Public access |
|---|---|---|
| `restaurants` | Facts, timezone, currency, locales, booking rules | read |
| `restaurant_localizations` | tagline, descriptions, cuisine label, meta title/description per locale | read |
| `menu_categories` / `menu_category_localizations` | Ordered sections with translated name and description | read (active only) |
| `menu_items` / `menu_item_localizations` | price (`null` = market price), currency override, image, featured, seasonal, available, allergens, dietary tags, sort order | read (active only) |
| `opening_hours` | One row per **service period** (ISO weekday, `lunch`/`dinner`/…, opens, closes). A day with no rows is closed. Split service is two rows. | read |
| `special_hours` | Date overrides: closed days, holidays, special services, with a localized label | read (today onward) |
| `booking_requests` | Booking requests with a reference, status, `starts_at` (timestamptz) and notification status | **none** |
| `contact_messages` | Enquiries with subject, status and notification status | **none** |

RPC functions (`SECURITY DEFINER`, `search_path=''`):

- `create_booking_request(...)` validates every field. It checks the party size against the
  restaurant's limits, interprets the date and time **in the restaurant's timezone**, enforces lead
  time, booking window, opening hours and special hours (including last seating), and rate-limits by
  email and per restaurant. It returns `{ id, reference, starts_at }` and raises short error codes
  (`closed`, `too_soon`, `invalid_email`…), which the website translates.
- `create_contact_message(...)` validates and rate-limits the same way.
- `import_menu_category(slug, json)` is a seed helper. The public can't call it.

## 7. SMTP setup

Any SMTP provider works (Postmark, Mailgun, Brevo, Amazon SES, Google Workspace…).

1. Verify the sending domain with the provider (SPF, DKIM, and DMARC alignment for `SMTP_FROM`).
2. Set the `SMTP_*` variables and `RESTAURANT_NOTIFICATION_EMAIL`.
3. Send a test booking. The restaurant receives a notification in its default language with the
   guest set as Reply-To, so staff can answer straight from their inbox. The guest receives an
   acknowledgement in the language they booked in.

Templates live in `lib/email/templates.ts`. They use table-based HTML with inline styles, include
a plain-text alternative, and HTML-escape all user input. To preview them locally, run any SMTP
sink such as [Mailpit](https://mailpit.axllent.org/) and point `SMTP_HOST`/`SMTP_PORT` at it.

## 8. How booking works

```
Guest submits form
  → honeypot + per-IP throttle            (lib/rate-limit.ts)
  → zod validation (field-level errors)   (lib/booking/schema.ts)
  → slot check in restaurant timezone     (lib/hours.ts → bookingSlots)
  → Supabase RPC create_booking_request   (re-validates everything; source of truth)
  → email the restaurant                  (SMTP)
  → acknowledge the guest (optional)      (SMTP)
  → record notification status            (only with SUPABASE_SERVICE_ROLE_KEY)
  → success screen with reference
```

- It is a **request** system. The UI and emails say "request received, the restaurant will
  confirm". Nothing claims a table is confirmed.
- The date strip and time chips are computed from opening hours, special hours, lead time and
  last-seating rules, **in the restaurant's timezone**, whatever the visitor's timezone is.
- Resilience: if the database can't be reached but the email goes out, the request still counts as
  received. If both fail, the guest sees an honest error with the phone number.
- States: idle, inline validation (focus moves to the error summary), pending (button spinner,
  `aria-live`), success (focus moves to the confirmation heading) and error.

### 8a. Admin panel (`/admin`)

Staff sign in at **`/admin/login`** with a Supabase Auth email + password. The dashboard shows:

- **Overview**: requests awaiting a decision, covers tonight, confirmed bookings in the next 7
  days, new messages.
- **Bookings** (Pending · Upcoming · Past · All), grouped by day: time, party, contact links,
  occasion, seating, the guest's note, reference and language.
  - **Confirm**, **Decline**, **Cancel** or reopen a request. You can add an optional note to the
    guest.
  - With "Email the guest" ticked, the guest gets a confirmation, decline or cancellation email in
    the language they booked in (`bookingDecision` in `lib/email/templates.ts`). Whether it was
    sent is stored in `guest_notified`.
- **Messages** from the contact form: reply by email, call, mark answered or archived.

Security model (`supabase/migrations/20261005000200_admin.sql`):

- Only users listed in `public.admins` are admins. `public.is_admin()` checks the signed-in JWT.
- Admins get RLS `select`/`update` on `booking_requests` and `contact_messages`. Column grants
  limit updates to the decision fields (`status`, `admin_note`, `status_changed_at`,
  `guest_notified`). Guests and other signed-in users still see nothing.
- The panel uses the publishable key plus the staff member's session cookie (`@supabase/ssr`,
  refreshed in `proxy.ts`). No service-role key is needed or shipped to the browser.
- `/admin` is `noindex` (header + metadata) and disallowed in `robots.txt`. Login attempts are
  throttled.

**Add an admin.** Create the user in Supabase → Authentication → Users (email + password,
auto-confirm), then:

```sql
insert into public.admins (user_id, email)
select id, email from auth.users where email = 'staff@example.com';
```

Remove access by deleting that row. Passwords are never stored in this repository. Change them in
Supabase → Authentication.

## 9. How the contact form works

`components/contact/ContactForm.tsx` uses the `submitContact` server action. The flow is zod
validation, then the `create_contact_message` RPC, then an SMTP notification to the restaurant
with the guest as Reply-To, then the success state. Subjects (general, private dining, events,
press, other) are translated, and the notification arrives in the restaurant's language.

## 10. How localization works

- `config/locales.ts` lists every language the starter supports, with its label, hreflang,
  `Intl` locale and OG locale.
- `config/site.ts → locales` enables a subset for this restaurant, and `defaultLocale` is served at
  `/` and used as `x-default`.
- Every URL is prefixed (`/hr/menu`, `/en/menu`…). `proxy.ts` (next-intl middleware) redirects
  `/` according to `Accept-Language`.
- UI strings and editorial copy live in `messages/<locale>.json`. Restaurant facts and the menu
  are translated per row in Supabase (`*_localizations`). A missing translation falls back to the
  restaurant's default locale, then English.
- Client components receive only the message namespaces they need. The form pages add their own
  through `components/i18n/ClientMessages`.
- The language switcher keeps the current page and query string.
- Prices, dates, times and country names are formatted with `Intl` (`lib/format.ts`): 24-hour
  clocks, `19 €` in Croatian, `€19` in English, and `4500 Ft` once you switch to HUF.

## 11. How to add a language

Hungarian (`hu`) is used as the example:

1. If the code isn't in `config/locales.ts`, add it (label, hreflang, `intl`, `ogLocale`).
2. Add it to `config/site.ts → locales`.
3. Create `messages/hu.json` by copying `messages/en.json` and translating it. Every file must have
   the same keys.
4. Add `hu` entries to `content/restaurant.ts` (`i18n`, every category and item, special-hours
   labels), then regenerate and apply the seed. Alternatively, insert `*_localizations` rows
   directly in Supabase.
5. Add `hu` to `restaurants.locales` in Supabase. It is done automatically if you re-run the seed.
6. Optionally, add a `hu` dictionary to `lib/email/templates.ts` (`strings`) for emails.

Routes, switcher, hreflang, sitemap and OG images pick up the new language automatically.

## 12. How to change branding

| What | Where |
|---|---|
| Name / wordmark | `config/site.ts → brandName` |
| Colours | `app/globals.css → :root` (`--brand-*`). Dark sections use `.night`. |
| Typefaces | `app/[locale]/layout.tsx` (`next/font/google`). Keep the `latin-ext` coverage for Croatian and Hungarian. Also update the TTFs in `assets/fonts/` used by the OG image. |
| Type scale, spacing, motion timing | `app/globals.css → @theme` and `:root` |
| Favicon / touch icon | `app/icon.svg`, `app/apple-icon.png` |
| Photography | `content/images.ts` (by role) and `menu_items.image` |
| Editorial copy | `messages/<locale>.json → Home`, `Story`, `Visit.faq`… |
| Wordmark | `components/brand/Logo.tsx`. The letters are SVG paths (converted from the display font), and the háček is a separate stroke that draws in on load and takes the accent colour. For another name, export the new wordmark as one path and replace `LETTERS`. To drop the háček, remove `HACEK_PATH`. Section labels (`Kicker`) reuse the same chevron. |

### Media pipeline

Video lives in `public/media`, declared in `content/images.ts → videos`. Re-encode a new source
before committing it. Never ship the camera original:

```bash
# hero: 1080p and 540p, no audio, fast start, ~4 MB / ~1.2 MB
ffmpeg -i source.mp4 -an -vf "scale=-2:1080,format=yuv420p" -c:v libx264 -crf 26 -preset slow -movflags +faststart public/media/hero-1080.mp4
ffmpeg -i source.mp4 -an -vf "scale=-2:540,format=yuv420p"  -c:v libx264 -crf 28 -preset slow -movflags +faststart public/media/hero-540.mp4
# poster still (also used as the first paint)
ffmpeg -ss 2 -i source.mp4 -frames:v 1 -q:v 3 public/images/kitchen/poster.jpg
```

After adding or replacing any image in `public/images`, run `npm run media:blur`. It regenerates
`content/blur.ts` with a tiny blurred preview of every photo, and `<Img>` uses it automatically.

### Motion

Scroll choreography uses GSAP ScrollTrigger inside `useGSAP` (scoped and cleaned up on
navigation). Lenis smooths the scroll and drives ScrollTrigger from GSAP's ticker
(`components/motion/SmoothScroll.tsx`). With `prefers-reduced-motion`, Lenis is not started, every
GSAP block returns early, CSS animations collapse and the hero video stays on its poster. All
movement is vertical: sticky stacks, pinned frames and parallax columns. Nothing scrolls sideways.

## 13. How to change the menu

**Live restaurant:** edit rows in Supabase (`menu_categories`, `menu_items` and their
`*_localizations`). The site refreshes within `revalidateSeconds` (5 minutes by default).

- Hide a dish today: `available = false`. It shows as "Sold out today".
- Remove a dish: `active = false`.
- Market price: `price = null`.
- A different currency for one item: set `currency` (otherwise the restaurant currency is used).
- Highlight a dish: `featured = true`. It then appears on the homepage menu preview and in the
  Signature section (see `SIGNATURE_SLUG` in `app/[locale]/page.tsx`).
- Allergens use the 14 EU codes in `types/restaurant.ts`, and dietary tags are `vegetarian`,
  `vegan`, `gluten_free`, `dairy_free`, `pescatarian`.

**New restaurant / fallback:** edit `content/restaurant.ts → menu`, then run
`npm run db:seed:generate` and apply `supabase/seed.sql`.

Categories are free-form, so "Tasting menu / À la carte", "From the sea / From the grill" and
"Breakfast / Small plates" all work without code changes.

## 14. How to change opening hours

`opening_hours` holds one row per service. For example, Tuesday lunch 12:00–15:00 and Tuesday
dinner 18:30–23:00 are two rows. Leave a day out to close it. Use `special_hours` for a date:
either `closed = true`, or a single service with `opens`/`closes`, plus a localized `label`.
Special hours replace the weekly schedule for that date everywhere: the hours list, the
"open now" indicator, booking slots, the database validation and the JSON-LD.

## 15. How to change the location

Edit the address, `geo`, `mapsUrl`, phone and email in `content/restaurant.ts` (then re-seed), or
in the `restaurants` row. The Visit page's "Getting here" text is in
`messages/*.json → Visit.gettingHere`. There is no embedded map iframe, deliberately: it is heavy
and sets third-party cookies. "Get directions" opens the visitor's maps app instead.

## 16. How to configure booking

These columns live on `restaurants` (and in `content/restaurant.ts → booking`):

| Column | Meaning |
|---|---|
| `booking_enabled` | Turns the online form on or off. When off, the page shows the phone number. |
| `booking_min_party` / `booking_max_party` | Party sizes allowed online |
| `booking_lead_minutes` | Minimum notice |
| `booking_window_days` | How far ahead guests can book |
| `booking_slot_minutes` | Slot spacing (15/20/30/60) |
| `booking_last_seating_minutes` | Last bookable time = service close − this |
| `timezone` | IANA zone, e.g. `Europe/Zagreb`, `Europe/Budapest` |

Seating options and occasions are defined in `lib/booking/constants.ts`, with labels in
`messages → Booking`.

## 17. How SEO works

`lib/seo/metadata.ts → pageMetadata()` gives every page a localized title (with a
`%s — Brand` template), a meta description, a canonical URL, hreflang alternates, Open Graph data
(locale plus alternate locales, and a generated 1200×630 image per locale) and a Twitter card.
`app/sitemap.ts` lists every page × locale with alternates, and `app/robots.ts` points to it.
Pages are statically pre-rendered per locale and revalidated every 5 minutes (ISR), so Supabase
edits go live without a redeploy.

AEO/GEO: `/llms.txt` is a plain-language, factual summary generated from live data (facts, hours,
pages, the full menu with prices). The Visit page carries a real FAQ marked up as `FAQPage`.
Content uses semantic HTML (`address`, `dl`, `details`, a heading hierarchy, labelled landmarks).

## 18. How hreflang works

For each page, `languageAlternates(path)` emits one `<link rel="alternate" hreflang="…">` per
enabled locale plus `x-default` (the default locale). The same map is written into the sitemap
(`xhtml:link`). Each language has exactly one canonical URL, because there is no un-prefixed
duplicate. Enabling or disabling a locale in `config/site.ts` updates all of this.

## 19. How structured data works

The builders are in `lib/seo/jsonld.ts` and are rendered with `components/seo/JsonLd` (escaped
against `</script>` injection):

| Page | Types |
|---|---|
| Home | `Restaurant` (address, geo, phone, cuisine, price range, opening hours **including special dates**, `acceptsReservations`, `hasMenu`, languages) and `WebSite` |
| Menu | `Menu` → `MenuSection` → `MenuItem` with `Offer` (price, currency, availability) and `suitableForDiet`, plus `BreadcrumbList` |
| Visit | `FAQPage` and `BreadcrumbList` |
| Story / Book / Contact | `BreadcrumbList` |

The JSON-LD never includes ratings, reviews, awards or other unverifiable claims. Validate it with
the [Rich Results Test](https://search.google.com/test/rich-results).

## 20. How to deploy

Vercel is recommended. Any Node host that runs `next start` also works.

1. Import the repository and set the environment variables from §4 for Production and Preview.
2. Set `NEXT_PUBLIC_SITE_URL` to the final domain, which affects canonical and hreflang URLs.
3. Deploy, then submit `https://<domain>/sitemap.xml` in Google Search Console.
4. Send one test booking and one test enquiry, and confirm both rows appear in Supabase and both
   emails arrive.

## 21. How to test

```bash
npm run typecheck   # next typegen + tsc --noEmit
npm run lint        # eslint (next core-web-vitals + typescript)
npm run build       # production build, pre-renders every page × locale
```

Manual checklist, all verified on this build:

- `/` redirects to the best language, the switcher keeps the page, and `<html lang>` updates.
- Mobile menu: opens and closes, focus is trapped, Escape closes it, and it closes on navigation.
- Booking: empty submit shows field errors and moves focus to the summary. A valid submit shows the
  success screen with a reference. The restaurant and guest emails arrive and are escaped.
- Contact: valid submit shows the success state and the notification arrives.
- Reduced motion (`prefers-reduced-motion: reduce`) shows all content immediately without movement.
- Without JavaScript, all content is still visible, because reveals only hide content when JS runs.
- An unknown URL shows the localized 404. `/sitemap.xml`, `/robots.txt`, `/llms.txt` and
  `/<locale>/opengraph-image` all respond.

Database checks (run in the SQL editor, which rolls back):

```sql
begin;
set local role anon;
select * from public.create_booking_request('tisina','Ana','ana@example.com','+385 91 234 5678',2,'2026-10-09','19:30');
select count(*) from public.booking_requests;  -- must fail: permission denied
rollback;
```

## 22. How to run Lighthouse

```bash
npm run build && npm run start
npx lighthouse http://localhost:3000/en --form-factor=mobile --view
```

Or use Chrome DevTools → Lighthouse → Mobile against the production server (not `next dev`).

## 23. How to turn this starter into a new restaurant

This is the whole process. Steps 1–8 cover a typical fork, for example **Budapest Casual Bistro
(HU + EN, HUF)**.

1. **Create the repository**
   Fork or use this repo as a template, e.g. `kyro-bistro-budapest`.

2. **Create the Supabase project** (EU region) and apply `supabase/migrations/*` in order.

3. **Set identity** in `config/site.ts`:
   ```ts
   restaurantSlug: 'bistro-budapest',
   brandName: 'Kert',                    // the real name (then redraw components/brand/Logo.tsx)
   locales: ['hu', 'en'],
   defaultLocale: 'hu',
   ```

4. **Replace the facts** in `content/restaurant.ts`:
   - `slug` (same as above), `name`, `cuisine`, `address` (street, postal code, city, `countryCode: 'HU'`),
     `geo`, `mapsUrl`, `phone` (international format, e.g. `+36 1 234 5678`), `email`, `website`,
     `instagram`
   - `timezone: 'Europe/Budapest'`, `currency: 'HUF'`, `priceRange`
   - `defaultLocale: 'hu'`, `locales: ['hu', 'en']`
   - `booking` rules
   - `i18n` for **each** enabled locale (tagline, descriptions, cuisine label, meta title and description)
   - `hours` (one entry per service), `specialHours` (local holidays)
   - `menu` (categories → items, prices in HUF, translations, allergens, dietary tags, images)

5. **Write the copy** in `messages/hu.json` and `messages/en.json`. Delete the files for languages
   you don't use. Rewrite `Home`, `Story`, `Visit` (including `faq` and `gettingHere`),
   `Privacy` (supervisory authority, e.g. NAIH for Hungary) and `Footer.tagline`. In
   `app/[locale]/page.tsx`, adjust `REGION_KEYS`, `KITCHEN_KEYS`, `GALLERY_KEYS` and
   `SIGNATURE_SLUG` to match the new story. In `app/[locale]/menu/page.tsx`, map course slugs to
   photos in `COURSE_IMAGES` and pick three `HERO_PLATES`.

6. **Swap photography**: put files in `public/images/…`, update `content/images.ts` and the menu
   item `image` paths. Prefer real photos of the restaurant, in landscape and portrait crops.

7. **Rebrand**: palette in `app/globals.css → :root`, fonts in `app/[locale]/layout.tsx` (keep
   `latin-ext` for ő/ű), `app/icon.svg` and `app/apple-icon.png`, and the TTFs in `assets/fonts/`
   for the OG image.

8. **Seed, configure, deploy**:
   ```bash
   npm run db:seed:generate && psql "$DATABASE_URL" -f supabase/seed.sql
   ```
   Set the environment variables (§4) with the new Supabase keys and the restaurant's SMTP
   sender, then deploy (§20) and run the test checklist (§21).

What you should **not** need to touch: anything in `components/`, `lib/`, the page files (apart
from the constants in step 5) and the database functions. If you find yourself editing
them for restaurant-specific reasons, that is a sign to add a config option instead.

Quick reference for the planned forks:

| Fork | `locales` | `defaultLocale` | `currency` | `timezone` |
|---|---|---|---|---|
| Zagreb fine dining | `['hr','en']` | `hr` | `EUR` | `Europe/Zagreb` |
| Adriatic konoba | `['hr','en','de']` | `hr` | `EUR` | `Europe/Zagreb` |
| Budapest bistro | `['hu','en']` | `hu` | `HUF` | `Europe/Budapest` |

---

### Photography and credits

All photography is in `public/images/photo` (dishes, room, wine) and `public/images/kitchen`
(stills from the restaurant's own film).

- **Freepik** (licensed through Magnific, free licence; attribution "Freepik" is in the footer):
  truffle pasta, beef stew, tuna tartare, octopus, oysters, panna cotta, rožata, chef plating
  (×2), wine (×2), dining room (×3), beef medallion.
- **Openverse, CC0 / public domain** (no attribution required): sourdough, burrata, gnocchi,
  kremšnita, langoustines.

Replace them with the restaurant's own photography before launch: real photos of real plates
sell a table better than any stock. Keep the file names, or update `content/images.ts` and the
menu item `image` paths, then run `npm run media:blur`.

**Fetching photos in CI.** If your development machine can't reach image hosts,
`.github/workflows/fetch-photos.yml` + `scripts/fetch-photos.mjs` can do it on GitHub Actions.
Commit a `.image-review/request.json` and the workflow commits the results back:

- `search` builds contact sheets of Openverse (CC0) candidates.
- `previews` builds labelled contact sheets from a list of preview URLs.
- `fetch` downloads chosen URLs at full size into `public/images`.
