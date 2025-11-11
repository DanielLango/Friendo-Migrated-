import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { verifyAdminPassword, createAdminSession } from '../utils/adminAuth';
import { useTheme } from '../utils/themeContext';

export default function AdminLoginScreen() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const { colors } = useTheme();

  const handleLogin = async () => {
    if (!password) {
      Alert.alert('Error', 'Please enter the admin password');
      return;
    }

    setLoading(true);

    // Simulate a small delay for security
    setTimeout(async () => {
      const isValid = verifyAdminPassword(password);

      if (isValid) {
        await createAdminSession();
        setLoading(false);
        (navigation as any).replace('AdminDashboard');
      } else {
        setLoading(false);
        Alert.alert('Access Denied', 'Invalid admin password');
        setPassword('');
      }
    }, 500);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={colors.purple} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Admin Access</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.formContainer}>
          <View style={[styles.iconContainer, { backgroundColor: colors.purpleLight }]}>
            <MaterialIcons name="admin-panel-settings" size={60} color={colors.purple} />
          </View>

          <Text style={[styles.title, { color: colors.text }]}>Admin Panel</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Enter your admin password to manage partner venues
          </Text>

          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.cardBackground, 
              borderColor: colors.border,
              color: colors.text 
            }]}
            placeholder="Admin Password"
            placeholderTextColor={colors.textTertiary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            onSubmitEditing={handleLogin}
          />

          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: colors.purple }]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Verifying...' : 'Access Admin Panel'}
            </Text>
          </TouchableOpacity>

          <View style={[styles.warningBox, { 
            backgroundColor: colors.isDarkMode ? 'rgba(245, 124, 0, 0.2)' : '#FFF9E6',
            borderColor: colors.orange 
          }]}>
            <MaterialIcons name="warning" size={20} color={colors.orange} />
            <Text style={[styles.warningText, { color: colors.text }]}>
              This area is restricted to authorized administrators only
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 34,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 60,
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    marginBottom: 20,
  },
  loginButton: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 30,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});