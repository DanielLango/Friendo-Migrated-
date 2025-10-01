import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useBasic } from '@basictech/expo';
import { clearAllAuthData, handleBasicTechError } from './authUtils';

interface AuthWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AuthWrapper({ children, fallback }: AuthWrapperProps) {
  const { isSignedIn, signout, isLoading } = useBasic();
  const [hasAuthError, setHasAuthError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Only add web event listeners if we're on web
    if (typeof window !== 'undefined' && window.addEventListener) {
      const handleUnhandledRejection = (event: any) => {
        const error = event.reason || event.detail?.reason;
        if (error?.message?.includes('Failed to refresh token') ||
            error?.message?.includes('failed_to_get_token') ||
            error?.message?.includes('Bad Request')) {
          
          console.error('Auth error caught by wrapper:', error);
          setHasAuthError(true);
          setErrorMessage('Your session has expired. Please clear your auth data and sign in again.');
        }
      };

      window.addEventListener('unhandledrejection', handleUnhandledRejection);
      return () => {
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      };
    }
  }, []);

  const handleClearAuthAndSignOut = async () => {
    try {
      await clearAllAuthData();
      await signout();
      setHasAuthError(false);
      setErrorMessage('');
    } catch (error) {
      console.error('Error clearing auth data:', error);
      Alert.alert('Notice', 'Please restart the app and try again.');
    }
  };

  const handleRetry = () => {
    setHasAuthError(false);
    setErrorMessage('');
  };

  if (hasAuthError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Authentication Error</Text>
        <Text style={styles.errorText}>{errorMessage}</Text>
        <TouchableOpacity 
          style={styles.clearAuthButton}
          onPress={handleClearAuthAndSignOut}
        >
          <Text style={styles.clearAuthButtonText}>Clear Auth Data & Sign Out</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={handleRetry}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!isSignedIn && !isLoading) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#FFFFFF',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  clearAuthButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginBottom: 15,
  },
  clearAuthButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  retryButton: {
    backgroundColor: '#8000FF',
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
