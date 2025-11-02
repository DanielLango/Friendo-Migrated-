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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { logout, clearAllMeetings } from '../utils/storage';
import { isPremiumUser } from '../utils/premiumFeatures';

export default function ProfileScreen() {
  const [isPremium, setIsPremium] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    checkPremiumStatus();
  }, []);

  const checkPremiumStatus = async () => {
    const premium = await isPremiumUser();
    setIsPremium(premium);
  };

  const handleClearMeetings = async () => {
    Alert.alert(
      'Clear All Meetings',
      'Are you sure you want to delete all your meetings? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            const success = await clearAllMeetings();
            if (success) {
              Alert.alert('Success', 'All meetings have been deleted.');
            } else {
              Alert.alert('Error', 'Failed to delete meetings. Please try again.');
            }
          },
        },
      ]
    );
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Membership Tier */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Membership</Text>
          <View style={[styles.tierBadge, isPremium && styles.tierBadgePremium]}>
            <Text style={[styles.tierText, isPremium && styles.tierTextPremium]}>
              {isPremium ? '⭐ Premium' : '🆓 Free'}
            </Text>
          </View>
        </View>

        {/* Links Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => Linking.openURL('https://www.privacypolicies.com/live/213b96d7-30cf-4a41-a182-38624ac19603')}
          >
            <Text style={styles.linkButtonText}>Privacy Policy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => Alert.alert('Coming Soon', 'Terms & Conditions will be available soon.')}
          >
            <Text style={styles.linkButtonText}>Terms & Conditions</Text>
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>
            Made with love by Daniel Lango, during his free time focusing on his personal hobby-project, Ambrozite Studios.
          </Text>
          <TouchableOpacity
            onPress={() => Linking.openURL('https://ambrozitestudios.com')}
          >
            <Text style={styles.linkText}>Visit ambrozitestudios.com</Text>
          </TouchableOpacity>
        </View>

        {/* Clear Meetings Button */}
        <TouchableOpacity style={styles.clearButton} onPress={handleClearMeetings}>
          <Text style={styles.clearButtonText}>Clear All Meetings</Text>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
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
    fontSize: 16,
    color: '#8000FF',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  placeholder: {
    width: 50,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  tierBadge: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  tierBadgePremium: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FDBA74',
  },
  tierText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666666',
  },
  tierTextPremium: {
    color: '#EA580C',
  },
  linkButton: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  linkButtonText: {
    fontSize: 15,
    color: '#8000FF',
  },
  aboutText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 12,
  },
  linkText: {
    fontSize: 14,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  clearButton: {
    backgroundColor: '#FF9800',
    marginHorizontal: 20,
    marginTop: 30,
    paddingVertical: 14,
    borderRadius: 8,
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    marginHorizontal: 20,
    marginVertical: 15,
    paddingVertical: 14,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
