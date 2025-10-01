import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Linking,
} from 'react-native';
import { useBasic } from '@basictech/expo';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import FriendoLogo from '../components/FriendoLogo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { MaterialIcons } from '@expo/vector-icons';
import { checkNetworkConnectivity, handleNetworkError } from '../utils/networkUtils';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const { login, isLoading, isSignedIn, signout } = useBasic();
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [isClearing, setIsClearing] = React.useState(false);
  const [showTroubleshooting, setShowTroubleshooting] = React.useState(false);

  React.useEffect(() => {
    // Clear any problematic auth data on mount to prevent token refresh errors
    const clearAuthData = async () => {
      try {
        if (!isSignedIn) {
          await signout(); // This will clear any stored auth tokens
        }
      } catch (error) {
        console.log('Auth cleanup completed');
      }
    };
    
    clearAuthData();
  }, []);

  const clearAllAuthData = async () => {
    setIsClearing(true);
    try {
      // Clear AsyncStorage auth data
      await AsyncStorage.multiRemove([
        'basic_auth_token',
        'basic_refresh_token', 
        'basic_user_data',
        'basic_session',
        'skipReflectionScreen'
      ]);
      
      // Clear SecureStore auth data
      try {
        await SecureStore.deleteItemAsync('basic_auth_token');
        await SecureStore.deleteItemAsync('basic_refresh_token');
        await SecureStore.deleteItemAsync('basic_user_data');
        await SecureStore.deleteItemAsync('basic_session');
      } catch (secureError) {
        console.log('SecureStore clear completed');
      }
      
      // Force signout to clear any remaining state
      await signout();
      
      Alert.alert('Success', 'All authentication data cleared. You can now try logging in again.');
    } catch (error) {
      console.error('Error clearing auth data:', error);
      Alert.alert('Notice', 'Auth data clearing completed. Please try logging in again.');
    } finally {
      setIsClearing(false);
    }
  };

  React.useEffect(() => {
    const checkSkipReflection = async () => {
      if (isSignedIn) {
        try {
          const skipReflection = await AsyncStorage.getItem('skipReflectionScreen');
          if (skipReflection === 'true') {
            navigation.navigate('AddFriends');
          } else {
            navigation.navigate('ReflectOnFriends');
          }
        } catch (error) {
          console.error('Error checking reflection preference:', error);
          navigation.navigate('ReflectOnFriends');
        }
      }
    };

    checkSkipReflection();
  }, [isSignedIn, navigation]);

  const handleBasicTechLogin = async () => {
    try {
      // Check network connectivity first
      const isConnected = await checkNetworkConnectivity();
      if (!isConnected) {
        Alert.alert(
          'No Internet Connection',
          'Please check your internet connection and try again.',
          [{ text: 'OK' }]
        );
        return;
      }

      await login();
      // Navigation will happen via useEffect when isSignedIn changes
    } catch (error: any) {
      console.error('Login error:', error);
      
      const errorInfo = handleNetworkError(error);
      
      if (errorInfo.type === 'NETWORK_ERROR') {
        Alert.alert(
          'Connection Error', 
          errorInfo.message + ' If the problem persists, try clearing your auth data using the troubleshooting icon.',
          [{ text: 'OK' }]
        );
      } else if (error?.message?.includes('Failed to refresh token') ||
                 error?.message?.includes('failed_to_get_token')) {
        Alert.alert(
          'Authentication Error',
          'Your session has expired. Please clear your auth data using the troubleshooting icon and try again.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Login Error', 'Failed to sign in. Please try again.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Troubleshooting icon in top right corner */}
      <TouchableOpacity 
        style={styles.troubleshootIcon}
        onPress={() => setShowTroubleshooting(!showTroubleshooting)}
      >
        <MaterialIcons name="build" size={24} color="#666666" />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <FriendoLogo />
        </View>
        
        <Text style={styles.title}>Login to Friendo</Text>
        
        <Text style={styles.subtitle}>
          Sign in to start tracking your friendships
        </Text>
        
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={handleBasicTechLogin}
          disabled={isLoading}
        >
          <Text style={styles.loginButtonText}>
            {isLoading ? 'SIGNING IN...' : 'Sign in with basic.id'}
          </Text>
        </TouchableOpacity>

        {/* Troubleshooting section - only shown when icon is tapped */}
        {showTroubleshooting && (
          <View style={styles.troubleshootingContainer}>
            <Text style={styles.troubleshootingText}>
              In case you experience any authentication or login errors or bugs, please press here:
            </Text>
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={clearAllAuthData}
              disabled={isClearing || isLoading}
            >
              <Text style={styles.clearButtonText}>
                {isClearing ? 'CLEARING...' : 'Clear Auth Data & Retry'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.footerText}>
          Friendo uses basic.id to keep your data secure and under your control. You can revoke access at any time.
        </Text>

        <TouchableOpacity 
          style={styles.privacyButton}
          onPress={() => Linking.openURL('https://www.privacypolicies.com/live/213b96d7-30cf-4a41-a182-38624ac19603')}
        >
          <Text style={styles.privacyButtonText}>
            Click Here to Read our Privacy Policy
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  troubleshootIcon: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666666',
    lineHeight: 22,
  },
  loginButton: {
    backgroundColor: '#EC4899',
    borderRadius: 8,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  troubleshootingContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  troubleshootingText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 20,
  },
  clearButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 6,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  footerText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  privacyButton: {
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  privacyButtonText: {
    color: '#007AFF',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
