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
import { sendMeetingInvitation } from '../utils/emailUtils';
import { createMeetingEvent, createAndDownloadMeetingICS } from '../utils/calendarUtils';
import SimpleCitySelector from '../components/SimpleCitySelector';
import VenueCategorySelector from '../components/VenueCategorySelector';
import PartnerVenueSelector from '../components/PartnerVenueSelector';
import { getVenueCategory } from '../utils/venueTypes';

export default function MeetingCreateScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedVenue, setSelectedVenue] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [cityPlaceId, setCityPlaceId] = useState('');
  const [googleCalendar, setGoogleCalendar] = useState(false);
  const [outlookCalendar, setOutlookCalendar] = useState(false);
  const [appleCalendar, setAppleCalendar] = useState(false);
  const [sendInvitation, setSendInvitation] = useState(false);
  const [friendEmail, setFriendEmail] = useState('');
  const [meetingNotes, setMeetingNotes] = useState('');
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

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedVenue(''); // Reset venue when category changes
  };

  const handleCitySelect = (city: string, placeId: string) => {
    setSelectedCity(city);
    setCityPlaceId(placeId);
    setSelectedVenue(''); // Reset venue when city changes
  };

  const handleCreateMeeting = async () => {
    if (!selectedDate || !selectedCategory) {
      Alert.alert('Error', 'Please select a date and activity type');
      return;
    }

    // For location-based activities, require city selection
    const requiresLocation = ['restaurant', 'bar', 'cafe', 'entertainment', 'shopping', 'sports', 'culture'].includes(selectedCategory);
    if (requiresLocation && !selectedCity) {
      Alert.alert('Error', 'Please select a city for this activity type');
      return;
    }

    if (sendInvitation && !friendEmail.trim()) {
      Alert.alert('Error', 'Please enter friend\'s email to send invitation');
      return;
    }

    setIsCreating(true);

    try {
      if (db) {
        const category = getVenueCategory(selectedCategory);
        
        // Create meeting in database
        await db.from('meetings').add({
          friendId: friend.id,
          date: selectedDate.toISOString(),
          activityType: selectedCategory,
          activityName: category?.name || selectedCategory,
          venue: selectedVenue || `Generic ${category?.name}`,
          city: selectedCity,
          notes: meetingNotes,
          createdAt: Date.now(),
        });

        // Handle calendar integration
        if (googleCalendar || outlookCalendar || appleCalendar) {
          if (googleCalendar || appleCalendar) {
            // Add to device calendar
            await createMeetingEvent(friend, selectedDate, meetingNotes);
          }
          
          if (outlookCalendar || googleCalendar) {
            // Create downloadable ICS file
            await createAndDownloadMeetingICS(friend, selectedDate, meetingNotes);
          }
        }

        // Send email invitation if requested
        if (sendInvitation && friendEmail.trim()) {
          const friendWithEmail = { ...friend, email: friendEmail.trim() };
          const emailSent = await sendMeetingInvitation(
            friendWithEmail, 
            selectedDate, 
            user?.email || 'friendo-user@example.com',
            meetingNotes,
            selectedVenue,
            selectedCity
          );
          
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

  const selectedCategoryData = getVenueCategory(selectedCategory);

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
          <Text style={styles.sectionTitle}>📅 Select Date</Text>
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
          <Text style={styles.sectionTitle}>🎯 Type of Activity</Text>
          <VenueCategorySelector
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
            selectedCity={selectedCity}
          />
        </View>

        {selectedCategoryData ? (
          <View>
            {/* City Selection for location-based activities */}
            {['restaurant', 'bar', 'cafe', 'entertainment', 'shopping', 'sports', 'culture'].includes(selectedCategory) ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📍 Select City</Text>
                <SimpleCitySelector
                  selectedCity={selectedCity}
                  onCitySelect={handleCitySelect}
                  placeholder="Choose a city..."
                />
              </View>
            ) : null}

            {/* Partner Venue Selection */}
            {selectedCity && ['restaurant', 'bar', 'cafe', 'entertainment', 'shopping', 'sports', 'culture'].includes(selectedCategory) ? (
              <View style={styles.section}>
                <PartnerVenueSelector
                  selectedVenue={selectedVenue}
                  onVenueSelect={setSelectedVenue}
                  selectedCity={selectedCity}
                  selectedCategory={selectedCategory}
                />
              </View>
            ) : null}

            {/* For park activities, no specific venue needed */}
            {selectedCategory === 'park' ? (
              <View style={styles.section}>
                <View style={styles.parkInfo}>
                  <Text style={styles.parkInfoIcon}>🌳</Text>
                  <View style={styles.parkInfoText}>
                    <Text style={styles.parkInfoTitle}>Park Activity Selected</Text>
                    <Text style={styles.parkInfoSubtext}>
                      Perfect for outdoor meetups! You can choose the specific park when you meet.
                    </Text>
                  </View>
                </View>
              </View>
            ) : null}
          </View>
        ) : null}

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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Additional Details</Text>
          <View style={styles.notesHints}>
            <Text style={styles.notesHint}>
              • Click outside the box once filled
            </Text>
            <Text style={styles.notesHint}>
              • This will be included in calendar invites and email invitations
            </Text>
          </View>
          <TextInput
            style={styles.notesInput}
            value={meetingNotes}
            onChangeText={setMeetingNotes}
            placeholder="Add any details about the meeting... (e.g., 'Looking forward to catching up!' or 'Let's discuss the project')"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
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
  parkInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#8000FF',
  },
  parkInfoIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  parkInfoText: {
    flex: 1,
  },
  parkInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8000FF',
    marginBottom: 4,
  },
  parkInfoSubtext: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 18,
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
  notesInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 100,
    backgroundColor: '#FAFAFA',
  },
  notesHint: {
    fontSize: 11,
    color: '#999999',
    fontStyle: 'italic',
    marginBottom: 2,
  },
  notesHints: {
    marginBottom: 10,
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
