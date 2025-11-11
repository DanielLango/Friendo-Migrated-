import AsyncStorage from '@react-native-async-storage/async-storage';

const ADMIN_PAYWALL_KEY = '@friendo_admin_paywall_trigger';
const USER_BASELINE_KEY = '@friendo_user_friend_baseline';

export interface PaywallTriggerConfig {
  enabled: boolean;
  friendsUntilPaywall: number; // N more friends until paywall
  baselineFriendCount: number; // Friend count when this was activated
}

// Admin functions
export const setPaywallTrigger = async (friendsUntilPaywall: number): Promise<boolean> => {
  try {
    const config: PaywallTriggerConfig = {
      enabled: true,
      friendsUntilPaywall,
      baselineFriendCount: 0, // Will be set when user adds next friend
    };
    await AsyncStorage.setItem(ADMIN_PAYWALL_KEY, JSON.stringify(config));
    console.log(`✅ Paywall trigger set: ${friendsUntilPaywall} more friends`);
    return true;
  } catch (error) {
    console.error('Error setting paywall trigger:', error);
    return false;
  }
};

export const disablePaywallTrigger = async (): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(ADMIN_PAYWALL_KEY);
    await AsyncStorage.removeItem(USER_BASELINE_KEY);
    console.log('✅ Paywall trigger disabled');
    return true;
  } catch (error) {
    console.error('Error disabling paywall trigger:', error);
    return false;
  }
};

export const getPaywallTriggerConfig = async (): Promise<PaywallTriggerConfig | null> => {
  try {
    const configStr = await AsyncStorage.getItem(ADMIN_PAYWALL_KEY);
    if (!configStr) return null;
    return JSON.parse(configStr);
  } catch (error) {
    console.error('Error getting paywall trigger config:', error);
    return null;
  }
};

// User-facing functions
export const setUserBaseline = async (currentFriendCount: number): Promise<void> => {
  try {
    const config = await getPaywallTriggerConfig();
    if (!config || !config.enabled) return;
    
    // Only set baseline if not already set
    const existingBaseline = await AsyncStorage.getItem(USER_BASELINE_KEY);
    if (!existingBaseline) {
      await AsyncStorage.setItem(USER_BASELINE_KEY, currentFriendCount.toString());
      console.log(`📊 User baseline set: ${currentFriendCount} friends`);
    }
  } catch (error) {
    console.error('Error setting user baseline:', error);
  }
};

export const shouldTriggerPaywall = async (currentFriendCount: number): Promise<boolean> => {
  try {
    const config = await getPaywallTriggerConfig();
    if (!config || !config.enabled) return false;
    
    const baselineStr = await AsyncStorage.getItem(USER_BASELINE_KEY);
    if (!baselineStr) {
      // First time checking, set baseline
      await setUserBaseline(currentFriendCount);
      return false;
    }
    
    const baseline = parseInt(baselineStr, 10);
    const friendsAdded = currentFriendCount - baseline;
    
    console.log(`📊 Paywall check: baseline=${baseline}, current=${currentFriendCount}, added=${friendsAdded}, trigger=${config.friendsUntilPaywall}`);
    
    return friendsAdded >= config.friendsUntilPaywall;
  } catch (error) {
    console.error('Error checking paywall trigger:', error);
    return false;
  }
};

export const resetUserBaseline = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(USER_BASELINE_KEY);
    console.log('✅ User baseline reset');
  } catch (error) {
    console.error('Error resetting user baseline:', error);
  }
};