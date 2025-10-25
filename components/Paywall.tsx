import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Purchases, { PurchasesOffering } from 'react-native-purchases';
import { isPremiumUser } from '../utils/premiumFeatures';

const PURPLE = '#8000FF';
const DARK = '#0F1222';
const MUTED = '#606276';
const LIGHT_BG = '#F8F9FA';

interface PaywallProps {
  onSuccess: () => void;
  onClose: () => void;
}

export default function Paywall({ onSuccess, onClose }: PaywallProps) {
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [isAlreadyPremium, setIsAlreadyPremium] = useState(false);

  useEffect(() => {
    checkPremiumStatus();
    fetchOfferings();
  }, []);

  const checkPremiumStatus = async () => {
    const isPremium = await isPremiumUser();
    setIsAlreadyPremium(isPremium);
  };

  const fetchOfferings = async () => {
    try {
      const offerings = await Purchases.getOfferings();
      if (offerings.current) {
        setOfferings(offerings.current);
      }
    } catch (error) {
      console.error('Error fetching offerings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!offerings) return;

    setPurchasing(true);
    try {
      const packageToPurchase = selectedPlan === 'monthly' 
        ? offerings.monthly 
        : offerings.annual;

      if (!packageToPurchase) {
        Alert.alert('Error', 'Selected plan is not available');
        return;
      }

      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      
      if (customerInfo.entitlements.active['pro']) {
        onSuccess();
      }
    } catch (error: any) {
      if (!error.userCancelled) {
        Alert.alert('Purchase Error', error.message);
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    try {
      const customerInfo = await Purchases.restorePurchases();
      if (customerInfo.entitlements.active['pro']) {
        Alert.alert('Success', 'Your purchase has been restored!');
        onSuccess();
      } else {
        Alert.alert('No Purchases', 'No active subscriptions found.');
      }
    } catch (error: any) {
      Alert.alert('Restore Error', error.message);
    }
  };

  const handleCancel = async () => {
    Alert.alert(
      'Cancel Subscription',
      'To cancel your subscription, please go to your account settings in the App Store or Google Play.',
      [
        { text: 'OK', style: 'default' },
        { 
          text: 'Open Settings', 
          onPress: () => {
            // This will open the subscription management page
            Linking.openURL('https://apps.apple.com/account/subscriptions');
          }
        }
      ]
    );
  };

  const handleAboutFriendo = () => {
    Alert.alert(
      'About Friendo',
      'Friendo helps you stay connected with the people who matter most. Built with love by Daniel Lango.',
      [{ text: 'OK' }]
    );
  };

  const handleTermsAndPrivacy = () => {
    Linking.openURL('https://www.privacypolicies.com/live/213b96d7-30cf-4a41-a182-38624ac19603');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PURPLE} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={DARK} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Headline */}
        <Text style={styles.headline}>
          Please support me and the mission by signing up for the pro version.
        </Text>

        {/* Description */}
        <Text style={styles.description}>
          Friendo brings friends together. I'm a one-person studio building this with love. 
          If you believe in the mission, your support keeps the lights on and helps more friends connect.
        </Text>

        {/* Features */}
        <View style={styles.features}>
          <View style={styles.featureRow}>
            <Ionicons name="star" size={24} color={PURPLE} />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>See who cancelled</Text>
              <Text style={styles.featureDescription}>
                Track cancellations with color-coded tokens.
              </Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            <Ionicons name="star" size={24} color={PURPLE} />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Historic friendship</Text>
              <Text style={styles.featureDescription}>
                View past years' data and friendship archives.
              </Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            <Ionicons name="star" size={24} color={PURPLE} />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Profile pictures & birthdays</Text>
              <Text style={styles.featureDescription}>
                Upload photos and get birthday reminders.
              </Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            <Ionicons name="star" size={24} color={PURPLE} />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Batch reminders</Text>
              <Text style={styles.featureDescription}>
                Weekly digest of friends you haven't connected with.
              </Text>
            </View>
          </View>

          {/* Bonus Features */}
          <View style={styles.bonusFeatures}>
            <Text style={styles.bonusFeaturesText}>
              <Text style={styles.bonusFeaturesLabel}>Plus: </Text>
              Dark mode, mark friends as favorites, unlimited friends (up to 1000), 
              potential restaurant coupons, and more!
            </Text>
          </View>
        </View>

        {/* Plan Selection */}
        <Text style={styles.sectionTitle}>Select a plan</Text>

        <View style={styles.plansContainer}>
          {/* Monthly Plan */}
          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPlan === 'monthly' && styles.planCardSelected,
            ]}
            onPress={() => setSelectedPlan('monthly')}
          >
            <View style={styles.planHeader}>
              <Text style={styles.planType}>MONTHLY</Text>
              <View style={[
                styles.radioButton,
                selectedPlan === 'monthly' && styles.radioButtonSelected
              ]}>
                {selectedPlan === 'monthly' && (
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                )}
              </View>
            </View>
            <Text style={styles.planPrice}>$0.99/mo</Text>
            <Text style={styles.planSubtext}>Flexibility</Text>
          </TouchableOpacity>

          {/* Yearly Plan */}
          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPlan === 'yearly' && styles.planCardSelected,
            ]}
            onPress={() => setSelectedPlan('yearly')}
          >
            <View style={styles.bestValueBadge}>
              <Text style={styles.bestValueText}>BEST VALUE</Text>
            </View>
            <View style={styles.planHeader}>
              <Text style={styles.planType}>YEARLY</Text>
              <View style={[
                styles.radioButton,
                selectedPlan === 'yearly' && styles.radioButtonSelected
              ]}>
                {selectedPlan === 'yearly' && (
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                )}
              </View>
            </View>
            <Text style={styles.planPrice}>$9.99/yr</Text>
            <Text style={styles.planSubtext}>Best value</Text>
          </TouchableOpacity>
        </View>

        {/* Cancel Link for Premium Users */}
        {isAlreadyPremium && (
          <TouchableOpacity onPress={handleCancel} style={styles.cancelLink}>
            <Text style={styles.cancelLinkText}>Change plans or cancel anytime</Text>
          </TouchableOpacity>
        )}

        {/* Support Button */}
        <TouchableOpacity
          style={styles.supportButton}
          onPress={handlePurchase}
          disabled={purchasing}
        >
          {purchasing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.supportButtonText}>Support Friendo</Text>
          )}
        </TouchableOpacity>

        {/* Footer Links */}
        <View style={styles.footerLinks}>
          <TouchableOpacity onPress={handleRestore}>
            <Text style={styles.footerLink}>Restore</Text>
          </TouchableOpacity>
          <Text style={styles.footerDivider}>•</Text>
          <TouchableOpacity onPress={handleAboutFriendo}>
            <Text style={styles.footerLink}>About Friendo</Text>
          </TouchableOpacity>
        </View>

        {/* Terms */}
        <TouchableOpacity onPress={handleTermsAndPrivacy}>
          <Text style={styles.termsText}>
            By subscribing you agree to the{' '}
            <Text style={styles.termsLink}>Terms & Privacy</Text>. Your subscription 
            renews automatically until cancelled in your account settings.
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_BG,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: LIGHT_BG,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  headline: {
    fontSize: 28,
    fontWeight: '800',
    color: PURPLE,
    marginBottom: 16,
    lineHeight: 34,
  },
  description: {
    fontSize: 15,
    color: MUTED,
    lineHeight: 22,
    marginBottom: 32,
  },
  features: {
    marginBottom: 32,
  },
  featureRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  featureText: {
    flex: 1,
    marginLeft: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: DARK,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: MUTED,
    lineHeight: 20,
  },
  bonusFeatures: {
    backgroundColor: '#F3EDFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E0D4FF',
  },
  bonusFeaturesText: {
    fontSize: 14,
    color: MUTED,
    lineHeight: 20,
  },
  bonusFeaturesLabel: {
    fontWeight: '700',
    color: PURPLE,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: DARK,
    marginBottom: 16,
  },
  plansContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  planCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    minHeight: 160,
  },
  planCardSelected: {
    borderColor: PURPLE,
    backgroundColor: '#F3EDFF',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  planType: {
    fontSize: 14,
    fontWeight: '700',
    color: DARK,
    letterSpacing: 0.5,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D0D0D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    backgroundColor: PURPLE,
    borderColor: PURPLE,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: DARK,
    marginBottom: 4,
  },
  planSubtext: {
    fontSize: 14,
    color: MUTED,
  },
  bestValueBadge: {
    position: 'absolute',
    top: -10,
    left: 12,
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bestValueText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  cancelLink: {
    alignItems: 'center',
    marginBottom: 16,
  },
  cancelLinkText: {
    fontSize: 14,
    color: PURPLE,
    textDecorationLine: 'underline',
  },
  supportButton: {
    backgroundColor: PURPLE,
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: PURPLE,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  supportButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  footerLink: {
    fontSize: 16,
    color: PURPLE,
    fontWeight: '600',
  },
  footerDivider: {
    fontSize: 16,
    color: MUTED,
    marginHorizontal: 12,
  },
  termsText: {
    fontSize: 12,
    color: MUTED,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: PURPLE,
    textDecorationLine: 'underline',
  },
});
