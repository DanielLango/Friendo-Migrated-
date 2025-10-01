import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export const clearAllAuthData = async () => {
  try {
    // Clear AsyncStorage auth data
    const asyncStorageKeys = [
      'basic_auth_token',
      'basic_refresh_token', 
      'basic_user_data',
      'basic_session',
      'basic_project_id',
      '@basic_auth_token',
      '@basic_refresh_token',
      '@basic_user_data',
      '@basic_session'
    ];
    
    await AsyncStorage.multiRemove(asyncStorageKeys);
    
    // Clear SecureStore auth data
    const secureStoreKeys = [
      'basic_auth_token',
      'basic_refresh_token',
      'basic_user_data',
      'basic_session',
      'basic_project_id'
    ];
    
    for (const key of secureStoreKeys) {
      try {
        await SecureStore.deleteItemAsync(key);
      } catch (error) {
        // Key might not exist, continue
        console.log(`SecureStore key ${key} cleared or didn't exist`);
      }
    }
    
    console.log('All authentication data cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing auth data:', error);
    return false;
  }
};

export const handleBasicTechError = (error: any) => {
  console.error('Basic Tech Error:', error);
  
  if (error?.message?.includes('Failed to refresh token') || 
      error?.message?.includes('failed_to_get_token') ||
      error?.message?.includes('Bad Request')) {
    return {
      type: 'TOKEN_ERROR',
      message: 'Authentication session expired. Please clear auth data and sign in again.',
      action: 'CLEAR_AND_RETRY'
    };
  }
  
  return {
    type: 'GENERAL_ERROR',
    message: 'An error occurred. Please try again.',
    action: 'RETRY'
  };
};