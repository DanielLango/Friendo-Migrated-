# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Friendo is a React Native/Expo friendship tracking app that helps users maintain relationships through scheduled meetings and reminders. The app features Supabase for backend/auth, RevenueCat for premium subscriptions, and integrations with Calendar, Contacts, and Google Places.

**Tech Stack:**
- React Native 0.81.5 with Expo 54
- TypeScript 5.9.2
- Navigation: React Navigation (Stack Navigator)
- Backend: Supabase (PostgreSQL + Auth + Storage)
- Monetization: RevenueCat (react-native-purchases)
- State Management: React hooks only (no Redux/Zustand)

## Development Commands

```bash
# Start development server
npm start

# Run on specific platforms
npm run ios        # iOS simulator
npm run android    # Android emulator
npm run web        # Web browser

# Alternative with expo CLI
expo start
expo start --ios
expo start --android
expo start --web
```

**Note:** RevenueCat features require a development build - they will not work in Expo Go.

## Environment Setup

Required `.env.local` file (git-ignored):

```bash
EXPO_PUBLIC_SUPABASE_URL=https://cgchcwqtevbybjxibamz.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_...
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_...
```

## Architecture Overview

### Data Persistence Strategy

**Three-tier storage:**
1. **Supabase (Primary)** - PostgreSQL database for friends, meetings, user profiles
   - Tables: `friends`, `meetings`
   - Storage bucket: `profile-pictures`
   - Auth: Email/password via Supabase Auth

2. **AsyncStorage (Secondary)** - Local preferences and caching
   - Theme preferences (`theme-preference`)
   - Paywall display tracking (`lastPaywallShownDate`)
   - Premium status cache (5-minute TTL)
   - Skip flags for onboarding screens

3. **SecureStore (Credentials)** - Encrypted storage for sensitive data
   - Remember Me credentials (email/password)
   - iOS/Android only (AsyncStorage fallback for web)

**Convention:** Supabase uses snake_case (`friend_type`, `is_online`), TypeScript uses camelCase. The `utils/storage.ts` file handles conversion automatically.

### Navigation Structure

**Main Flow:**
```
LoginScreen
  → ReflectOnFriendsScreen (skippable)
  → AddFriendsScreen
  → MainScreen (hub)
    ├→ MeetingCreateScreen
    ├→ StatsScreen
    ├→ ProfileScreen
    │   └→ BatchNotificationsScreen (premium)
    ├→ ContactSelectScreen
    └→ ManualAddScreen
```

**Admin Flow:**
```
AdminLoginScreen
  → AdminDashboardScreen
    ├→ AdminAddVenueScreen
    └→ AdminEditVenueScreen
```

All screens are in the `screens/` directory. Navigation uses Stack Navigator from `@react-navigation/stack`.

### Core Data Models

**Friend:**
- Basic: id, name, email, friendType ('online'|'local'|'both'), city, source
- Notifications: notificationFrequency, notificationDays
- Premium: profilePictureUri, birthday, isFavorite
- Stored in Supabase `friends` table with `user_id` foreign key

**Meeting:**
- Fields: id, friendId, date, activity, venue, city, notes, status
- Status: 'scheduled' | 'met' | 'cancelled'
- Cancellation tracking (premium): cancelledBy field
- Legacy cancelled meetings: notes start with `[CANCELLED]`
- Stored in Supabase `meetings` table

### Premium Features

**Free Tier Limits:**
- Up to 50 friends
- Basic meeting tracking (green tokens for completed)
- Calendar integration
- Standard statistics

**Premium Features ($0.99/mo or $9.99/yr):**
- Cancellation tracking (pink/red tokens)
- Birthday reminders
- Profile pictures
- Unlimited friends
- Advanced statistics
- Custom themes

**Paywall Trigger:**
- Shows after 3 friends added AND 2 meetings scheduled
- Maximum once per calendar day
- Logic in `utils/paywallUtils.ts`

