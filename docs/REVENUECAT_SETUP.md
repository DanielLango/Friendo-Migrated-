# RevenueCat Setup Guide for Friendo

This guide will help you set up RevenueCat for in-app purchases in Friendo.

## 1. Create RevenueCat Account

1. Go to [RevenueCat](https://www.revenuecat.com/) and sign up
2. Create a new project called "Friendo"

## 2. Configure App Store Connect (iOS)

### Create In-App Purchases in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Select your Friendo app
3. Go to **Features** → **In-App Purchases**
4. Create two **Auto-Renewable Subscriptions**:

   **Monthly Subscription:**
   - Product ID: `fr_monthly_099`
   - Reference Name: `Friendo Premium Monthly`
   - Subscription Group: `Friendo Premium`
   - Duration: 1 Month
   - Price: $0.99

   **Yearly Subscription:**
   - Product ID: `fr_yearly_999`
   - Reference Name: `Friendo Premium Yearly`
   - Subscription Group: `Friendo Premium`
   - Duration: 1 Year
   - Price: $9.99

5. Fill in required metadata (descriptions, screenshots, etc.)

### Connect App Store to RevenueCat

1. In RevenueCat dashboard, go to your project
2. Click **Apps** → **Add App**
3. Select **iOS**
4. Enter your Bundle ID
5. Follow instructions to connect App Store Connect:
   - Generate App Store Connect API Key
   - Upload the key to RevenueCat

## 3. Configure Google Play Console (Android)

### Create In-App Products in Google Play Console

1. Go to [Google Play Console](https://play.google.com/console/)
2. Select your Friendo app
3. Go to **Monetize** → **Subscriptions**
4. Create two subscriptions:

   **Monthly Subscription:**
   - Product ID: `fr_monthly_099`
   - Name: `Friendo Premium Monthly`
   - Billing Period: 1 Month
   - Price: $0.99

   **Yearly Subscription:**
   - Product ID: `fr_yearly_999`
   - Name: `Friendo Premium Yearly`
   - Billing Period: 1 Year
   - Price: $9.99

### Connect Google Play to RevenueCat

1. In RevenueCat dashboard, go to your project
2. Click **Apps** → **Add App**
3. Select **Android**
4. Enter your Package Name
5. Follow instructions to connect Google Play:
   - Create service account in Google Cloud Console
   - Grant permissions in Google Play Console
   - Upload credentials to RevenueCat

## 4. Configure Entitlements in RevenueCat

1. In RevenueCat dashboard, go to **Entitlements**
2. Create an entitlement called `pro`
3. Go to **Offerings**
4. Create an offering called `default`
5. Add two packages to the offering:
   - **Monthly Package**: Link to `fr_monthly_099`
   - **Yearly Package**: Link to `fr_yearly_999`

## 5. Get API Keys

1. In RevenueCat dashboard, go to **Settings** → **API Keys**
2. Copy your public SDK keys:
   - **iOS**: Starts with `appl_`
   - **Android**: Starts with `goog_`

## 6. Add API Keys to Your App

Create a `.env.local` file in your project root (if it doesn't exist):

```bash
# RevenueCat API Keys
EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_YOUR_IOS_KEY_HERE
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_YOUR_ANDROID_KEY_HERE
```

**Important:** Never commit these keys to version control!

## 7. Testing

### Test on iOS

1. Create a Sandbox Tester account in App Store Connect
2. Sign out of your Apple ID on your test device
3. Build and run your app
4. When prompted, sign in with your Sandbox Tester account
5. Test purchasing subscriptions

### Test on Android

1. Add test users in Google Play Console
2. Build and run your app
3. Test purchasing subscriptions

### Test in Expo Go (Preview Only)

RevenueCat requires a development build and won't work in Expo Go. However, the paywall UI will still display for design preview.

## 8. Production Checklist

Before launching:

- [ ] Both iOS and Android subscriptions are approved
- [ ] RevenueCat is connected to both stores
- [ ] Entitlements and offerings are configured
- [ ] API keys are added to production environment
- [ ] Tested purchases on both platforms
- [ ] Tested restore purchases
- [ ] Privacy policy and terms of service are linked
- [ ] Subscription management instructions are clear

## 9. Monitoring

After launch, monitor:

1. **RevenueCat Dashboard**: Track subscriptions, revenue, churn
2. **App Store Connect**: Monitor subscription metrics
3. **Google Play Console**: Monitor subscription metrics

## Support

- [RevenueCat Documentation](https://docs.revenuecat.com/)
- [RevenueCat Community](https://community.revenuecat.com/)
- [App Store Connect Help](https://developer.apple.com/support/app-store-connect/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)