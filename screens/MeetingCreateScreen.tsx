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
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useBasic } from '@basictech/expo';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Friend } from '../types';
import { activityTypes } from '../utils/mockData';
import { sendFriendInvitation } from '../utils/emailUtils';
import { createMeetingEvent, createAndDownloadMeetingICS } from '../utils/calendarUtils';
import SimpleCitySelector from '../components/SimpleCitySelector';
import VenueSelector from '../components/VenueSelector';

export default function MeetingCreateScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState('');
  const [selectedVenue, setSelectedVenue] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [cityPlaceId, setCityPlaceId] = useState('');
  const [googleCalendar, setGoogleCalendar] = useState(false);
  const [outlookCalendar, setOutlookCalendar] = useState(false);
  const [appleCalendar, setAppleCalendar] = useState(false);
  const [sendInvitation, setSendInvitation] = useState(false);
  const [friendEmail, setFriendEmail] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const navigation = useNavigation();
  const route = useRoute();
  const { db, user } = useBasic();
  
  const friend = (route.params as any)?.friend as Friend;

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
    }
  };

  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        })
      });
    }
    return dates;
  };

  const dateOptions = generateDateOptions();

  const handleActivitySelect = (activityId: string) => {
    setSelectedActivity(activityId);
    setSelectedVenue(''); // Reset venue when activity changes
  };

  const handleCitySelect = (city: string, placeId: string) => {
    setSelectedCity(city);
    setCityPlaceId(placeId);
    setSelectedVenue(''); // Reset venue when city changes
  };

  const handleCreateMeeting = async () => {
    if (!selectedDate || !selectedActivity) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // For restaurants/cafes/bars, require city and venue
    const requiresVenue = ['coffee', 'restaurant', 'bar', 'drinks', 'lunch', 'dinner', 'breakfast'].includes(selectedActivity);
    if (requiresVenue && (!selectedCity || !selectedVenue)) {
      Alert.alert('Error', 'Please select a city and venue for this activity');
      return;
    }

    if (sendInvitation && !friendEmail.trim()) {
      Alert.alert('Error', 'Please enter friend\'s email to send invitation');
      return;
    }

    setIsCreating(true);

    try {
      if (db) {
        // Create meeting in database
        await db.from('meetings').add({
          friendId: friend.id,
          date: selectedDate.toISOString(),
          activity: selectedActivity,
          venue: selectedVenue,
          city: selectedCity,
          notes: '',
          createdAt: Date.now(),
        });

        // Handle calendar integration
        if (googleCalendar || outlookCalendar || appleCalendar) {
          if (googleCalendar || appleCalendar) {
            // Add to device calendar
            await createMeetingEvent(friend, selectedDate);
          }
          
          if (outlookCalendar || googleCalendar) {
            // Create downloadable ICS file
            await createAndDownloadMeetingICS(friend, selectedDate);
          }
        }

        // Send email invitation if requested
        if (sendInvitation && friendEmail.trim()) {
          const friendWithEmail = { ...friend, email: friendEmail.trim() };
          const emailSent = await sendFriendInvitation(friendWithEmail, user?.email || 'friendo-user@example.com');
          
          if (emailSent) {
            Alert.alert('Success', 'Meeting scheduled and invitation sent!');
          } else {
            Alert.alert('Partial Success', 'Meeting scheduled but failed to send invitation.');
          }
        } else {
          Alert.alert('Success', 'Meeting scheduled successfully!');
        }

        navigation.goBack();
      }
    } catch (error) {
      console.error('Error creating meeting:', error);
      Alert.alert('Error', 'Failed to schedule meeting. Please try again.');
    } finally {
      setIsCreating(false);
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
          <TouchableOpacity
            style={styles.dateSelector}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateSelectorText}>
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })}
            </Text>
            <Text style={styles.dropdownIcon}>📅</Text>
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}
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
          <>
            {/* City Selection for restaurants/cafes/bars */}
            {['coffee', 'restaurant', 'bar', 'drinks', 'lunch', 'dinner', 'breakfast'].includes(selectedActivity) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📍 Select City</Text>
                <SimpleCitySelector
                  selectedCity={selectedCity}
                  onCitySelect={handleCitySelect}
                  placeholder="Choose a city..."
                />
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {selectedCity ? `Venues in ${selectedCity}` : 'Venue Suggestions'}
              </Text>
              {selectedCity && ['coffee', 'restaurant', 'bar', 'drinks', 'lunch', 'dinner', 'breakfast'].includes(selectedActivity) ? (
                <VenueSelector
                  selectedVenue={selectedVenue}
                  onVenueSelect={setSelectedVenue}
                  activityType={selectedActivity}
                  cityPlaceId={cityPlaceId}
                />
              ) : (
                // Fallback to original venue selection for non-location activities
                <>
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
                </>
              )}
            </View>
          </>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Sync to Calendar</Text>
          
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setGoogleCalendar(!googleCalendar)}
          >
            <View style={[styles.checkbox, googleCalendar && styles.checkboxChecked]}>
              {googleCalendar && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <View style={styles.checkboxContent}>
              <Text style={styles.checkboxLabel}>Google Calendar</Text>
              <Text style={styles.checkboxSubtext}>Add to device calendar + download ICS</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setOutlookCalendar(!outlookCalendar)}
          >
            <View style={[styles.checkbox, outlookCalendar && styles.checkboxChecked]}>
              {outlookCalendar && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <View style={styles.checkboxContent}>
              <Text style={styles.checkboxLabel}>Outlook</Text>
              <Text style={styles.checkboxSubtext}>Download ICS file for import</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setAppleCalendar(!appleCalendar)}
          >
            <View style={[styles.checkbox, appleCalendar && styles.checkboxChecked]}>
              {appleCalendar && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <View style={styles.checkboxContent}>
              <Text style={styles.checkboxLabel}>Apple Calendar</Text>
              <Text style={styles.checkboxSubtext}>Add to device calendar</Text>
            </View>
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
            <View style={styles.checkboxContent}>
              <Text style={styles.checkboxLabel}>📧 Send invitation to friend</Text>
              <Text style={styles.checkboxSubtext}>Email invitation with meeting details</Text>
            </View>
          </TouchableOpacity>

          {sendInvitation && (
            <TextInput
              style={styles.emailInput}
              value={friendEmail}
              onChangeText={setFriendEmail}
              placeholder="Friend's email address"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          )}
        </View>

        <TouchableOpacity 
          style={[styles.createButton, isCreating && styles.createButtonDisabled]} 
          onPress={handleCreateMeeting}
          disabled={isCreating}
        >
          <Text style={styles.createButtonText}>
            {isCreating ? 'Creating Meeting...' : 'Schedule Meeting'}
          </Text>
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
  dateSelector: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateSelectorText: {
    fontSize: 16,
    color: '#333333',
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#666666',
  },
  datePickerContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginTop: 8,
    maxHeight: 200,
    backgroundColor: '#FFFFFF',
  },
  datePickerScroll: {
    maxHeight: 200,
  },
  dateOption: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dateOptionSelected: {
    backgroundColor: '#8000FF',
  },
  dateOptionText: {
    fontSize: 16,
    color: '#333333',
  },
  dateOptionTextSelected: {
    color: '#FFFFFF',
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
    alignItems: 'flex-start',
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
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#8000FF',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxContent: {
    flex: 1,
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  checkboxSubtext: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  emailInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginTop: 10,
    marginLeft: 32,
  },
  createButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginVertical: 30,
  },
  createButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
