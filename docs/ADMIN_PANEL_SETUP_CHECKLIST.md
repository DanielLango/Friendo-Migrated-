# Admin Panel Setup Checklist

Follow these steps to get your admin panel up and running:

## ✅ Step 1: Create the Database Table
- [ ] Open Supabase dashboard
- [ ] Navigate to SQL Editor
- [ ] Copy SQL from `docs/SUPABASE_PARTNER_VENUES_SETUP.sql`
- [ ] Paste into SQL Editor
- [ ] Click "Run"
- [ ] Verify table creation with verification queries

## ✅ Step 2: Set Your Admin Password
- [ ] Open `utils/adminAuth.ts`
- [ ] Change `ADMIN_PASSWORD` to your secure password
- [ ] Save the file
- [ ] Remember your password (write it down securely!)

## ✅ Step 3: Test Access
- [ ] Run the app
- [ ] Go to Profile screen
- [ ] Tap version number 7 times quickly
- [ ] Admin Login screen appears
- [ ] Enter your password
- [ ] Admin Dashboard loads successfully

## ✅ Step 4: Add Your First Venue
- [ ] Tap "Add New Partner Venue"
- [ ] Fill in required fields (Name, City, Category)
- [ ] Add optional details (address, phone, website, etc.)
- [ ] Set partnership level and special offers
- [ ] Tap "Add Partner Venue"
- [ ] Verify venue appears in dashboard

## ✅ Step 5: Test User Experience
- [ ] Logout from admin panel
- [ ] Go to Main screen
- [ ] Tap "Schedule Next Meeting"
- [ ] Select the city where you added a venue
- [ ] Select the category you added
- [ ] Verify your partner venue appears
- [ ] Test selecting the venue
- [ ] Create a test meeting

## 🎉 You're All Set!

Your admin panel is now fully functional. You can:
- Add partner venues anytime
- Edit existing venues
- Delete venues (soft delete)
- See stats about your venues
- All changes appear instantly for all users

## Quick Reference

### Access Admin Panel
1. Profile screen
2. Tap version number 7 times
3. Enter password

### Admin Password Location
`utils/adminAuth.ts` → Line 3

### Database Table
`partner_venues` in Supabase

### Session Duration
1 hour (auto-logout after inactivity)

## Need Help?
Refer to `docs/ADMIN_PANEL_GUIDE.md` for detailed instructions.