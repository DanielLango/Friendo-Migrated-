import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useBasic } from '@basictech/expo';

interface BasicTechInterceptorProps {
  children: React.ReactNode;
}

export default function BasicTechInterceptor({ children }: BasicTechInterceptorProps) {
  const { signout } = useBasic();
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Only add web event listeners if we're on web
    if (typeof window !== 'undefined' && window.addEventListener) {
      const handleError = (event: any) => {
        const error = event.reason || event.error;
        if (error?.message?.includes('Failed to refresh token') ||
            error?.message?.includes('failed_to_get_token') ||
            error?.message?.includes('Bad Request')) {
          console.log('Token error caught, showing error screen');
          setHasError(true);
          if (event.preventDefault) {
            event.preventDefault();
          }
        }
      };

      window.addEventListener('unhandledrejection', handleError);
      window.addEventListener('error', handleError);
      
      return () => {
        window.removeEventListener('unhandledrejection', handleError);
        window.removeEventListener('error', handleError);
      };
    }
  }, []);

  if (hasError) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Authentication Error</Text>
        <Text style={styles.message}>Your session expired. Please sign out and back in.</Text>
        <TouchableOpacity style={styles.button} onPress={signout}>
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#8000FF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});