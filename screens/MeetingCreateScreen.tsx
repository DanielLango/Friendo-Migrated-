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
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useBasic } from '@basictech/expo';
import { Friend } from '../types';
import CitySelector from '../components/CitySelector';
import { sendCalendarInvite, sendEmailInvite } from '../utils/emailUtils';

export default function MeetingCreateScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');
  const [meetingNotes, setMeetingNotes] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [syncToGoogleCalendar, setSyncToGoogleCalendar] = useState(false);
  const [syncToOutlook, setSyncToOutlook] = useState(false);
  const [syncToAppleCalendar, setSyncToAppleCalendar] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);
  
  const navigation = useNavigation();
  const route = useRoute();
  const { db } = useBasic();
  
  const friend = (route.params as any)?.friend as Friend;

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

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleCreateMeeting = async () => {
    setIsCreating(true);

    try {
      if (!db) {
        Alert.alert('Database Error', 'Database not available. Please try signing in again.');
        setIsCreating(false);
        return;
      }

      const meetingData = {
        friendId: friend.id,
        date: selectedDate.toISOString(),
        activity: 'General meetup',
        venue: 'To be decided',
        city: selectedCity || 'To be decided',
        notes: meetingNotes || '',
        createdAt: Date.now(),
      };
      
      console.log('Creating meeting with data:', meetingData);
      
      const newMeeting = await db.from('meetings').add(meetingData);
      console.log('Meeting created successfully:', newMeeting);

      // Handle calendar syncing
      if (syncToGoogleCalendar || syncToOutlook || syncToAppleCalendar) {
        try {
          await sendCalendarInvite({
            friendName: friend.name,
            friendEmail: friend.email || '',
            date: selectedDate,
            city: selectedCity,
            notes: meetingNotes,
            syncToGoogle: syncToGoogleCalendar,
            syncToOutlook: syncToOutlook,
            syncToApple: syncToAppleCalendar,
          });
        } catch (error) {
          console.error('Error syncing to calendar:', error);
        }
      }

      // Handle email invitation
      if (sendEmail && friend.email) {
        try {
          await sendEmailInvite({
            friendName: friend.name,
            friendEmail: friend.email,
            date: selectedDate,
            city: selectedCity,
            notes: meetingNotes,
          });
        } catch (error) {
          console.error('Error sending email:', error);
        }
      }

      Alert.alert('Success', 'Meeting scheduled successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error creating meeting:', error);
      Alert.alert('Error', 'Failed to schedule meeting. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

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
        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Select Date</Text>
          <TouchableOpacity
            style={styles.dateSelector}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateSelectorText}>
              {formatDate(selectedDate)}
            </Text>
            <Text style={styles.calendarIcon}>📅</Text>
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>

        {/* City Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Select City</Text>
          <CitySelector
            selectedCity={selectedCity}
            onCitySelect={setSelectedCity}
          />
        </View>

        {/* Calendar Sync */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Sync to Calendar</Text>
          
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setSyncToGoogleCalendar(!syncToGoogleCalendar)}
          >
            <View style={[styles.checkbox, syncToGoogleCalendar && styles.checkboxChecked]}>
              {syncToGoogleCalendar && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <View style={styles.checkboxContent}>
              <Text style={styles.checkboxTitle}>Google Calendar</Text>
              <Text style={styles.checkboxSubtitle}>Add to device calendar + download ICS</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setSyncToOutlook(!syncToOutlook)}
          >
            <View style={[styles.checkbox, syncToOutlook && styles.checkboxChecked]}>
              {syncToOutlook && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <View style={styles.checkboxContent}>
              <Text style={styles.checkboxTitle}>Outlook</Text>
              <Text style={styles.checkboxSubtitle}>Download ICS file for import</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setSyncToAppleCalendar(!syncToAppleCalendar)}
          >
            <View style={[styles.checkbox, syncToAppleCalendar && styles.checkboxChecked]}>
              {syncToAppleCalendar && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <View style={styles.checkboxContent}>
              <Text style={styles.checkboxTitle}>Apple Calendar</Text>
              <Text style={styles.checkboxSubtitle}>Add to device calendar</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Email Invitation */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setSendEmail(!sendEmail)}
          >
            <View style={[styles.checkbox, sendEmail && styles.checkboxChecked]}>
              {sendEmail && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <View style={styles.checkboxContent}>
              <Text style={styles.emailTitle}>📧 Send this to an e-mail if you would like to:</Text>
              <Text style={styles.emailSubtitle}>(E-mail with meeting details)</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Additional Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Additional Details</Text>
          <Text style={styles.detailsHint}>• Click outside the box once filled</Text>
          <Text style={styles.detailsHint}>• This will be included in calendar invites and email invitations</Text>
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
            {isCreating ? 'Creating Meetup...' : 'Schedule Meetup'}
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
  },
  dateSelector: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  dateSelectorText: {
    fontSize: 16,
    color: '#333333',
  },
  calendarIcon: {
    fontSize: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
    paddingVertical: 5,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#8000FF',
    borderRadius: 4,
    marginRight: 15,
    marginTop: 2,
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
  checkboxContent: {
    flex: 1,
  },
  checkboxTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  checkboxSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  emailTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  emailSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  detailsHint: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 5,
    fontStyle: 'italic',
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
    marginTop: 10,
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