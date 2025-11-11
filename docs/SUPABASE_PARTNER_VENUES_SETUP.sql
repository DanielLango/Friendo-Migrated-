-- ============================================
-- FRIENDO PARTNER VENUES DATABASE SETUP
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- This creates the partner_venues table for the admin panel

-- Create partner_venues table
CREATE TABLE IF NOT EXISTS partner_venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  website TEXT,
  is_partner BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  partnership_level TEXT CHECK (partnership_level IN ('basic', 'premium', 'featured')) DEFAULT 'basic',
  special_offers TEXT[], -- Array of strings for multiple offers
  rating DECIMAL(2,1), -- e.g., 4.5
  price_level INTEGER CHECK (price_level BETWEEN 1 AND 4), -- 1-4 dollar signs
  added_date TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true, -- To soft-delete venues
  display_order INTEGER DEFAULT 0, -- For manual ordering
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_partner_venues_city_category ON partner_venues(city, category);
CREATE INDEX IF NOT EXISTS idx_partner_venues_active ON partner_venues(is_active);
CREATE INDEX IF NOT EXISTS idx_partner_venues_featured ON partner_venues(is_featured);

-- Enable Row Level Security
ALTER TABLE partner_venues ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active partner venues
CREATE POLICY "Anyone can view active partner venues"
  ON partner_venues
  FOR SELECT
  USING (is_active = true);

-- Policy: Authenticated users can manage venues (you as admin)
CREATE POLICY "Authenticated users can manage partner venues"
  ON partner_venues
  FOR ALL
  USING (auth.role() = 'authenticated');

-- ============================================
-- EXAMPLE: Add some test venues
-- ============================================
-- Uncomment and modify these to add test venues

/*
INSERT INTO partner_venues (
  name, category, city, address, phone, website,
  partnership_level, special_offers, rating, price_level, is_featured, display_order
) VALUES
  (
    'Joe''s Pizza',
    'restaurant',
    'New York, NY, USA',
    '123 Broadway, New York, NY 10001',
    '(212) 555-0123',
    'https://joespizza.com',
    'premium',
    ARRAY['10% off for Friendo users', 'Free drink with large pizza'],
    4.5,
    2,
    true,
    1
  ),
  (
    'The Italian Place',
    'restaurant',
    'New York, NY, USA',
    '456 Main St, New York, NY 10002',
    '(212) 555-0456',
    'https://italianplace.com',
    'basic',
    ARRAY['Happy hour 4-6 PM'],
    4.2,
    2,
    false,
    2
  ),
  (
    'Fancy Dining',
    'restaurant',
    'New York, NY, USA',
    '789 5th Ave, New York, NY 10003',
    '(212) 555-0789',
    'https://fancydining.com',
    'featured',
    ARRAY['Free dessert with Friendo code', 'Priority seating'],
    4.8,
    3,
    true,
    0
  );
*/

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify the table was created correctly

-- Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'partner_venues'
ORDER BY ordinal_position;

-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'partner_venues';

-- Count venues (should be 0 initially, or 3 if you ran the example inserts)
SELECT COUNT(*) as total_venues FROM partner_venues;