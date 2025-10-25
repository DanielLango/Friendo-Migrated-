import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import FriendoLogo from '../components/FriendoLogo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveUser, isLoggedIn, getRememberMeCredentials } from '../utils/storage';
import { Ionicons } from '@expo/vector-icons';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [rememberMe, setRememberMe] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);

  // Check if user is already logged in on mount
  React.useEffect(() => {
    checkExistingAuth();
  }, []);

  const checkExistingAuth = async () => {
    try {
      // First check if user has an active session
      const loggedIn = await isLoggedIn();
      if (loggedIn) {
        // User is already logged in, navigate to appropriate screen
        const skipReflection = await AsyncStorage.getItem('skipReflectionScreen');
        if (skipReflection === 'true') {
          navigation.replace('AddFriends');
        } else {
          navigation.replace('ReflectOnFriends');
        }
        return;
      }

      // If not logged in, check for saved credentials
      const credentials = await getRememberMeCredentials();
      if (credentials) {
        setEmail(credentials.email);
        setPassword(credentials.password);
        setRememberMe(true);
        
        // Auto-login with saved credentials
        setIsLoading(true);
        const success = await saveUser(credentials.email, credentials.password, true);
        if (success) {
          const skipReflection = await AsyncStorage.getItem('skipReflectionScreen');
          if (skipReflection === 'true') {
            navigation.replace('AddFriends');
          } else {
            navigation.replace('ReflectOnFriends');
          }
        } else {
          // If auto-login fails, just show the login form with pre-filled credentials
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      const success = await saveUser(email, password, rememberMe);
      if (success) {
        const skipReflection = await AsyncStorage.getItem('skipReflectionScreen');
        if (skipReflection === 'true') {
          navigation.replace('AddFriends');
        } else {
          navigation.replace('ReflectOnFriends');
        }
      } else {
        Alert.alert('Error', 'Failed to sign in. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Error', 'Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading screen while checking auth
  if (isCheckingAuth) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
          <FriendoLogo />
          <ActivityIndicator size="large" color="#EC4899" style={{ marginTop: 20 }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <FriendoLogo />
        </View>
        
        <Text style={styles.title}>Login to Friendo</Text>
        
        <Text style={styles.subtitle}>
          Sign in to start tracking your friendships
        </Text>
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999999"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!isLoading}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!isLoading}
        />

        {/* Remember Me Checkbox */}
        <TouchableOpacity 
          style={styles.rememberMeContainer}
          onPress={() => setRememberMe(!rememberMe)}
          disabled={isLoading}
        >
          <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
            {rememberMe && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
          </View>
          <Text style={styles.rememberMeText}>Remember me</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.loginButtonText}>
            {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
          </Text>
        </TouchableOpacity>

        {/* Supabase Security Message */}
        <View style={styles.securityBadge}>
          <Ionicons name="shield-checkmark" size={20} color="#10B981" />
          <Text style={styles.securityText}>
            The app uses Supabase that protects your data — secure and compliant.
          </Text>
        </View>

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
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    height: 50,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 5,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#EC4899',
    borderColor: '#EC4899',
  },
  rememberMeText: {
    fontSize: 15,
    color: '#333333',
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#8000FF',
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
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  securityText: {
    flex: 1,
    fontSize: 13,
    color: '#065F46',
    lineHeight: 18,
    marginLeft: 10,
    fontWeight: '500',
  },
  privacyButton: {
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
