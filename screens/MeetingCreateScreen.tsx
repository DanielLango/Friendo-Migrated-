import React, { useState } from 'react';
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
import { useNavigation, useRoute } from '@react-navigation/native';
import { useBasic } from '@basictech/expo';
import { Friend } from '../types';
import { activityTypes } from '../utils/mockData';

export default function MeetingCreateScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedActivity, setSelectedActivity] = useState('');
  const [selectedVenue, setSelectedVenue] = useState('');
  const [googleCalendar, setGoogleCalendar] = useState(false);
  const [outlookCalendar, setOutlookCalendar] = useState(false);
  const [appleCalendar, setAppleCalendar] = useState(false);
  const [sendInvitation, setSendInvitation] = useState(false);
  const [friendEmail, setFriendEmail] = useState('');
  
  const navigation = useNavigation();
  const route = useRoute();
  const { db } = useBasic();
  
  const friend = (route.params as any)?.friend as Friend;

  const handleActivitySelect = (activityId: string) => {
    setSelectedActivity(activityId);
    setSelectedVenue(''); // Reset venue when activity changes
  };

  const handleCreateMeeting = async () => {
    if (!selectedDate || !selectedActivity || !selectedVenue) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (db) {
      try {
        await db.from('meetings').add({
          friendId: friend.id,
          date: selectedDate,
          activity: selectedActivity,
          venue: selectedVenue,
          notes: '',
          createdAt: Date.now(),
        });

        Alert.alert('Success', 'Meeting scheduled successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } catch (error) {
        console.error('Error creating meeting:', error);
        Alert.alert('Error', 'Failed to schedule meeting. Please try again.');
      }
    }
  };

  const selectedActivityType = activityTypes.find(type => type.id === selectedActivity);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Schedule with {friend?.name}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <TextInput
            style={styles.dateInput}
            value={selectedDate}
            onChangeText={setSelectedDate}
            placeholder="YYYY-MM-DD"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Type of Activity</Text>
          {activityTypes.map((activity) => (
            <TouchableOpacity
              key={activity.id}
              style={[
                styles.activityOption,
                selectedActivity === activity.id && styles.activityOptionSelected
              ]}
              onPress={() => handleActivitySelect(activity.id)}
            >
              <Text style={[
                styles.activityText,
                selectedActivity === activity.id && styles.activityTextSelected
              ]}>
                {activity.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedActivityType && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Venue Suggestions</Text>
            {selectedActivityType.venues.map((venue) => (
              <TouchableOpacity
                key={venue.id}
                style={[
                  styles.venueOption,
                  selectedVenue === venue.name && styles.venueOptionSelected
                ]}
                onPress={() => setSelectedVenue(venue.name)}
              >
                <Text style={[
                  styles.venueText,
                  selectedVenue === venue.name && styles.venueTextSelected
                ]}>
                  {venue.name} ({venue.popularity}%)
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sync to Calendar</Text>
          
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setGoogleCalendar(!googleCalendar)}
          >
            <View style={[styles.checkbox, googleCalendar && styles.checkboxChecked]}>
              {googleCalendar && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>Google Calendar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setOutlookCalendar(!outlookCalendar)}
          >
            <View style={[styles.checkbox, outlookCalendar && styles.checkboxChecked]}>
              {outlookCalendar && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>Outlook</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setAppleCalendar(!appleCalendar)}
          >
            <View style={[styles.checkbox, appleCalendar && styles.checkboxChecked]}>
              {appleCalendar && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>Apple Calendar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setSendInvitation(!sendInvitation)}
          >
            <View style={[styles.checkbox, sendInvitation && styles.checkboxChecked]}>
              {sendInvitation && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>Also send invitation to the friend?</Text>
          </TouchableOpacity>

          {sendInvitation && (
            <TextInput
              style={styles.emailInput}
              value={friendEmail}
              onChangeText={setFriendEmail}
              placeholder="Email of friend:"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          )}
        </View>

        <TouchableOpacity style={styles.createButton} onPress={handleCreateMeeting}>
          <Text style={styles.createButtonText}>Schedule Meeting</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    fontSize: 16,
    color: '#8000FF',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 50,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  activityOption: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 10,
  },
  activityOptionSelected: {
    backgroundColor: '#8000FF',
    borderColor: '#8000FF',
  },
  activityText: {
    fontSize: 16,
    color: '#333333',
  },
  activityTextSelected: {
    color: '#FFFFFF',
  },
  venueOption: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 10,
  },
  venueOptionSelected: {
    backgroundColor: '#8000FF',
    borderColor: '#8000FF',
  },
  venueText: {
    fontSize: 16,
    color: '#333333',
  },
  venueTextSelected: {
    color: '#FFFFFF',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
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
    flex: 1,
  },
  emailInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginTop: 10,
  },
  createButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginVertical: 30,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});