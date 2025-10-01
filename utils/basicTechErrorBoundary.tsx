import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { clearAllAuthData } from './authUtils';

interface BasicTechErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface BasicTechErrorBoundaryProps {
  children: React.ReactNode;
  onSignOut?: () => void;
}

export class BasicTechErrorBoundary extends React.Component<
  BasicTechErrorBoundaryProps,
  BasicTechErrorBoundaryState
> {
  constructor(props: BasicTechErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): BasicTechErrorBoundaryState {
    // Check if it's a BasicTech authentication error
    if (error?.message?.includes('Failed to refresh token') ||
        error?.message?.includes('failed_to_get_token') ||
        error?.message?.includes('Bad Request')) {
      return { hasError: true, error };
    }
    
    // For other errors, don't catch them here
    throw error;
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('BasicTech Error Boundary caught error:', error);
    console.error('Error Info:', errorInfo);
  }

  handleClearAuthAndSignOut = async () => {
    try {
      await clearAllAuthData();
      if (this.props.onSignOut) {
        this.props.onSignOut();
      }
      this.setState({ hasError: false, error: undefined });
    } catch (error) {
      console.error('Error clearing auth data:', error);
      Alert.alert('Notice', 'Please restart the app and try again.');
    }
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Authentication Error</Text>
          <Text style={styles.errorText}>
            Your session has expired. Please clear your authentication data and sign in again.
          </Text>
          <TouchableOpacity 
            style={styles.clearAuthButton}
            onPress={this.handleClearAuthAndSignOut}
          >
            <Text style={styles.clearAuthButtonText}>Clear Auth Data & Sign Out</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={this.handleRetry}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return <>{this.props.children}</>;
  }
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