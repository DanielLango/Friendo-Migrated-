import { Platform } from 'react-native';

export const checkNetworkConnectivity = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'web') {
      // For web, check if navigator.onLine is available
      if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
        return navigator.onLine;
      }
    }
    
    // Fallback: try to fetch a simple endpoint
    const response = await fetch('https://www.google.com/favicon.ico', {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-cache',
    });
    return true;
  } catch (error) {
    console.log('Network connectivity check failed:', error);
    return false;
  }
};

export const handleNetworkError = (error: any) => {
  console.error('Network Error Details:', {
    message: error?.message,
    name: error?.name,
    stack: error?.stack,
    cause: error?.cause,
  });
  
  if (error?.message?.includes('network error') || 
      error?.message?.includes('Network Error') ||
      error?.message?.includes('fetch') ||
      error?.name === 'NetworkError') {
    return {
      type: 'NETWORK_ERROR',
      message: 'Network connection failed. Please check your internet connection and try again.',
      action: 'RETRY'
    };
  }
  
  return {
    type: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred. Please try again.',
    action: 'RETRY'
  };
};