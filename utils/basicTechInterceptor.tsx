import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useBasic } from '@basictech/expo';
import { clearAllAuthData } from './authUtils';

interface BasicTechInterceptorProps {
  children: React.ReactNode;
}

export default function BasicTechInterceptor({ children }: BasicTechInterceptorProps) {
  const { isSignedIn, signout, isLoading } = useBasic();
  const [hasTokenError, setHasTokenError] = useState(false);
  const [errorCount, setErrorCount] = useState(0);

  // Global error handler for unhandled promise rejections
  useEffect(() => {
    const handleUnhandledRejection = (event: any) => {
      const error = event.reason || event.detail?.reason;
      if (error?.message?.includes('Failed to refresh token') ||
          error?.message?.includes('failed_to_get_token') ||
          error?.message?.includes('Bad Request')) {
        
        console.error('Unhandled token error caught:', error);
        setErrorCount(prev => prev + 1);
        setHasTokenError(true);
        
        // Prevent the error from propagating
        if (event.preventDefault) {
          event.preventDefault();
        }
      }
    };

    const handleError = (event: any) => {
      const error = event.error || event.detail?.error;
      if (error?.message?.includes('Failed to refresh token') ||
          error?.message?.includes('failed_to_get_token') ||
          error?.message?.includes('Bad Request')) {
        
        console.error('Unhandled error caught:', error);
        setErrorCount(prev => prev + 1);
        setHasTokenError(true);
        
        // Prevent the error from propagating
        if (event.preventDefault) {
          event.preventDefault();
        }
      }
    };

    // Add event listeners for different environments
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', handleUnhandledRejection);
      window.addEventListener('error', handleError);
      return () => {
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        window.removeEventListener('error', handleError);
      };
    }
  }, []);

  const handleClearAuthAndRestart = async () => {
    try {
      console.log('Clearing auth data and restarting...');
      await clearAllAuthData();
      await signout();
      setHasTokenError(false);
      setErrorCount(0);
      
      // Force a complete app refresh
      if (typeof window !== 'undefined' && window.location) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error during auth clear:', error);
      Alert.alert(
        'Manual Restart Required', 
        'Please close and reopen the app to complete the reset.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleRetry = () => {
    setHasTokenError(false);
    // Don't reset error count - let it accumulate
  };

  // Show error screen if we have token errors
  if (hasTokenError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>🔐</Text>
        <Text style={styles.errorTitle}>Authentication Session Expired</Text>
        <Text style={styles.errorText}>
          Your login session has expired and needs to be refreshed. This happens occasionally with the authentication system.
        </Text>
        
        {errorCount > 1 && (
          <Text style={styles.errorCount}>
            Error occurred {errorCount} times - clearing auth data is recommended.
          </Text>
        )}
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={handleClearAuthAndRestart}
          >
            <Text style={styles.clearButtonText}>
              Clear Auth Data & Restart
            </Text>
          </TouchableOpacity>
          
          {errorCount <= 2 && (
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={handleRetry}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <Text style={styles.helpText}>
          If this keeps happening, try signing out completely and signing back in.
        </Text>
      </View>
    );
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
  errorIcon: {
    fontSize: 64,
    marginBottom: 20,
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
    marginBottom: 20,
  },
  errorCount: {
    fontSize: 14,
    color: '#FF8C00',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  clearButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  retryButton: {
    backgroundColor: '#8000FF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  helpText: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
});