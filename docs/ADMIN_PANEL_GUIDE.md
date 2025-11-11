# Friendo Admin Panel Guide

## Overview
The Friendo app includes a hidden admin panel that allows you to manage partner venues. This panel is password-protected and only accessible through a secret gesture.

## Setup Instructions

### 1. Create the Database Table
1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Open the file `docs/SUPABASE_PARTNER_VENUES_SETUP.sql`
4. Copy and paste the SQL commands into the Supabase SQL Editor
5. Click "Run" to execute the commands
6. Verify the table was created by running the verification queries at the bottom of the SQL file

### 2. Set Your Admin Password
1. Open `utils/adminAuth.ts`
2. Find the line: `const ADMIN_PASSWORD = 'Friendo2025Admin!';`
3. Change this to your own secure password
4. **IMPORTANT**: Keep this password secret and secure!

### 3. Test the Admin Panel
1. Run your app
2. Navigate to the Profile screen
3. Tap the version number ("Friendo v1.0.0") **7 times quickly** (within 2 seconds between taps)
4. The Admin Login screen should appear
5. Enter your admin password
6. You should now see the Admin Dashboard

## How to Use the Admin Panel

### Accessing the Admin Panel
1. Go to Profile screen
2. Tap version number 7 times quickly
3. Enter admin password
4. Access granted for 1 hour

### Adding a Partner Venue
1. In the Admin Dashboard, tap "Add New Partner Venue"
2. Fill in the required fields:
   - **Venue Name** (required): e.g., "Joe's Pizza"
   - **City** (required): Select from the city list
   - **Category** (required): Select the venue type (restaurant, bar, cafe, etc.)
3. Fill in optional fields:
   - Address, phone, website
   - Rating (1-5 stars)
   - Price level (1-4 dollar signs)
4. Set partnership details:
   - **Partnership Level**: Basic, Premium, or Featured
   - **Featured Venue**: Toggle to highlight this venue
   - **Display Order**: Lower numbers appear first (0 = first)
   - **Special Offers**: Add up to 2 special offers for users
5. Tap "Add Partner Venue"
6. The venue is now live for all users!

### Editing a Venue
1. In the Admin Dashboard, find the venue you want to edit
2. Tap the purple edit icon (pencil)
3. Make your changes
4. Tap "Update Venue"
5. Changes are immediately reflected for all users

### Deleting a Venue
1. In the Admin Dashboard, find the venue you want to delete
2. Tap the red delete icon (trash)
3. Confirm the deletion
4. The venue is soft-deleted (hidden from users but kept in database)

### Understanding Partnership Levels
- **Basic**: Standard partner listing
- **Premium**: Enhanced visibility with special badge
- **Featured**: Top placement with star icon and special highlighting

### Display Order
- Venues are sorted by:
  1. Featured status (featured venues first)
  2. Display order (lower numbers first)
  3. Name (alphabetically)
- Use display order to manually control which venues appear first

## How It Works for Users

### User Experience
1. User creates a meeting
2. Selects a city (e.g., "New York, NY, USA")
3. Selects an activity type (e.g., "Restaurant")
4. Sees up to 3 partner venues for that city/category combination
5. Can select a partner venue or choose "Generic Restaurant"

### Data Isolation
- **User Data (Private)**: Each user's friends and meetings are private
  - You can't see other users' friends
  - Other users can't see your friends
  - Data is filtered by `user_id`
  
- **Partner Venues (Global)**: All users see the same venues
  - When you add a venue, ALL users see it
  - When you update a venue, changes appear for ALL users
  - No `user_id` - venues are shared across the entire app

### Example Scenario
1. **Day 1**: You add "Joe's Pizza" in New York as a partner
   - Minnesota user opens app → sees Joe's Pizza
   - California user opens app → sees Joe's Pizza
   
2. **Day 2**: Minnesota user adds their friend "Mike"
   - You DON'T see Mike
   - California user DOESN'T see Mike
   - Only Minnesota user sees Mike
   
3. **Day 3**: You update Joe's Pizza with a new special offer
   - Minnesota user sees the updated offer
   - California user sees the updated offer
   - Everyone sees the same venue data

## Security Features

### Password Protection
- Admin panel requires password to access
- Password is stored in the app code (change it in `utils/adminAuth.ts`)
- Session expires after 1 hour of inactivity

### Hidden Access
- No visible buttons or menu items
- Only accessible through secret 7-tap gesture
- Regular users won't discover it accidentally

### Database Security
- Row Level Security (RLS) enabled on Supabase
- Users can only read active venues
- Only authenticated users can modify venues
- Soft deletes preserve data history

## Tips and Best Practices

### Adding Venues
- Start with 1-3 venues per city/category
- Use clear, descriptive names
- Add special offers to make venues attractive
- Set appropriate partnership levels
- Use display order to feature your best partners

### Managing Venues
- Regularly review and update venue information
- Remove inactive or closed venues
- Update special offers seasonally
- Monitor which venues users select (future feature)

### Troubleshooting
- **Can't access admin panel**: Make sure you're tapping quickly (within 2 seconds)
- **Wrong password**: Check `utils/adminAuth.ts` for the correct password
- **Session expired**: Login again (sessions last 1 hour)
- **Venues not appearing**: Check that `is_active` is true in database
- **Changes not showing**: Refresh the app or check Supabase connection

## Future Enhancements
- Analytics dashboard showing venue selection rates
- Bulk import from CSV
- Venue categories management
- Partnership tier pricing
- User feedback on venues
- Automated venue verification

## Support
If you encounter any issues with the admin panel, check:
1. Supabase connection is working
2. Database table was created correctly
3. Admin password is correct
4. You're logged into the app
5. Session hasn't expired

---

**Remember**: The admin panel is a powerful tool. Use it responsibly to provide value to your users through quality partner venues!