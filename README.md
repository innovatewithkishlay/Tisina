# Kyro European Restaurant Starter

This is a reusable, production-quality Next.js starter repository designed specifically for Kyro Studio to rapidly create MVPs for European restaurants (Zagreb fine-dining, Adriatic konobas, Budapest bistros, etc.).

It is designed to be forked for each new restaurant and customized. The architecture provides the technical foundation (i18n, booking, menu structure, Supabase), so you only need to change configuration, styling, and data.

## 1. What the starter is
A scalable MVP foundation for restaurant websites. It prioritizes SEO, mobile-first design, Next.js App Router features, and European localizations (multiple languages, European date/time formats, EUR currency by default).

## 2. Tech Stack
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (v4)
- **Database / Backend:** Supabase (PostgreSQL)
- **i18n:** next-intl

## 3. Local Development

1. Fork/clone the repository.
2. Run `npm install`.
3. Create `.env.local` by copying `.env.example`.
4. Run `npm run dev`.
5. Access at `http://localhost:3000`.

## 4. Supabase Setup & 5. Environment Variables

Create a project on [Supabase](https://supabase.com/).
Get your URL and Anon Key, then add them to `.env.local`:
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 6. Database Setup & 7. Seed Data

The schema is defined in `lib/supabase/schema.sql`.
Run this SQL in your Supabase SQL Editor. It creates tables for:
- Menu Categories
- Menu Items
- Localizations for items and categories
- Booking Requests

You can use the Supabase dashboard to insert your initial seed data.

## How to Create a New Restaurant from this Starter

This is the most important workflow for Kyro Studio developers.

1. **Fork the Repository** into a new project (e.g., `restaurant-adriatic`).
2. **Update Configuration:** Open `config/restaurant.ts`. Change the name, tagline, address, contacts, and SEO data.
3. **Configure Locales:** Open `config/locales.ts` and set the supported languages (e.g., `['hr', 'en', 'de']`). Update translations in the `messages/` folder.
4. **Setup Database:** Create a new Supabase project for this specific restaurant.
5. **Apply Styling:** Modify `app/globals.css` variables to match the restaurant's visual identity.
6. **Deploy:** Deploy the new repository to Vercel.

## 8. Adding a New Restaurant
Change the `restaurantConfig` in `config/restaurant.ts`.

## 9. Adding a New Language
1. Add the locale code to `locales` in `config/locales.ts`.
2. Create a new JSON file in `messages/` (e.g., `de.json`).
3. Update `config/restaurant.ts` with localized strings for SEO, description, and tagline.

## 10. Adding Menu Items
Add items directly into your Supabase database using the `menu_categories`, `menu_items`, and their respective localization tables. The UI will automatically fetch active items.

## 11. Configuring Opening Hours
Presently handled by configuration or static UI. You can add an `opening_hours` table in Supabase or extend `config/restaurant.ts`.

## 12. Configuring Booking
The starter includes a `booking_requests` table schema. You can build a booking form in Next.js that inserts rows into this table. Set `bookingEnabled: true` in `config/restaurant.ts`.

## 13. SEO Configuration, 14. hreflang, & 15. Structured Data
SEO is handled via `generateMetadata` in `layout.tsx` and `page.tsx`. `next-intl` can be configured to emit proper canonical and hreflang links based on the active locales.
Structured Data (JSON-LD) for LocalBusiness should be added to the `<head>` in `RootLayout`.

## 16. Deployment
Deploy to Vercel. Ensure you add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to your Vercel Environment Variables.

## 17. Performance Testing & 18. Lighthouse Testing
The starter aims for 90+ on Lighthouse. Always use Next.js `<Image>` components and ensure proper responsive sizes (`sizes="(max-width: 768px) 100vw, 50vw"`). Run `npm run build` and `npm run start`, then use Chrome DevTools Lighthouse to test performance locally.
