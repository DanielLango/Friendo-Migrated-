import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkPremiumStatus } from './revenueCatConfig';

const PREMIUM_STATUS_KEY = '@friendo_premium_status';
const PREMIUM_CHECK_TIMESTAMP = '@friendo_premium_check_time';
const DEBUG_PREMIUM_KEY = '@friendo_debug_premium'; // Debug toggle key

// Cache premium status for 5 minutes to reduce API calls
const CACHE_DURATION = 5 * 60 * 1000;

/**
 * Check if user has premium access (with caching)
 */
export const isPremiumUser = async (): Promise<boolean> => {
  try {
    // Check debug mode first (for testing only)
    if (__DEV__) {
      const debugPremium = await AsyncStorage.getItem(DEBUG_PREMIUM_KEY);
      if (debugPremium === 'true') {
        return true;
      }
    }

    // Check cache first
    const cachedStatus = await AsyncStorage.getItem(PREMIUM_STATUS_KEY);
    const cachedTime = await AsyncStorage.getItem(PREMIUM_CHECK_TIMESTAMP);
    
    if (cachedStatus && cachedTime) {
      const timeSinceCheck = Date.now() - parseInt(cachedTime, 10);
      if (timeSinceCheck < CACHE_DURATION) {
        return cachedStatus === 'true';
      }
    }

    // Check with RevenueCat
    const isPremium = await checkPremiumStatus();
    
    // Update cache
    await AsyncStorage.setItem(PREMIUM_STATUS_KEY, isPremium.toString());
    await AsyncStorage.setItem(PREMIUM_CHECK_TIMESTAMP, Date.now().toString());
    
    return isPremium;
  } catch (error) {
    console.error('Error checking premium status:', error);
    // Return cached value if available
    const cachedStatus = await AsyncStorage.getItem(PREMIUM_STATUS_KEY);
    return cachedStatus === 'true';
  }
};

/**
 * Toggle debug premium mode (DEV only)
 */
export const toggleDebugPremium = async (): Promise<boolean> => {
  if (!__DEV__) return false;
  
  const current = await AsyncStorage.getItem(DEBUG_PREMIUM_KEY);
  const newValue = current === 'true' ? 'false' : 'true';
  await AsyncStorage.setItem(DEBUG_PREMIUM_KEY, newValue);
  
  // Clear cache to force refresh
  await clearPremiumCache();
  
  return newValue === 'true';
};

/**
 * Get debug premium status (DEV only)
 */
export const getDebugPremiumStatus = async (): Promise<boolean> => {
  if (!__DEV__) return false;
  const status = await AsyncStorage.getItem(DEBUG_PREMIUM_KEY);
  return status === 'true';
};

/**
 * Clear premium status cache (call after purchase/restore)
 */
export const clearPremiumCache = async (): Promise<void> => {
  await AsyncStorage.removeItem(PREMIUM_STATUS_KEY);
  await AsyncStorage.removeItem(PREMIUM_CHECK_TIMESTAMP);
};

/**
 * Premium features list
 */
export const PREMIUM_FEATURES = {
  CANCELLATION_TRACKING: 'cancellation_tracking',
  BIRTHDAY_REMINDERS: 'birthday_reminders',
  PROFILE_PICTURES: 'profile_pictures',
  UNLIMITED_FRIENDS: 'unlimited_friends',
  ADVANCED_STATS: 'advanced_stats',
  CUSTOM_THEMES: 'custom_themes',
} as const;

/**
 * Check if a specific feature is available
 */
export const hasFeatureAccess = async (feature: string): Promise<boolean> => {
  // For now, all premium features require premium subscription
  return await isPremiumUser();
};