**Premium Check:**
```typescript
// Always use cached check for performance
import { isPremiumUser, hasFeatureAccess } from './utils/premiumFeatures';
const premium = await isPremiumUser(); // 5-min cache
const canAccess = await hasFeatureAccess('profile_pictures');
```

**Debug Mode:**
```typescript
// Dev only - toggle premium without purchase
import { toggleDebugPremium } from './utils/premiumFeatures';
toggleDebugPremium(); // Only works in __DEV__
```

### Key Utility Files

**`utils/storage.ts`** - Primary data access layer
- All friend/meeting CRUD operations
- User authentication (saveUser, isLoggedIn, logout)
- Handles Supabase + AsyncStorage
- Auto-converts between snake_case and camelCase

**`utils/themeContext.tsx`** - Theme management
- Global theme provider (wrap App in ThemeProvider)
- Light/dark mode with persistence
- Access via `const { colors, isDarkMode } = useTheme()`

**`utils/revenueCatConfig.ts`** - Subscription management
- `initializeRevenueCat(userId)` - Call on app start
- `checkPremiumStatus()` - Check 'pro' entitlement
- `getSubscriptionPackages()` - Fetch offerings
- `restorePurchases()` - Restore previous purchases

**`utils/notificationService.ts`** - Notification singleton
- `notificationService.initialize()` - Request permissions
- `scheduleNotification(friendId, name, delayInDays)` - Schedule reminder
- `cancelNotificationForFriend(friendId)` - Cancel reminder
- Platform check: Disabled on web

**`utils/calendarUtils.ts`** - Calendar integration
- `requestCalendarPermissions()` - Request access
- `createMeetingEvent(meeting)` - Add to device calendar
- `createAndDownloadMeetingICS(meeting)` - Export ICS file

**`utils/contactSyncUtils.ts`** - Contact import
- `syncPhoneContacts()` - Real phone contact import
- Social media syncs (Facebook, Instagram, WhatsApp, LinkedIn) are mock implementations

**`utils/imageUpload.ts`** - Profile picture uploads
- `uploadProfilePicture(uri, userId)` - Upload to Supabase Storage
- `deleteProfilePicture(url)` - Remove from storage
- Handles both legacy and new Expo FileSystem APIs

### Component Patterns

**Theme Usage:**
```typescript
import { useTheme } from '../utils/themeContext';
const { colors, isDarkMode } = useTheme();
<View style={{ backgroundColor: colors.background }} />
```

**Modal Pattern:**
```typescript
const [visible, setVisible] = useState(false);
<Modal visible={visible} onRequestClose={() => setVisible(false)}>
  <Component onClose={() => setVisible(false)} />
</Modal>
```

**Screen Focus Reload:**
```typescript
useEffect(() => {
  const unsubscribe = navigation.addListener('focus', () => {
    loadData();
  });
  return unsubscribe;
}, [navigation]);
```

**Platform-Specific Code:**
```typescript
import { Platform } from 'react-native';
if (Platform.OS === 'web') {
  // Web logic
} else {
  // Native iOS/Android logic
}
```

### Reusable Components

**High-Value Components:**
- `components/FriendRow.tsx` - Friend list item with meeting tokens, long-press actions
- `components/Paywall.tsx` - RevenueCat subscription modal
- `components/NotificationModal.tsx` - Notification frequency selector
- `components/PhotoUploadModal.tsx` - Image picker + Supabase upload
- `components/SimpleCitySelector.tsx` - Google Places autocomplete
- `components/BirthdaySettingsInline.tsx` - Premium birthday feature (inline editor)

All components accept theme colors dynamically via `useTheme()` hook.

### Error Handling Convention

**Standard try-catch pattern:**
```typescript
try {
  await operation();
} catch (error) {
  console.error('Context: operation name', error);
  Alert.alert('Error Title', error.message);
}
```

