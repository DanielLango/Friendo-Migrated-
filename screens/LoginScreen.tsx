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
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import FriendoLogo from '../components/FriendoLogo';
import { useBasic } from '@basictech/expo';
import AsyncStorage from '@react-native-async-storage/async-storage';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { isSignedIn, login, isLoading, user } = useBasic();
  const [showTroubleshooting, setShowTroubleshooting] = React.useState(false);

  React.useEffect(() => {
    if (isSignedIn && user) {
      // User is signed in, navigate to the appropriate screen
      checkNavigationDestination();
    }
  }, [isSignedIn, user]);

  const checkNavigationDestination = async () => {
    try {
      const skipReflection = await AsyncStorage.getItem('skipReflectionScreen');
      if (skipReflection === 'true') {
        navigation.navigate('AddFriends');
      } else {
        navigation.navigate('ReflectOnFriends');
      }
    } catch (error) {
      console.error('Error checking navigation destination:', error);
      navigation.navigate('ReflectOnFriends');
    }
  };

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Error', 'Failed to sign in. Please try again.');
    }
  };

  const clearAllData = async () => {
    try {
      await AsyncStorage.clear();
      Alert.alert('Success', 'All data cleared.');
    } catch (error) {
      Alert.alert('Error', 'Failed to clear data.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity 
        style={styles.troubleshootIcon}
        onPress={() => setShowTroubleshooting(!showTroubleshooting)}
      >
        <Text style={styles.troubleshootText}>troubleshooting</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        {!showTroubleshooting && (
          <>
            <View style={styles.logoContainer}>
              <FriendoLogo />
            </View>
            
            <Text style={styles.title}>Login to Friendo</Text>
            
            <Text style={styles.subtitle}>
              Sign in to start tracking your friendships
            </Text>
            
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? 'SIGNING IN...' : 'Sign in with basic.id'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.privacyDescription}>
              Friendo uses basic.id to keep your data secure and under your control. You can revoke access at any time.
            </Text>

            <TouchableOpacity 
              style={styles.privacyButton}
              onPress={() => Linking.openURL('https://basic.tech/privacy')}
            >
              <Text style={styles.privacyButtonText}>
                Click Here to Read our Privacy Policy
              </Text>
            </TouchableOpacity>
          </>
        )}

        {showTroubleshooting && (
          <View style={styles.troubleshootingContainer}>
            <Text style={styles.troubleshootingTitle}>Troubleshooting</Text>
            
            <Text style={styles.troubleshootingText}>
              If you're experiencing login issues, try clearing your data.
            </Text>
            
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={clearAllData}
            >
              <Text style={styles.clearButtonText}>
                Clear All Data
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => setShowTroubleshooting(false)}
            >
              <Text style={styles.backButtonText}>← Back to Login</Text>
            </TouchableOpacity>
          </View>
        )}
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
  troubleshootText: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
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
  privacyDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666666',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  troubleshootingContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  troubleshootingTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333333',
  },
  troubleshootingText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  clearButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    height: 50,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  privacyButton: {
    marginTop: 10,
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
