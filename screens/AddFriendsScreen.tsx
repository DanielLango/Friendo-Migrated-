import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useBasic } from '@basictech/expo';
import { Friend } from '../types';

export default function AddFriendsScreen() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [totalMeetings, setTotalMeetings] = useState(0);
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [fullName, setFullName] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [isLocal, setIsLocal] = useState(false);
  
  const navigation = useNavigation();
  const { db, isSignedIn } = useBasic();

  useEffect(() => {
    if (isSignedIn && db) {
      loadFriends();
      loadMeetings();
    }
  }, [isSignedIn, db]);

  const loadFriends = async () => {
    if (db) {
      try {
        const friendsData = await db.from('friends').getAll();
        setFriends((friendsData || []) as Friend[]);
      } catch (error) {
        console.error('Error loading friends:', error);
      }
    }
  };

  const loadMeetings = async () => {
    if (db) {
      try {
        const meetingsData = await db.from('meetings').getAll();
        const currentYear = new Date().getFullYear();
        const thisYearMeetings = (meetingsData || []).filter((meeting: any) => 
          new Date(meeting.date).getFullYear() === currentYear
        );
        setTotalMeetings(thisYearMeetings.length);
      } catch (error) {
        console.error('Error loading meetings:', error);
      }
    }
  };

  const handleManualAdd = async () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter a friend\'s name');
      return;
    }

    if (!isOnline && !isLocal) {
      Alert.alert('Error', 'Please select at least one friend type');
      return;
    }

    if (!isSignedIn) {
      Alert.alert('Authentication Required', 'Please sign in to add friends');
      return;
    }

    if (db) {
      try {
        await db.from('friends').add({
          name: fullName.trim(),
          email: '',
          friendType: isOnline && isLocal ? 'both' : isOnline ? 'online' : 'local',
          isOnline,
          isLocal,
          profilePicture: '👤',
          city: '',
          source: 'manual',
          createdAt: Date.now(),
        });

        Alert.alert('Success', 'Friend added successfully!');
        setFullName('');
        setIsOnline(false);
        setIsLocal(false);
        setShowManualAdd(false);
        loadFriends();
      } catch (error) {
        console.error('Error adding friend:', error);
        Alert.alert('Error', 'Failed to add friend. Please try again.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to Friendo!</Text>
          <Text style={styles.subtitle}>
            Create and manage your best friend lists, set how often you want to catch up, and set Friendo to gently remind you to keep those friendships alive.
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{friends.length}</Text>
            <Text style={styles.statLabel}>Friends Added</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalMeetings}</Text>
            <Text style={styles.statLabel}>Meetings This Year</Text>
          </View>
        </View>

        {!showManualAdd ? (
          <View style={styles.optionsContainer}>
            <Text style={styles.sectionTitle}>Add Friends</Text>
            
            <TouchableOpacity 
              style={styles.optionButton}
              onPress={() => setShowManualAdd(true)}
            >
              <Text style={styles.optionIcon}>✏️</Text>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Add Manually</Text>
                <Text style={styles.optionDescription}>
                  Type in friends you want to stay connected with
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.optionButton}
              onPress={() => (navigation as any).navigate('ContactSelect', { source: 'contacts' })}
            >
              <Text style={styles.optionIcon}>📱</Text>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Import from Contacts</Text>
                <Text style={styles.optionDescription}>
                  Select friends from your phone contacts
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.proTipsContainer}>
              <Text style={styles.proTipsTitle}>💡 Pro Tips</Text>
              <Text style={styles.proTip}>
                • Start with 3-10 close friends you want to stay connected with
              </Text>
              <Text style={styles.proTip}>
                • You can always add more friends later
              </Text>
              <Text style={styles.proTip}>
                • Mix online and local friends for a balanced social life
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.continueButton}
              onPress={() => (navigation as any).navigate('Main')}
            >
              <Text style={styles.continueButtonText}>Continue to App</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.manualAddContainer}>
            <View style={styles.manualAddHeader}>
              <TouchableOpacity onPress={() => setShowManualAdd(false)}>
                <Text style={styles.backButton}>← Back</Text>
              </TouchableOpacity>
              <Text style={styles.manualAddTitle}>Add Friend Manually</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Friend&apos;s Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter full name"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Friend Type:</Text>
              
              <TouchableOpacity 
                style={styles.checkboxContainer}
                onPress={() => setIsOnline(!isOnline)}
              >
                <View style={[styles.checkbox, isOnline && styles.checkboxChecked]}>
                  {isOnline && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Online friend</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.checkboxContainer}
                onPress={() => setIsLocal(!isLocal)}
              >
                <View style={[styles.checkbox, isLocal && styles.checkboxChecked]}>
                  {isLocal && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Local friend</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={handleManualAdd}
              >
                <Text style={styles.addButtonText}>Add Friend</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingVertical: 20,
    marginBottom: 30,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#8000FF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 18,
  },
  optionsContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 18,
  },
  proTipsContainer: {
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 30,
  },
  proTipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  proTip: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 4,
  },
  continueButton: {
    backgroundColor: '#8000FF',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  manualAddContainer: {
    flex: 1,
  },
  manualAddHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    fontSize: 16,
    color: '#8000FF',
    marginRight: 20,
  },
  manualAddTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  sectionContainer: {
    marginBottom: 30,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#8000FF',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#8000FF',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333333',
  },
  buttonContainer: {
    marginTop: 20,
  },
  addButton: {
    backgroundColor: '#8000FF',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
