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
import { getFriends, getMeetings } from '../utils/storage';

const { width } = Dimensions.get('window');

export default function AddFriendsScreen() {
  const [friendCount, setFriendCount] = useState(0);
  const [totalMeetings, setTotalMeetings] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [pulseAnim] = useState(new Animated.Value(1));
  
  const navigation = useNavigation();

  const loadFriendsCount = useCallback(async () => {
    try {
      const friends = await getFriends();
      setFriendCount(friends.length);

      // Calculate meetings this year
      const meetings = await getMeetings();
      const currentYear = new Date().getFullYear();
      const yearMeetings = meetings.filter((meeting) => {
        const isCancelled = meeting.notes && meeting.notes.startsWith('[CANCELLED]');
        return new Date(meeting.date).getFullYear() === currentYear && !isCancelled;
      });
      setTotalMeetings(yearMeetings.length);
    } catch (error) {
      console.error('Error loading friends count:', error);
    }
  }, []);

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
  }, [navigation, loadFriendsCount]);

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
            Create and manage your best friend lists, set how often you want to catch up, and set Friendo to gently remind you to keep those friendships alive.
          </Text>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{friendCount}</Text>
            <View style={styles.statLabelContainer}>
              <Text style={styles.statLabel}>Friends Added</Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalMeetings}</Text>
            <View style={styles.statLabelContainer}>
              <Text style={styles.statLabel}>Meetings in 2025</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleManualAdd}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.buttonIcon}>👥</Text>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonTitle}>Add Friend</Text>
                <Text style={styles.buttonSubtitle}>Build your friendship list</Text>
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
    paddingVertical: 10,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
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
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    flex: 1,
    marginHorizontal: 8,
    minHeight: 120,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#8000FF',
    marginBottom: 8,
    textAlign: 'center',
    width: '100%',
  },
  statLabelContainer: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 16,
  },
  actionsSection: {
    marginBottom: 20,
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
  progressSection: {
    marginBottom: 20,
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
    marginBottom: 20,
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