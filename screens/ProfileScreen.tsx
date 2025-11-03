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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { logout } from '../utils/storage';
import { isPremiumUser, toggleDebugPremium, getDebugPremiumStatus } from '../utils/premiumFeatures';
import Paywall from '../components/Paywall';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Profile: undefined;
  BatchNotifications: undefined;
  // ... other routes
};

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

export default function ProfileScreen() {
  const [isPremium, setIsPremium] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [debugPremium, setDebugPremium] = useState(false);
  const navigation = useNavigation<ProfileScreenNavigationProp>();

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
    Alert.alert(
      'Coming Soon',
      'Batch notifications feature is coming soon! This will allow Pro members to set up notifications for multiple friends at once.',
      [{ text: 'OK' }]
    );
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#8000FF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Icon */}
        <View style={styles.profileIconContainer}>
          <View style={styles.profileIcon}>
            <MaterialIcons name="person" size={60} color="#8000FF" />
          </View>
        </View>

        {/* Membership Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>MEMBERSHIP</Text>
          <View style={styles.membershipCard}>
            <Text style={styles.currentTierLabel}>Current Tier</Text>
            <View style={styles.tierBadge}>
              <Text style={styles.tierText}>{isPremium ? 'Premium' : 'Free'}</Text>
            </View>

            {!isPremium && (
              <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgradeToPro}>
                <Text style={styles.upgradeButtonText}>Upgrade to Pro</Text>
                <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}

            {isPremium && (
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancelMembership}>
                <Text style={styles.cancelButtonText}>Cancel Pro Membership</Text>
              </TouchableOpacity>
            )}

            {/* Debug Toggle Button (DEV only) */}
            {__DEV__ && (
              <TouchableOpacity 
                style={styles.debugButton} 
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
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>
          
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={handleBatchNotifications}
          >
            <MaterialCommunityIcons 
              name="bell-badge" 
              size={24} 
              color={isPremium ? "#8000FF" : "#CCCCCC"} 
            />
            <Text style={[
              styles.menuItemText,
              !isPremium && styles.menuItemTextDisabled
            ]}>
              Batch Notifications
            </Text>
            {!isPremium && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumBadgeText}>Pro</Text>
              </View>
            )}
            <MaterialIcons name="chevron-right" size={24} color="#CCCCCC" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <MaterialIcons name="logout" size={24} color="#EF4444" />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>

        {/* Legal Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>LEGAL</Text>
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Linking.openURL('https://www.privacypolicies.com/live/213b96d7-30cf-4a41-a182-38624ac19603')}
          >
            <MaterialCommunityIcons name="shield-check" size={24} color="#8000FF" />
            <Text style={styles.menuItemText}>Privacy Policy</Text>
            <MaterialIcons name="chevron-right" size={24} color="#CCCCCC" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Alert.alert('Coming Soon', 'Terms of Service will be available soon.')}
          >
            <MaterialCommunityIcons name="file-document" size={24} color="#8000FF" />
            <Text style={styles.menuItemText}>Terms of Service</Text>
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>Coming Soon</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>Friendo v1.0.0</Text>
          <Text style={styles.footerText}>
            Made with <Text style={styles.heartEmoji}>💜</Text> by Daniel Lango
          </Text>
          <Text style={styles.footerSubtext}>
            (...during his freetime focusing on his personal hobby-project, Ambrozite Studios. Visit{' '}
            <Text
              style={styles.linkText}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
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
    backgroundColor: '#FFFFFF',
  },
  profileIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0E6FF',
    borderWidth: 3,
    borderColor: '#8000FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionContainer: {
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999999',
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
    color: '#666666',
    marginBottom: 10,
  },
  tierBadge: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  tierText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  upgradeButton: {
    backgroundColor: '#8000FF',
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
    backgroundColor: '#F97316',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    marginLeft: 15,
  },
  menuItemTextDisabled: {
    color: '#CCCCCC',
  },
  logoutText: {
    flex: 1,
    fontSize: 16,
    color: '#EF4444',
    marginLeft: 15,
    fontWeight: '500',
  },
  clearMeetingsText: {
    flex: 1,
    fontSize: 16,
    color: '#F97316',
    marginLeft: 15,
    fontWeight: '500',
  },
  comingSoonBadge: {
    backgroundColor: '#FFF7ED',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  comingSoonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F97316',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 30,
  },
  versionText: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 10,
  },
  footerText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 5,
  },
  heartEmoji: {
    fontSize: 14,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  linkText: {
    color: '#8000FF',
    textDecorationLine: 'underline',
  },
  premiumBadge: {
    backgroundColor: '#8000FF',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginLeft: 'auto',
    marginRight: 8,
  },
  premiumBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
