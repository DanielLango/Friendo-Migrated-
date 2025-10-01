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

export default function MeetingCreateScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [meetingNotes, setMeetingNotes] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
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
        city: 'To be decided',
        notes: meetingNotes || '',
        createdAt: Date.now(),
      };
      
      console.log('Creating meeting with data:', meetingData);
      
      const newMeeting = await db.from('meetings').add(meetingData);
      console.log('Meeting created successfully:', newMeeting);

      Alert.alert('Success', 'Meeting scheduled successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error creating meeting:', error);
      Alert.alert('Error', 'Failed to schedule meeting. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Select Date</Text>
          <Text style={styles.sectionSubtitle}>Choose when you want to meet:</Text>
          
          <TouchableOpacity
            style={[styles.dateOption, selectedDate.toDateString() === new Date().toDateString() && styles.dateOptionSelected]}
            onPress={() => setSelectedDate(new Date())}
          >
            <Text style={[styles.dateOptionText, selectedDate.toDateString() === new Date().toDateString() && styles.dateOptionTextSelected]}>
              Today - {formatDate(new Date())}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dateOption, selectedDate.toDateString() === addDays(new Date(), 1).toDateString() && styles.dateOptionSelected]}
            onPress={() => setSelectedDate(addDays(new Date(), 1))}
          >
            <Text style={[styles.dateOptionText, selectedDate.toDateString() === addDays(new Date(), 1).toDateString() && styles.dateOptionTextSelected]}>
              Tomorrow - {formatDate(addDays(new Date(), 1))}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dateOption, selectedDate.toDateString() === addDays(new Date(), 7).toDateString() && styles.dateOptionSelected]}
            onPress={() => setSelectedDate(addDays(new Date(), 7))}
          >
            <Text style={[styles.dateOptionText, selectedDate.toDateString() === addDays(new Date(), 7).toDateString() && styles.dateOptionTextSelected]}>
              Next Week - {formatDate(addDays(new Date(), 7))}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dateOption, selectedDate.toDateString() === addDays(new Date(), 14).toDateString() && styles.dateOptionSelected]}
            onPress={() => setSelectedDate(addDays(new Date(), 14))}
          >
            <Text style={[styles.dateOptionText, selectedDate.toDateString() === addDays(new Date(), 14).toDateString() && styles.dateOptionTextSelected]}>
              In 2 Weeks - {formatDate(addDays(new Date(), 14))}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Meeting Notes</Text>
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
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 15,
  },
  dateOption: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  dateOptionSelected: {
    borderColor: '#8000FF',
    backgroundColor: '#F8F4FF',
  },
  dateOptionText: {
    fontSize: 16,
    color: '#333333',
  },
  dateOptionTextSelected: {
    color: '#8000FF',
    fontWeight: '600',
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