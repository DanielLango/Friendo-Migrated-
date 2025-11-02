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
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { logout } from '../utils/storage';
import { isPremiumUser } from '../utils/premiumFeatures';
// import { cleanupOrphanedMeetings, getDatabaseDiagnostics } from '../utils/dataRecovery';

export default function ProfileScreen() {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    checkPremiumStatus();
  }, []);

  const checkPremiumStatus = async () => {
    const premium = await isPremiumUser();
    setIsPremium(premium);
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

  /*
  const handleEmergencyCleanup = async () => {
    setIsLoading(true);
    try {
      // Get diagnostics first
      const diagnostics = await getDatabaseDiagnostics();
      
      if ('error' in diagnostics) {
        Alert.alert('Error', diagnostics.error);
        setIsLoading(false);
        return;
      }

      const message = `
DATABASE STATUS:
• Friends: ${diagnostics.friendsCount}
• Meetings: ${diagnostics.meetingsCount}
• Orphaned Meetings: ${diagnostics.orphanedMeetingsCount}

${diagnostics.orphanedMeetingsCount > 0 ? 'Found orphaned meetings that need cleanup!' : 'Database looks healthy!'}
      `.trim();

      console.log('=== EMERGENCY DIAGNOSTICS ===');
      console.log(JSON.stringify(diagnostics, null, 2));

      if (diagnostics.orphanedMeetingsCount > 0) {
        Alert.alert(
          'Database Issues Found',
          message + '\\n\\nWould you like to clean up orphaned meetings?',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => setIsLoading(false) },
            {
              text: 'Clean Up Now',
              style: 'destructive',
              onPress: async () => {
                const result = await cleanupOrphanedMeetings();
                setIsLoading(false);
                Alert.alert(
                  result.success ? 'Success! ✅' : 'Error',
                  result.message + '\\n\\nPlease restart the app.',
                  [
                    {
                      text: 'OK',
                      onPress: () => (navigation as any).navigate('Main')
                    }
                  ]
                );
              }
            }
          ]
        );
      } else {
        setIsLoading(false);
        Alert.alert('Database Status', message);
      }
    } catch (error) {
      console.error('Emergency cleanup error:', error);
      setIsLoading(false);
      Alert.alert('Error', 'Failed to run diagnostics. Check console for details.');
    }
  };

  const handleNuclearOption = async () => {
    Alert.alert(
      '⚠️ NUCLEAR OPTION ⚠️',
      'This will DELETE ALL your friends and meetings data. This cannot be undone!\\n\\nOnly use this if the app is completely broken.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'DELETE EVERYTHING',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              const { supabase } = await import('../utils/supabase');
              const { data: { user } } = await supabase.auth.getUser();
              
              if (!user) {
                Alert.alert('Error', 'Not logged in');
                setIsLoading(false);
                return;
              }

              // Delete all meetings
              await supabase.from('meetings').delete().eq('user_id', user.id);
              
              // Delete all friends
              await supabase.from('friends').delete().eq('user_id', user.id);

              setIsLoading(false);
              Alert.alert(
                'Success',
                'All data has been deleted. You can now start fresh!',
                [
                  {
                    text: 'OK',
                    onPress: () => (navigation as any).navigate('AddFriends')
                  }
                ]
              );
            } catch (error) {
              console.error('Nuclear option error:', error);
              setIsLoading(false);
              Alert.alert('Error', 'Failed to delete data. Check console.');
            }
          }
        }
      ]
    );
  };
  */

  return (
    <SafeAreaView style={styles.container}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#8000FF" />
          <Text style={styles.loadingText}>Working...</Text>
        </View>
      )}

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

        {/* Emergency Recovery Section - COMMENTED OUT */}
        {/*
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚨 Emergency Recovery</Text>
          <Text style={styles.sectionDescription}>
            Use these tools if the app is not working correctly
          </Text>
          
          <TouchableOpacity
            style={styles.recoveryButton}
            onPress={handleEmergencyCleanup}
            disabled={isLoading}
          >
            <Text style={styles.recoveryButtonText}>🔧 Run Diagnostics & Cleanup</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.recoveryButton, styles.nuclearButton]}
            onPress={handleNuclearOption}
            disabled={isLoading}
          >
            <Text style={[styles.recoveryButtonText, styles.nuclearButtonText]}>
              ☢️ Nuclear Option (Delete All Data)
            </Text>
          </TouchableOpacity>
        </View>
        */}

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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 12,
    fontWeight: '600',
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
  sectionDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
    lineHeight: 20,
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
  recoveryButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
  },
  recoveryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  nuclearButton: {
    backgroundColor: '#EF4444',
  },
  nuclearButtonText: {
    color: '#FFFFFF',
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
  logoutButton: {
    backgroundColor: '#EF4444',
    marginHorizontal: 20,
    marginVertical: 30,
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
