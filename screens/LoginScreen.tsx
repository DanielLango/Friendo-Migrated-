import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useBasic } from '@basictech/expo';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { authenticateWithGoogle, authenticateWithFacebook } from '../utils/authUtils';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);
  
  const { login, isLoading, isSignedIn } = useBasic();
  const navigation = useNavigation<LoginScreenNavigationProp>();

  React.useEffect(() => {
    if (isSignedIn) {
      navigation.navigate('Onboarding');
    }
  }, [isSignedIn, navigation]);

  const handleBasicTechLogin = async () => {
    try {
      await login();
      // If login succeeds, navigation will happen via useEffect
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Error', 'Failed to sign in. Please try again.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      const user = await authenticateWithGoogle();
      
      if (user) {
        Alert.alert(
          'Google Login Successful!',
          `Welcome ${user.name}!\n\nEmail: ${user.email}`,
          [
            {
              text: 'Continue',
              onPress: () => {
                // Here you would typically integrate with your backend
                // For now, we'll proceed to onboarding
                navigation.navigate('Onboarding');
              }
            }
          ]
        );
      } else {
        Alert.alert('Login Cancelled', 'Google login was cancelled or failed.');
      }
    } catch (error) {
      console.error('Google login error:', error);
      Alert.alert(
        'Google Login Error',
        'Failed to authenticate with Google. Please check your internet connection and try again.'
      );
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      setIsFacebookLoading(true);
      const user = await authenticateWithFacebook();
      
      if (user) {
        Alert.alert(
          'Facebook Login Successful!',
          `Welcome ${user.name}!\n\nEmail: ${user.email}`,
          [
            {
              text: 'Continue',
              onPress: () => {
                navigation.navigate('Onboarding');
              }
            }
          ]
        );
      } else {
        Alert.alert('Login Cancelled', 'Facebook login was cancelled or failed.');
      }
    } catch (error) {
      console.error('Facebook login error:', error);
      Alert.alert(
        'Facebook Login Error',
        'Failed to authenticate with Facebook. Please try again.'
      );
    } finally {
      setIsFacebookLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>LOGIN</Text>
        
        <Text style={styles.subtitle}>
          Please sign in to use the Friendo app
        </Text>
        
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>📧</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Text>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.checkboxContainer}
          onPress={() => setRememberMe(!rememberMe)}
        >
          <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
            {rememberMe && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>Remember me</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.loginButton}
          onPress={handleBasicTechLogin}
          disabled={isLoading}
        >
          <Text style={styles.loginButtonText}>
            {isLoading ? 'SIGNING IN...' : 'SIGN IN WITH BASIC TECH'}
          </Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.socialContainer}>
          <TouchableOpacity 
            style={[styles.socialButton, isGoogleLoading && styles.socialButtonDisabled]}
            onPress={handleGoogleLogin}
            disabled={isGoogleLoading}
          >
            <Text style={styles.socialIcon}>🔍</Text>
            <Text style={styles.socialText}>
              {isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.socialButton, isFacebookLoading && styles.socialButtonDisabled]}
            onPress={handleFacebookLogin}
            disabled={isFacebookLoading}
          >
            <Text style={styles.socialIcon}>📘</Text>
            <Text style={styles.socialText}>
              {isFacebookLoading ? 'Connecting to Facebook...' : 'Continue with Facebook'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.signupContainer}>
          <Text style={styles.signupText}>
            Not a member? <Text style={styles.signupLink}>Sign up now</Text>
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
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 50,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
  },
  eyeIcon: {
    padding: 5,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#FF0080',
    borderRadius: 4,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#FF0080',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#666666',
  },
  loginButton: {
    backgroundColor: '#FF0080',
    borderRadius: 8,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#666666',
    fontSize: 14,
  },
  socialContainer: {
    marginBottom: 30,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    height: 50,
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  socialButtonDisabled: {
    opacity: 0.6,
    backgroundColor: '#F5F5F5',
  },
  socialIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  socialText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  signupContainer: {
    alignItems: 'center',
  },
  signupText: {
    fontSize: 16,
    color: '#666666',
  },
  signupLink: {
    color: '#FF0080',
    fontWeight: 'bold',
  },
});
