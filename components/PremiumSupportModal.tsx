import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';

interface PremiumSupportModalProps {
  visible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

export default function PremiumSupportModal({ 
  visible, 
  onClose, 
  onUpgrade 
}: PremiumSupportModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.emoji}>💜</Text>
            <Text style={styles.title}>Support the Developers</Text>
            <Text style={styles.subtitle}>
              Help us keep Friendo free and awesome for everyone!
            </Text>
          </View>

          <ScrollView style={styles.featuresContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.featureRow}>
              <Text style={styles.featureIcon}>🎯</Text>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Cancellation Insights</Text>
                <Text style={styles.featureDescription}>
                  See who cancels on you (red tokens) vs when you cancel (pink tokens). 
                  Understand your friendship patterns.
                </Text>
              </View>
            </View>

            <View style={styles.featureRow}>
              <Text style={styles.featureIcon}>🎂</Text>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Birthday Reminders</Text>
                <Text style={styles.featureDescription}>
                  Never forget a friend&apos;s birthday again. Get timely reminders.
                </Text>
              </View>
            </View>

            <View style={styles.featureRow}>
              <Text style={styles.featureIcon}>📸</Text>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Profile Photos</Text>
                <Text style={styles.featureDescription}>
                  Upload custom photos for your friends or sync from contacts.
                </Text>
              </View>
            </View>

            <View style={styles.featureRow}>
              <Text style={styles.featureIcon}>📊</Text>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>History & Archive</Text>
                <Text style={styles.featureDescription}>
                  View previous years&apos; data and track friendship trends over time.
                </Text>
              </View>
            </View>

            <View style={styles.featureRow}>
              <Text style={styles.featureIcon}>📧</Text>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Weekly Digest</Text>
                <Text style={styles.featureDescription}>
                  Get a weekly summary of friends you should reconnect with.
                </Text>
              </View>
            </View>

            <View style={styles.featureRow}>
              <Text style={styles.featureIcon}>⭐</Text>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Favorite Friends</Text>
                <Text style={styles.featureDescription}>
                  Mark your closest friends and prioritize them in your list.
                </Text>
              </View>
            </View>

            <View style={styles.featureRow}>
              <Text style={styles.featureIcon}>🌙</Text>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Dark Mode</Text>
                <Text style={styles.featureDescription}>
                  Easy on the eyes, perfect for late-night friendship tracking.
                </Text>
              </View>
            </View>

            <View style={styles.featureRow}>
              <Text style={styles.featureIcon}>🎁</Text>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Partner Venue Perks</Text>
                <Text style={styles.featureDescription}>
                  Get exclusive discounts at local restaurants, bars, and cafes.
                </Text>
              </View>
            </View>

            <View style={styles.featureRow}>
              <Text style={styles.featureIcon}>♾️</Text>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Unlimited Friends</Text>
                <Text style={styles.featureDescription}>
                  Track more than 50 friends (for the social butterflies).
                </Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.pricingContainer}>
            <Text style={styles.priceText}>Only $0.99/month</Text>
            <Text style={styles.priceSubtext}>Less than a coffee ☕</Text>
          </View>

          <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
            <Text style={styles.upgradeButtonText}>💜 Upgrade to Premium</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.maybeLaterButton} onPress={onClose}>
            <Text style={styles.maybeLaterText}>Maybe Later</Text>
          </TouchableOpacity>

          <Text style={styles.footerText}>
            Your support helps us keep Friendo free for everyone! 🙏
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    maxHeight: '85%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
  featuresContainer: {
    maxHeight: 320,
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
  },
  pricingContainer: {
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  priceText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8000FF',
    marginBottom: 4,
  },
  priceSubtext: {
    fontSize: 14,
    color: '#666666',
  },
  upgradeButton: {
    backgroundColor: '#8000FF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#8000FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  maybeLaterButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  maybeLaterText: {
    color: '#999999',
    fontSize: 16,
    fontWeight: '500',
  },
  footerText: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 16,
  },
});