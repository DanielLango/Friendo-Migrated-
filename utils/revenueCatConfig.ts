import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';

/**
 * RevenueCat Configuration
 * 
 * IMPORTANT: Replace these with your actual RevenueCat API keys from:
 * https://app.revenuecat.com/settings/api-keys
 * 
 * You need:
 * - iOS: Apple App Store API Key (starts with appl_)
 * - Android: Google Play Store API Key (starts with goog_)
 */

const REVENUECAT_API_KEYS = {
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || 'appl_YOUR_IOS_KEY_HERE',
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY || 'goog_YOUR_ANDROID_KEY_HERE',
};

let isConfigured = false;

/**
 * Initialize RevenueCat SDK
 * Call this once when your app starts
 */
export const initializeRevenueCat = async (userId?: string): Promise<boolean> => {
  if (isConfigured) {
    console.log('RevenueCat already configured');
    return true;
  }

  try {
    const apiKey = Platform.select(REVENUECAT_API_KEYS);
    
    if (!apiKey || apiKey.includes('YOUR_') || apiKey.includes('_KEY_HERE')) {
      console.warn('⚠️ RevenueCat API keys not configured. Using test mode.');
      return false;
    }

    // Set log level (use DEBUG during development, INFO in production)
    Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.INFO);

    // Configure the SDK
    Purchases.configure({ 
      apiKey,
      appUserID: userId, // Optional: pass user ID for cross-platform purchases
    });

    isConfigured = true;
    console.log('✅ RevenueCat initialized successfully');
    return true;
  } catch (error: any) {
    console.error('❌ Failed to initialize RevenueCat:', error.message);
    // This is expected in Expo Go
    if (error.message?.includes('Expo Go')) {
      console.log('💡 RevenueCat requires a development build. Running in preview mode.');
    }
    return false;
  }
};

/**
 * Check if user has active premium subscription
 */
export const checkPremiumStatus = async (): Promise<boolean> => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const isPro = customerInfo.entitlements.active['pro'] !== undefined;
    console.log(`Premium status: ${isPro ? 'ACTIVE' : 'INACTIVE'}`);
    return isPro;
  } catch (error: any) {
    console.error('Error checking premium status:', error.message);
    return false;
  }
};

/**
 * Get available subscription packages
 */
export const getSubscriptionPackages = async () => {
  try {
    const offerings = await Purchases.getOfferings();
    const current = offerings.current;
    
    if (!current || current.availablePackages.length === 0) {
      console.warn('No offerings available');
      return [];
    }

    // Sort packages: ANNUAL first, then MONTHLY
    const packages = current.availablePackages.sort((a, b) => 
      a.packageType === 'ANNUAL' ? -1 : 1
    );

    return packages;
  } catch (error: any) {
    console.error('Error fetching packages:', error.message);
    return [];
  }
};

/**
 * Restore previous purchases
 */
export const restorePurchases = async (): Promise<boolean> => {
  try {
    const customerInfo = await Purchases.restorePurchases();
    const isPro = customerInfo.entitlements.active['pro'] !== undefined;
    return isPro;
  } catch (error: any) {
    console.error('Error restoring purchases:', error.message);
    throw error;
  }
};