**Async operation with loading state:**
```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleAction = async () => {
  setLoading(true);
  setError(null);
  try {
    await operation();
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

## Testing & Deployment

### RevenueCat Testing

**iOS Sandbox Testing:**
1. Create sandbox tester in App Store Connect
2. Sign out of Apple ID on device
3. Sign in with sandbox account when prompted
4. Test purchases (see `docs/TESTING_CHECKLIST.md`)

**Android Testing:**
1. Add test users in Google Play Console
2. Build development version
3. Test with test account

**Product IDs:**
- Monthly: `fr_monthly_099`
- Yearly: `fr_yearly_999`

See `docs/REVENUECAT_SETUP.md` for full setup instructions.

### Important Testing Checklist

Before production launch, complete all items in `docs/TESTING_CHECKLIST.md`:
- Pre-testing setup (API keys, store connections)
- iOS sandbox testing
- Android testing
- Cross-platform purchase restoration
- Premium feature unlocking
- Subscription management
- Error handling
- Performance benchmarks

### Build Configuration

**Bundle IDs:**
- iOS: `dev.kiki.userapp.5660b894`
- Android: `dev.kiki.userapp.fggalije`

**EAS Build:**
Configuration exists in `eas.json` for production builds.

## Important Notes

### Meeting Token System

**Visual indicators on friend rows:**
- **Green tokens** - Completed meetings (default)
- **Pink tokens** - Rescheduled meetings (premium)
- **Red tokens** - Cancelled meetings (premium)

**Implementation:**
- Tokens are calculated from meeting history
- Cancelled meetings have notes starting with `[CANCELLED]` (legacy) or status='cancelled' (new)
- Year-based cleanup removes cancelled meetings after Dec 31

### Notification Scheduling

**Friend notification patterns:**
- Each friend has customizable notification frequency
- Options: days (custom), weekly, monthly
- Stored in AsyncStorage with key `notification_{friendId}`
- Rescheduled after each meeting completion

**Batch notifications:**
- Premium feature accessible via ProfileScreen
- Set up recurring reminders independent of individual friends
- Screen: `BatchNotificationsScreen`

### OAuth Integration Status

**Current:** Mock authentication only for social platforms (Facebook, Instagram, WhatsApp, LinkedIn)

**To enable real OAuth:** See `docs/OAUTH_SETUP.md` for:
- Google Cloud Console setup
- Facebook Developer setup
- Redirect URI configuration
- Environment variable updates

### Supabase Database Maintenance

**Cleanup utilities in `utils/dataRecovery.ts`:**
- `getDatabaseDiagnostics()` - Find orphaned meetings (meetings without friends)
- `cleanupOrphanedMeetings()` - Remove invalid meeting records

Run periodically or when data inconsistencies are suspected.

### Admin Features

**Venue management:**
- Admin-only screens for adding/editing venue options
- Separate authentication flow via AdminLoginScreen
- Admin credentials stored separately from user accounts
- Venues used in MeetingCreateScreen for activity selection

## Additional Documentation

- `docs/REVENUECAT_SETUP.md` - Complete RevenueCat configuration guide
- `docs/TESTING_CHECKLIST.md` - Pre-launch testing requirements
- `docs/PREMIUM_FEATURES.md` - Feature roadmap and implementation status
- `docs/OAUTH_SETUP.md` - Social media OAuth configuration
- `docs/CALENDAR_EMAIL_SETUP.md` - Calendar integration details
- `docs/GOOGLE_PLACES_SETUP.md` - Google Places API setup

## Development Workflow

1. **Environment:** Ensure `.env.local` has all required keys
2. **Database:** Verify Supabase connection with `utils/storage.ts` test
3. **Theme:** All new screens must use `useTheme()` for colors
4. **Premium features:** Gate with `hasFeatureAccess()` checks
5. **Platform support:** Test on iOS, Android, and web when using native features
6. **Error handling:** Always wrap Supabase/RevenueCat calls in try-catch
7. **Data persistence:** Use `utils/storage.ts` functions - never call Supabase directly from screens
