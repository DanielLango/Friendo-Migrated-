import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFriends, getMeetings } from './storage';

const PAYWALL_SHOWN_KEY = '@friendo_paywall_shown';

/**
 * Check if the paywall should be shown based on:
 * - At least 3 friends added
 * - At least 2 meetings scheduled
 * - Paywall hasn't been shown before
 */
export const shouldShowPaywall = async (): Promise<boolean> => {
  try {
    // Check if paywall has already been shown
    const hasShown = await AsyncStorage.getItem(PAYWALL_SHOWN_KEY);
    if (hasShown === 'true') {
      return false;
    }

    // Check friend count
    const friends = await getFriends();
    if (friends.length < 3) {
      return false;
    }

    // Check meeting count
    const meetings = await getMeetings();
    if (meetings.length < 2) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking paywall status:', error);
    return false;
  }
};

/**
 * Mark that the paywall has been shown
 */
export const markPaywallShown = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(PAYWALL_SHOWN_KEY, 'true');
  } catch (error) {
    console.error('Error marking paywall as shown:', error);
  }
};

/**
 * Reset paywall shown status (for testing)
 */
export const resetPaywallShown = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(PAYWALL_SHOWN_KEY);
  } catch (error) {
    console.error('Error resetting paywall status:', error);
  }
};