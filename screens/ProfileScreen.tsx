import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Linking,
  Modal,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { logout } from '../utils/storage';
import { isPremiumUser } from '../utils/premiumFeatures';
import Paywall from '../components/Paywall';

const PURPLE = '#8000FF';
const DARK = '#0F1222';
const MUTED = '#606276';
const LIGHT_BG = '#F8F9FA';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [membershipTier, setMembershipTier] = useState<'Free' | 'Pro'>('Free');
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    checkMembership();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      checkMembership();
    });
    return unsubscribe;
  }, [navigation]);

  const checkMembership = async () => {
    const isPremium = await isPremiumUser();
    setMembershipTier(isPremium ? 'Pro' : 'Free');
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            (navigation as any).navigate('Login');
          },
        },
      ]
    );
  };

  const handleMembershipPress = () => {
    if (membershipTier === 'Free') {
      setShowPaywall(true);
    } else {
      Alert.alert(
        'Premium Member 🎉',
        'You\'re already a premium member! Thank you for supporting Friendo.',
        [{ text: 'Awesome!' }]
      );
    }
  };

  const handlePaywallSuccess = async () => {
    setShowPaywall(false);
    await checkMembership();
    Alert.alert(
      'Welcome to Premium! 🎉',
      'Thank you for supporting Friendo! You now have access to all premium features.',
      [{ text: 'Awesome!', style: 'default' }]
    );
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://www.privacypolicies.com/live/213b96d7-30cf-4a41-a182-38624ac19603');
  };

  const handleTermsOfService = () => {
    Alert.alert('Coming Soon', 'Terms of Service will be available soon.');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Paywall Modal */}
      <Modal
        visible={showPaywall}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPaywall(false)}
      >
        <Paywall 
          onSuccess={handlePaywallSuccess}
          onClose={() => setShowPaywall(false)}
        />
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={PURPLE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Profile Icon */}
        <View style={styles.profileIconContainer}>
          <View style={styles.profileIcon}>
            <Ionicons name="person" size={48} color={PURPLE} />
          </View>
        </View>

        {/* Membership Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Membership</Text>
          
          <View style={styles.membershipCard}>
            <View style={styles.membershipHeader}>
              <View style={styles.membershipInfo}>
                <Text style={styles.membershipLabel}>Current Tier</Text>
                <View style={styles.tierBadgeContainer}>
                  <View style={[
                    styles.tierBadge,
                    membershipTier === 'Pro' && styles.tierBadgePro
                  ]}>
                    <Text style={[
                      styles.tierBadgeText,
                      membershipTier === 'Pro' && styles.tierBadgeTextPro
                    ]}>
                      {membershipTier}
                    </Text>
                  </View>
                  {membershipTier === 'Pro' && (
                    <Ionicons name="star" size={16} color="#FFD700" style={styles.starIcon} />
                  )}
                </View>
              </View>
            </View>
            
            {membershipTier === 'Free' && (
              <View style={styles.upgradePrompt}>
                <TouchableOpacity 
                  style={styles.upgradeButton}
                  onPress={handleMembershipPress}
                  activeOpacity={0.8}
                >
                  <Text style={styles.upgradeButtonText}>
                    Upgrade to Pro
                  </Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleLogout}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIconContainer}>
                <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
              </View>
              <Text style={[styles.menuItemText, styles.logoutText]}>Log Out</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Legal Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handlePrivacyPolicy}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIconContainer}>
                <Ionicons name="shield-checkmark-outline" size={20} color={PURPLE} />
              </View>
              <Text style={styles.menuItemText}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={MUTED} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleTermsOfService}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIconContainer}>
                <Ionicons name="document-text-outline" size={20} color={PURPLE} />
              </View>
              <Text style={styles.menuItemText}>Terms of Service</Text>
            </View>
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>Coming Soon</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>Friendo v1.0.0</Text>
          <Text style={styles.appInfoText}>Made with 💜 by Ambrozi Studios</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: DARK,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  profileIconContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  profileIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3EDFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: PURPLE,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: MUTED,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  membershipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  membershipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  membershipInfo: {
    flex: 1,
  },
  membershipLabel: {
    fontSize: 14,
    color: MUTED,
    marginBottom: 8,
  },
  tierBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tierBadge: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tierBadgePro: {
    backgroundColor: '#F3EDFF',
  },
  tierBadgeText: {
    fontSize: 18,
    fontWeight: '800',
    color: DARK,
  },
  tierBadgeTextPro: {
    color: PURPLE,
  },
  starIcon: {
    marginLeft: 8,
  },
  upgradePrompt: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  upgradeButton: {
    backgroundColor: PURPLE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 25,
    gap: 8,
    shadowColor: PURPLE,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  upgradeButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: DARK,
  },
  logoutText: {
    color: '#FF3B30',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 4,
  },
  comingSoonBadge: {
    backgroundColor: '#FFF4E6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  comingSoonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F59E0B',
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 32,
    paddingHorizontal: 20,
  },
  appInfoText: {
    fontSize: 12,
    color: MUTED,
    marginBottom: 4,
  },
});
