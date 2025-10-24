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
  Linking,
  Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Friend } from '../types';
import SimpleCitySelector from '../components/SimpleCitySelector';
import VenueCategorySelector from '../components/VenueCategorySelector';
import PartnerVenueSelector from '../components/PartnerVenueSelector';
import { getVenueCategory } from '../utils/venueTypes';
import { notificationService } from '../utils/notificationService';
import SimpleDatePicker from '../components/SimpleDatePicker';
import { createMeetingEvent, createAndDownloadMeetingICS } from '../utils/calendarUtils';
import { addMeeting } from '../utils/storage';

export default function MeetingCreateScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedVenue, setSelectedVenue] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState('');
  const [cityPlaceId, setCityPlaceId] = useState('');
  const [calendarOption, setCalendarOption<'device' | 'manual' | null>(null);
  const [meetingNotes, setMeetingNotes] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [activityConfirmed, setActivityConfirmed] = useState(false);
  
  const navigation = useNavigation();
  const route = useRoute();
  
  const friend = (route.params as any)?.friend as Friend;

  // Add validation for friend data
  if (!friend) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Error</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ fontSize: 16, color: '#666666', textAlign: 'center' }}>
            Friend information not found. Please go back and try again.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ... existing handlers ...

  const handleCreateMeeting = async () => {
    if (!selectedCity) {
      Alert.alert('Error', 'Please select a city first');
      return;
    }
    
    if (!selectedDate || !selectedCategory) {
      Alert.alert('Error', 'Please select a date and activity type');
      return;
    }

    setIsCreating(true);

    try {
      const category = getVenueCategory(selectedCategory);
      
      const meetingData = {
        friendId: friend.id,
        date: selectedDate.toISOString(),
        activity: selectedCategory,
        venue: selectedVenue || `Generic ${category?.name || 'Activity'}`,
        city: selectedCity,
        notes: meetingNotes || '',
        createdAt: Date.now(),
      };
      
      console.log('Creating meeting with data:', meetingData);
      
      // Create meeting in local storage
      try {
        const newMeeting = await addMeeting(meetingData);
        console.log('Meeting created successfully:', newMeeting);
      } catch (storageError) {
        console.error('Storage error details:', storageError);
        throw new Error(`Storage operation failed: ${storageError.message || 'Unknown storage error'}`);
      }

      // Reschedule notification based on friend's notification settings
      try {
        if (friend.notificationDays) {
          await notificationService.rescheduleNotificationAfterMeeting(
            friend.id,
            friend.name,
            friend.notificationDays
          );
        }
      } catch (notificationError) {
        console.error('Notification error:', notificationError);
        // Don't fail the whole operation for notification errors
      }

      // Handle calendar options
      if (calendarOption === 'device') {
        // Add to device calendar
        const success = await createMeetingEvent(
          friend,
          selectedDate,
          meetingNotes,
          selectedVenue || `${category?.name || 'Activity'} in ${selectedCity}`
        );
        
        if (success) {
          Alert.alert('Success', 'Meeting scheduled and added to your calendar!');
        } else {
          Alert.alert('Partial Success', 'Meeting scheduled, but could not add to calendar.');
        }
        navigation.goBack();
      } else if (calendarOption === 'manual') {
        // Download ICS file
        const success = await createAndDownloadMeetingICS(
          friend,
          selectedDate,
          meetingNotes,
          selectedVenue || `${category?.name || 'Activity'} in ${selectedCity}`
        );
        
        if (success) {
          Alert.alert('Success', 'Meeting scheduled! Check your downloads for the calendar file.');
        } else {
          Alert.alert('Partial Success', 'Meeting scheduled, but could not create calendar file.');
        }
        navigation.goBack();
      } else {
        Alert.alert('Success', 'Meeting scheduled successfully!');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error creating meeting:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to schedule meeting. Please try again.';
      
      if (error.message && error.message.includes('Network request failed')) {
        errorMessage = 'Network connection failed. Please check your internet connection and try again.';
      } else if (error.message && error.message.includes('Storage')) {
        errorMessage = 'Storage error occurred. Please try restarting the app and try again.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  // ... rest of code ...

</style>
