import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  Linking,
  Modal,
  Platform,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { logout } from '../utils/storage';
import { isPremiumUser, toggleDebugPremium, getDebugPremiumStatus } from '../utils/premiumFeatures';
import Paywall from '../components/Paywall';
import TermsOfServiceScreen from './TermsOfServiceScreen';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../utils/themeContext';

type RootStackParamList = {
  Profile: undefined;
  BatchNotifications: undefined;
  // ... other routes
};

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

export default function ProfileScreen() {
  const [isPremium, setIsPremium] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [debugPremium, setDebugPremium] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { colors, isDarkMode, toggleTheme } = useTheme();

  useEffect(() => {
    checkPremiumStatus();
    loadDebugStatus();
  }, []);

  const checkPremiumStatus = async () => {
    const premium = await isPremiumUser();
    setIsPremium(premium);
  };

  const loadDebugStatus = async () => {
    const status = await getDebugPremiumStatus();
    setDebugPremium(status);
  };

  const handleToggleDebugPremium = async () => {
    const newStatus = await toggleDebugPremium();
    setDebugPremium(newStatus);
    await checkPremiumStatus();
    Alert.alert(
      'Debug Premium',
      `Premium features ${newStatus ? 'ENABLED' : 'DISABLED'} for testing`
    );
  };

  const handleUpgradeToPro = () => {
    setShowPaywall(true);
  };

  const handleCancelMembership = () => {
    Alert.alert(
      'Cancel Pro Membership',
      'To cancel your subscription, please visit your subscription settings:\n\n' +
      (Platform.OS === 'ios' 
        ? '• Open Settings app\n• Tap your name at the top\n• Tap Subscriptions\n• Select Friendo\n• Tap Cancel Subscription'
        : '• Open Google Play Store\n• Tap Menu → Subscriptions\n• Select Friendo\n• Tap Cancel Subscription'),
      [
        { text: 'OK', style: 'default' },
        {
          text: 'Open Settings',
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('https://apps.apple.com/account/subscriptions');
            } else {
              Linking.openURL('https://play.google.com/store/account/subscriptions');
            }
          }
        }
      ]
    );
  };

  const handleBatchNotifications = () => {
    if (isPremium) {
      navigation.navigate('BatchNotifications');
    } else {
      Alert.alert(
        'Premium Feature',
        'Batch notifications are available for Pro members. Upgrade to Pro to set up notifications for multiple friends at once!',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade to Pro', onPress: handleUpgradeToPro }
        ]
      );
    }
  };

  const handlePaywallSuccess = () => {
    setShowPaywall(false);
    checkPremiumStatus();
    Alert.alert('Welcome to Pro!', 'Thank you for supporting Friendo! 💜');
  };

  const handlePaywallClose = () => {
    setShowPaywall(false);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            const success = await logout();
            if (success) {
              (navigation as any).replace('Login');
            } else {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleDarkModeToggle = () => {
    if (!isPremium) {
      Alert.alert(
        'Premium Feature',
        'Dark mode is available for Pro members. Upgrade to Pro to enable dark mode!',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade to Pro', onPress: handleUpgradeToPro }
        ]
      );
    } else {
      toggleTheme();
    }
  };

  const handleSecretTap = () => {
    const now = Date.now();
    
    // Reset if more than 2 seconds between taps
    if (now - lastTapTime > 2000) {
      setTapCount(1);
    } else {
      setTapCount(tapCount + 1);
    }
    
    setLastTapTime(now);
    
    // 7 taps to access admin
    if (tapCount + 1 === 7) {
      setTapCount(0);
      (navigation as any).navigate('AdminLogin');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.purple} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Icon */}
        <View style={[styles.profileIconContainer, { backgroundColor: colors.cardBackground }]}>
          <View style={[styles.profileIcon, { backgroundColor: colors.purpleLight, borderColor: colors.purple }]}>
            <MaterialIcons name="person" size={60} color={colors.purple} />
          </View>
        </View>

        {/* Membership Section */}
        <View style={[styles.sectionContainer, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>MEMBERSHIP</Text>
          <View style={styles.membershipCard}>
            <Text style={[styles.currentTierLabel, { color: colors.textSecondary }]}>Current Tier</Text>
            <View style={[styles.tierBadge, { backgroundColor: isDarkMode ? colors.border : '#F0F0F0' }]}>
              <Text style={[styles.tierText, { color: colors.text }]}>{isPremium ? 'Premium' : 'Free'}</Text>
            </View>

            {!isPremium && (
              <TouchableOpacity style={[styles.upgradeButton, { backgroundColor: colors.purple }]} onPress={handleUpgradeToPro}>
                <Text style={styles.upgradeButtonText}>Upgrade to Pro</Text>
                <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}

            {isPremium && (
              <TouchableOpacity style={[styles.cancelButton, { backgroundColor: colors.cardBackground, borderColor: colors.red }]} onPress={handleCancelMembership}>
                <Text style={[styles.cancelButtonText, { color: colors.red }]}>Cancel Pro Membership</Text>
              </TouchableOpacity>
            )}

            {/* Debug Toggle Button (DEV only) */}
            {__DEV__ && (
              <TouchableOpacity 
                style={[styles.debugButton, { backgroundColor: colors.orange }]} 
                onPress={handleToggleDebugPremium}
              >
                <Text style={styles.debugButtonText}>
                  🧪 Debug: {debugPremium ? 'Premium ON' : 'Premium OFF'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Account Section */}
        <View style={[styles.sectionContainer, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>ACCOUNT</Text>
          
          {/* Dark Mode Toggle - Premium Only */}
          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomColor: colors.borderLight }]}
            onPress={handleDarkModeToggle}
          >
            <MaterialIcons 
              name="dark-mode" 
              size={24} 
              color={isPremium ? colors.purple : colors.textDisabled} 
            />
            <Text style={[
              styles.menuItemText,
              { color: isPremium ? colors.text : colors.textDisabled }
            ]}>
              Dark Mode
            </Text>
            <View style={styles.rightContainer}>
              {!isPremium && (
                <View style={[styles.premiumBadge, { backgroundColor: colors.purple }]}>
                  <Text style={styles.premiumBadgeText}>Pro</Text>
                </View>
              )}
              {isPremium && (
                <Switch
                  value={isDarkMode}
                  onValueChange={toggleTheme}
                  trackColor={{ false: colors.border, true: colors.purple }}
                  thumbColor={colors.white}
                  ios_backgroundColor={colors.border}
                />
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomColor: colors.borderLight }]} 
            onPress={handleBatchNotifications}
          >
            <MaterialCommunityIcons 
              name="bell-badge" 
              size={24} 
              color={isPremium ? colors.purple : colors.textDisabled} 
            />
            <Text style={[
              styles.menuItemText,
              { color: isPremium ? colors.text : colors.textDisabled }
            ]}>
              Batch Notifications
            </Text>
            <View style={styles.rightContainer}>
              {!isPremium && (
                <View style={[styles.premiumBadge, { backgroundColor: colors.purple }]}>
                  <Text style={styles.premiumBadgeText}>Pro</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.borderLight }]} onPress={handleLogout}>
            <MaterialIcons name="logout" size={24} color={colors.red} />
            <Text style={[styles.logoutText, { color: colors.red }]}>Log Out</Text>
          </TouchableOpacity>
        </View>

        {/* Legal Section */}
        <View style={[styles.sectionContainer, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>LEGAL</Text>
          
          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: colors.borderLight }]}
            onPress={() => Linking.openURL('https://www.privacypolicies.com/live/213b96d7-30cf-4a41-a182-38624ac19603')}
          >
            <MaterialCommunityIcons name="shield-check" size={24} color={colors.purple} />
            <Text style={[styles.menuItemText, { color: colors.text }]}>Privacy Policy</Text>
            <MaterialIcons name="chevron-right" size={24} color={colors.textDisabled} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: colors.borderLight }]}
            onPress={() => setShowTerms(true)}
          >
            <MaterialCommunityIcons name="file-document" size={24} color={colors.purple} />
            <Text style={[styles.menuItemText, { color: colors.text }]}>Terms of Service</Text>
            <MaterialIcons name="chevron-right" size={24} color={colors.textDisabled} />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={handleSecretTap} activeOpacity={1}>
            <Text style={[styles.versionText, { color: colors.textTertiary }]}>Friendo v1.0.0</Text>
          </TouchableOpacity>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Made with <Text style={styles.heartEmoji}>💜</Text> by Daniel Lango
          </Text>
          <Text style={[styles.footerSubtext, { color: colors.textTertiary }]}>
            (...during his freetime focusing on his personal hobby-project, Ambrozite Studios. Visit{' '}
            <Text
              style={[styles.linkText, { color: colors.purple }]}
              onPress={() => Linking.openURL('https://ambrozitestudios.com')}
            >
              ambrozitestudios.com
            </Text>{' '}
            to learn more about it.)
          </Text>
        </View>
      </ScrollView>

      {/* Paywall Modal */}
      <Modal
        visible={showPaywall}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handlePaywallClose}
      >
        <Paywall onSuccess={handlePaywallSuccess} onClose={handlePaywallClose} />
      </Modal>

      {/* Terms of Service Modal */}
      <Modal
        visible={showTerms}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTerms(false)}
      >
        <TermsOfServiceScreen onClose={() => setShowTerms(false)} />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
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
  content: {
    flex: 1,
  },
  profileIconContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  profileIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionContainer: {
    marginTop: 20,
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 20,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  membershipCard: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  currentTierLabel: {
    fontSize: 14,
    marginBottom: 10,
  },
  tierBadge: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  tierText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 25,
    gap: 8,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  debugButton: {
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 12,
  },
  debugButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cancelButton: {
    borderWidth: 2,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 15,
  },
  logoutText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 15,
    fontWeight: '500',
  },
  comingSoonBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  comingSoonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 30,
  },
  versionText: {
    fontSize: 14,
    marginBottom: 10,
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 5,
  },
  heartEmoji: {
    fontSize: 14,
  },
  footerSubtext: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  linkText: {
    textDecorationLine: 'underline',
  },
  premiumBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  premiumBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  rightContainer: {
    minWidth: 60,
    alignItems: 'flex-end',
    marginRight: 8,
  },
  badgeContainer: {
    height: 24,
    justifyContent: 'center',
    marginRight: 8,
  },
});
