# Quick Start: Admin Panel

## 🚀 Get Started in 5 Minutes

### 1. Run This SQL in Supabase (2 minutes)

Open your Supabase SQL Editor and run this:

```sql
-- Create the partner_venues table
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
  special_offers TEXT[],
  rating DECIMAL(2,1),
  price_level INTEGER CHECK (price_level BETWEEN 1 AND 4),
  added_date TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_partner_venues_city_category ON partner_venues(city, category);
CREATE INDEX IF NOT EXISTS idx_partner_venues_active ON partner_venues(is_active);

-- Enable Row Level Security
ALTER TABLE partner_venues ENABLE ROW LEVEL SECURITY;

-- Anyone can read active venues
CREATE POLICY "Anyone can view active partner venues"
  ON partner_venues FOR SELECT
  USING (is_active = true);

-- Authenticated users can manage venues
CREATE POLICY "Authenticated users can manage partner venues"
  ON partner_venues FOR ALL
  USING (auth.role() = 'authenticated');
```

### 2. Set Your Password (1 minute)

Open `utils/adminAuth.ts` and change line 3:

```typescript
const ADMIN_PASSWORD = 'YourSecurePassword123!'; // ← Change this!
```

### 3. Access Admin Panel (1 minute)

1. Open app → Profile screen
2. Tap "Friendo v1.0.0" **7 times quickly**
3. Enter your password
4. You're in! 🎉

### 4. Add Your First Venue (1 minute)

1. Tap "Add New Partner Venue"
2. Fill in:
   - Name: "Joe's Pizza"
   - City: Select "New York, NY, USA"
   - Category: Select "Restaurant"
3. Tap "Add Partner Venue"
4. Done! It's now live for all users.

## That's It!

You now have a fully functional admin panel. All users will see the venues you add when they create meetings in those cities/categories.

## What's Next?

- Add more venues in different cities
- Set special offers to attract users
- Use featured venues for premium partners
- Edit or delete venues anytime

## Remember

- **Secret Access**: 7 taps on version number
- **Password**: Set in `utils/adminAuth.ts`
- **Session**: Lasts 1 hour
- **Global Data**: All users see your venues
- **Private Data**: Users' friends stay private

---

For detailed instructions, see `docs/ADMIN_PANEL_GUIDE.md`