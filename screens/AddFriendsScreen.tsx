import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useBasic } from '@basictech/expo';

const { width } = Dimensions.get('window');

export default function AddFriendsScreen() {
  const [friendCount, setFriendCount] = useState(0);
  const [totalMeetings, setTotalMeetings] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [pulseAnim] = useState(new Animated.Value(1));
  
  const navigation = useNavigation();
  const { db } = useBasic();

  const loadFriendsCount = useCallback(async () => {
    if (db) {
      try {
        const friends = await db.from('friends').getAll();
        setFriendCount(friends?.length || 0);

        // Calculate meetings this year
        const meetings = await db.from('meetings').getAll();
        const currentYear = new Date().getFullYear();
        const yearMeetings = (meetings || []).filter((meeting: any) => {
          const meetingDate = typeof meeting.date === 'string' ? meeting.date : String(meeting.date);
          return new Date(meetingDate).getFullYear() === currentYear;
        });
        setTotalMeetings(yearMeetings.length);
      } catch (error) {
        console.error('Error loading friends count:', error);
      }
    }
  }, [db]);

  useEffect(() => {
    // Animate screen entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Load existing friends count
    loadFriendsCount();
  }, []);

  useEffect(() => {
    // Pulse animation for continue button when friends are added
    if (friendCount >= 3) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [friendCount, pulseAnim]);

  // Listen for navigation focus to update friend count
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadFriendsCount();
    });

    return unsubscribe;
  }, [navigation]);

  const handleSyncContacts = () => {
    (navigation as any).navigate('Sync');
  };

  const handleManualAdd = () => {
    (navigation as any).navigate('ManualAdd');
  };

  const handleContinueToFriendlist = () => {
    if (friendCount >= 3) {
      (navigation as any).navigate('Main');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.iconContainer}>
            <Text style={styles.mainIcon}>👥</Text>
          </View>
          <Text style={styles.title}>Welcome to Friendo!</Text>
          <Text style={styles.subtitle}>
            Try to think of who are your friends, collect them
          </Text>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{friendCount}</Text>
            <Text style={styles.statLabel}>Friends Added</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalMeetings}</Text>
            <Text style={styles.statLabel}>Meetings This Year</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleSyncContacts}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.buttonIcon}>🔄</Text>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonTitle}>Sync from Contacts</Text>
                <Text style={styles.buttonSubtitle}>Import from social media & phone</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={handleManualAdd}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.buttonIcon}>✏️</Text>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonTitleSecondary}>Add Manually</Text>
                <Text style={styles.buttonSubtitleSecondary}>Enter friend details yourself</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Progress Indicator */}
        {friendCount < 3 && (
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${Math.min((friendCount / 3) * 100, 100)}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              Add {3 - friendCount} more to get started
            </Text>
          </View>
        )}

        {/* Continue Button */}
        <Animated.View 
          style={[
            styles.continueSection,
            friendCount >= 3 && { transform: [{ scale: pulseAnim }] }
          ]}
        >
          <TouchableOpacity 
            style={[
              styles.continueButton,
              friendCount >= 3 ? styles.continueButtonActive : styles.continueButtonDisabled
            ]}
            onPress={handleContinueToFriendlist}
            disabled={friendCount < 3}
          >
            <Text style={[
              styles.continueButtonText,
              friendCount >= 3 ? styles.continueButtonTextActive : styles.continueButtonTextDisabled
            ]}>
              Continue to Friendlist
            </Text>
            {friendCount >= 3 && (
              <Text style={styles.continueButtonIcon}>→</Text>
            )}
          </TouchableOpacity>
          
          {friendCount < 3 && (
            <Text style={styles.continueHint}>
              Add at least 3 friends to continue
            </Text>
          )}
        </Animated.View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 Pro Tips</Text>
          <Text style={styles.tipsText}>
            • Start with your closest friends{'\n'}
            • Include both local and online friends{'\n'}
            • You can always add more later
          </Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F4FF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(128, 0, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(128, 0, 255, 0.2)',
  },
  mainIcon: {
    fontSize: 36,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 40,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    minWidth: 120,
    shadowColor: '#8000FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8000FF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  actionsSection: {
    marginBottom: 30,
  },
  primaryButton: {
    backgroundColor: '#8000FF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#8000FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E0D4FF',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  buttonSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  buttonTitleSecondary: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8000FF',
    marginBottom: 4,
  },
  buttonSubtitleSecondary: {
    fontSize: 14,
    color: '#666666',
  },
  progressSection: {
    marginBottom: 30,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0D4FF',
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8000FF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    fontWeight: '500',
  },
  continueSection: {
    marginBottom: 30,
  },
  continueButton: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    minHeight: 60,
  },
  continueButtonActive: {
    backgroundColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  continueButtonDisabled: {
    backgroundColor: '#F0F0F0',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  continueButtonTextActive: {
    color: '#FFFFFF',
  },
  continueButtonTextDisabled: {
    color: '#CCCCCC',
  },
  continueButtonIcon: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  continueHint: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  tipsSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 255, 0.1)',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
});
