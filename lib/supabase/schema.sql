-- Supabase Schema for Restaurant Starter

-- Menu Categories
CREATE TABLE menu_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menu Categories Localizations (Translations)
CREATE TABLE menu_category_localizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES menu_categories(id) ON DELETE CASCADE,
  locale TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category_id, locale)
);

-- Menu Items
CREATE TABLE menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES menu_categories(id) ON DELETE CASCADE,
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_seasonal BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menu Item Localizations
CREATE TABLE menu_item_localizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  locale TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  dietary_info TEXT[], -- e.g. ['vegan', 'gluten-free']
  allergens TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(item_id, locale)
);

-- Booking Requests
CREATE TABLE booking_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  guests INTEGER NOT NULL,
  special_requests TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_category_localizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_localizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;

-- Public can read active menu items and categories
CREATE POLICY "Public can view active categories" ON menu_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view category translations" ON menu_category_localizations FOR SELECT USING (true);
CREATE POLICY "Public can view active items" ON menu_items FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view item translations" ON menu_item_localizations FOR SELECT USING (true);

-- Public can insert booking requests, but only view/update their own if they have the ID (or through an admin dashboard)
CREATE POLICY "Public can insert bookings" ON booking_requests FOR INSERT WITH CHECK (true);
-- For an MVP, typically we don't let public query all bookings. 
