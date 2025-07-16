import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useBasic } from '@basictech/expo';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const { login, isLoading, isSignedIn } = useBasic();
  const navigation = useNavigation<LoginScreenNavigationProp>();

  React.useEffect(() => {
    if (isSignedIn) {
      navigation.navigate('ReflectOnFriends');
    }
  }, [isSignedIn, navigation]);

  const handleBasicTechLogin = async () => {
    try {
      await login();
      // Navigation will happen via useEffect when isSignedIn changes
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Error', 'Failed to sign in. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
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

        <Text style={styles.footerText}>
          Friendo uses basic.id to keep your data secure and under your control. You can revoke access at any time.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
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
  footerText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
});