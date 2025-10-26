import AsyncStorage from '@react-native-async-storage/async-storage';

const PAYWALL_LAST_SHOWN_KEY = '@friendo_paywall_last_shown';

/**
 * Check if the paywall should be shown based on:
 * - Maximum once per calendar day
 */
export const shouldShowPaywall = async (): Promise<boolean> => {
  try {
    const lastShownStr = await AsyncStorage.getItem(PAYWALL_LAST_SHOWN_KEY);
    
    if (!lastShownStr) {
      return true; // Never shown before
    }

    const lastShownDate = new Date(lastShownStr);
    const today = new Date();
    
    // Check if it's a different calendar day
    const isDifferentDay = 
      lastShownDate.getFullYear() !== today.getFullYear() ||
      lastShownDate.getMonth() !== today.getMonth() ||
      lastShownDate.getDate() !== today.getDate();

    return isDifferentDay;
  } catch (error) {
    console.error('Error checking paywall status:', error);
    return false;
  }
};

/**
 * Mark that the paywall has been shown today
 */
export const markPaywallShown = async (): Promise<void> => {
  try {
    const today = new Date().toISOString();
    await AsyncStorage.setItem(PAYWALL_LAST_SHOWN_KEY, today);
  } catch (error) {
    console.error('Error marking paywall as shown:', error);
  }
};

/**
 * Reset paywall shown status (for testing)
 */
export const resetPaywallShown = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(PAYWALL_LAST_SHOWN_KEY);
  } catch (error) {
    console.error('Error resetting paywall status:', error);
  }
};
