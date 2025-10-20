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
import { useBasic } from '@basictech/expo';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Friend } from '../types';
import SimpleCitySelector from '../components/SimpleCitySelector';
import VenueCategorySelector from '../components/VenueCategorySelector';
import PartnerVenueSelector from '../components/PartnerVenueSelector';
import { getVenueCategory } from '../utils/venueTypes';
import { notificationService } from '../utils/notificationService';

export default function MeetingCreateScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedVenue, setSelectedVenue] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState('');
  const [cityPlaceId, setCityPlaceId] = useState('');
  const [addToCalendar, setAddToCalendar] = useState(false);
  const [meetingNotes, setMeetingNotes] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [activityConfirmed, setActivityConfirmed] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  
  const navigation = useNavigation();
  const route = useRoute();
  const { db, user, isSignedIn } = useBasic();
  
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

  if (!isSignedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Sign In Required</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ fontSize: 16, color: '#666666', textAlign: 'center', marginBottom: 20 }}>
            Please sign in to schedule meetings.
          </Text>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.createButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleDateChange = (event: any, date?: Date) => {
    if (date) {
      setSelectedDate(date);
    }
    // On Android, close immediately after selection
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
  };

  const handleDatePickerDone = () => {
    setShowDatePicker(false);
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
      if (!db) {
        Alert.alert('Database Error', 'Database not available. Please try signing in again.');
        setIsCreating(false);
        return;
      }

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
      
      // Create meeting in database with better error handling
      try {
        const newMeeting = await db.from('meetings').add(meetingData);
        console.log('Meeting created successfully:', newMeeting);
      } catch (dbError) {
        console.error('Database error details:', dbError);
        throw new Error(`Database operation failed: ${dbError.message || 'Unknown database error'}`);
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

      // Show calendar instructions if user selected calendar option
      if (addToCalendar) {
        setShowInstructions(true);
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
      } else if (error.message && error.message.includes('Database')) {
        errorMessage = 'Database error occurred. Please try signing out and back in, then try again.';
      }
      
      Alert.alert('Error', errorMessage);
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
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Select City</Text>
          <SimpleCitySelector
            selectedCity={selectedCity}
            onCitySelect={handleCitySelect}
            placeholder="Choose a city..."
          />
        </View>

        {selectedCity && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 Type of Activity</Text>
            <VenueCategorySelector
              selectedCategory={selectedCategory}
              onCategorySelect={handleCategorySelect}
              selectedCity={selectedCity}
            />
            
            {selectedCategory && (
              <View style={styles.partnershipSection}>
                <View style={styles.partnershipHeader}>
                  <Text style={styles.partnershipIcon}>🏪</Text>
                  <View style={styles.partnershipHeaderText}>
                    <Text style={styles.partnershipTitle}>
                      Highlighted Advertisement Partners
                    </Text>
                    <Text style={styles.partnershipSubtitle}>
                      No partner venues yet in {selectedCity}
                    </Text>
                    <Text style={styles.partnershipSubtitle}>
                      We're working on partnerships with local restaurants in your area!
                    </Text>
                  </View>
                </View>
                
                <View style={styles.partnershipBoxes}>
                  <View style={styles.partnershipBox}>
                    <Text style={styles.partnershipBoxTitle}>Want to be featured on this list?</Text>
                    <Text style={styles.partnershipBoxText}>
                      Submit your venue here — get your business on our upcoming list of top 5 spots locals are recommended to in each city.
                    </Text>
                    <TouchableOpacity 
                      style={styles.partnershipButton}
                      onPress={() => {
                        const url = 'https://www.ambrozitestudios.com/contact-4';
                        Linking.openURL(url).catch(err => {
                          console.error('Failed to open URL:', err);
                          Alert.alert('Error', 'Could not open the link');
                        });
                      }}
                    >
                      <Text style={styles.partnershipButtonText}>Apply here</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.partnershipBox}>
                    <Text style={styles.partnershipBoxTitle}>Want to help promote great local spots?</Text>
                    <Text style={styles.partnershipBoxText}>
                      Join our soon-starting affiliate program and earn small commissions by helping great venues get discovered.
                    </Text>
                    <TouchableOpacity 
                      style={styles.partnershipButton}
                      onPress={() => {
                        const url = 'https://www.ambrozitestudios.com/contact-4';
                        Linking.openURL(url).catch(err => {
                          console.error('Failed to open URL:', err);
                          Alert.alert('Error', 'Could not open the link');
                        });
                      }}
                    >
                      <Text style={styles.partnershipButtonText}>Apply here</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={[
                    styles.activityConfirmButton,
                    activityConfirmed && styles.activityConfirmButtonActive
                  ]}
                  onPress={() => setActivityConfirmed(!activityConfirmed)}
                >
                  <Text style={[
                    styles.activityConfirmIcon,
                    activityConfirmed && styles.activityConfirmIconActive
                  ]}>📍</Text>
                  <Text style={[
                    styles.activityConfirmText,
                    activityConfirmed && styles.activityConfirmTextActive
                  ]}>
                    Select "{getVenueCategory(selectedCategory)?.name || selectedCategory}" as meeting type
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {selectedCategoryData && selectedCategory === 'park' && (
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
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Calendar Option</Text>
          
          <TouchableOpacity
            style={[styles.calendarButton, addToCalendar && styles.calendarButtonActive]}
            onPress={() => setAddToCalendar(!addToCalendar)}
          >
            <View style={[styles.checkbox, addToCalendar && styles.checkboxChecked]}>
              {addToCalendar && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <View style={styles.calendarContent}>
              <Text style={styles.calendarLabel}>📱 Add to Calendar</Text>
              <Text style={styles.calendarSubtext}>Get instructions for adding this to your phone's calendar</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Additional Details</Text>
          <View style={styles.notesHints}>
            <Text style={styles.notesHint}>
              • Click outside the box once filled
            </Text>
            <Text style={styles.notesHint}>
              • Add any details about the meeting
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
            {isCreating ? 'Creating Meetup...' : 'Schedule Meetup'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.datePickerModalOverlay}>
          <View style={styles.datePickerModalContent}>
            <View style={styles.datePickerHeader}>
              <Text style={styles.datePickerTitle}>Select Date</Text>
              <TouchableOpacity onPress={handleDatePickerDone}>
                <Text style={styles.datePickerDoneButton}>Done</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              minimumDate={new Date()}
              style={styles.datePicker}
            />
          </View>
        </View>
      </Modal>

      {/* Calendar Instructions Modal */}
      <Modal
        visible={showInstructions}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowInstructions(false);
          navigation.goBack();
        }}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>What to do now?</Text>
            <TouchableOpacity 
              onPress={() => {
                setShowInstructions(false);
                navigation.goBack();
              }}
              style={styles.modalCloseButton}
            >
              <Text style={styles.modalCloseText}>Done</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.instructionSection}>
              <Text style={styles.instructionTitle}>📱 Calendar Instructions</Text>
              <Text style={styles.instructionSubtitle}>
                (In case you selected a calendar option)
              </Text>
            </View>

            <View style={styles.instructionStep}>
              <Text style={styles.stepNumber}>1.</Text>
              <Text style={styles.stepText}>
                After you clicked on 'Schedule Meetup', go into your smartphone's default calendar app and navigate to the day you have chosen for the meet-up.
              </Text>
            </View>

            <View style={styles.instructionStep}>
              <Text style={styles.stepNumber}>2.</Text>
              <Text style={styles.stepText}>
                Edit the time of the event in the calendar as you wish
              </Text>
            </View>

            <View style={styles.instructionStep}>
              <Text style={styles.stepNumber}>3.</Text>
              <Text style={styles.stepText}>
                Under invitee you can add an email, if you want. Your default calendar app will send the invitation to this email.
              </Text>
            </View>

            <View style={styles.meetingDetails}>
              <Text style={styles.detailsTitle}>📋 Meeting Details</Text>
              <Text style={styles.detailItem}>
                <Text style={styles.detailLabel}>Friend:</Text> {friend.name}
              </Text>
              <Text style={styles.detailItem}>
                <Text style={styles.detailLabel}>Date:</Text> {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </Text>
              <Text style={styles.detailItem}>
                <Text style={styles.detailLabel}>Activity:</Text> {getVenueCategory(selectedCategory)?.name || selectedCategory}
              </Text>
              <Text style={styles.detailItem}>
                <Text style={styles.detailLabel}>City:</Text> {selectedCity}
              </Text>
              {meetingNotes && (
                <Text style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Notes:</Text> {meetingNotes}
                </Text>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  partnershipSection: {
    marginTop: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  partnershipHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  partnershipIcon: {
    fontSize: 32,
    marginRight: 12,
    marginTop: 4,
  },
  partnershipHeaderText: {
    flex: 1,
  },
  partnershipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  partnershipSubtitle: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 18,
  },
  partnershipBoxes: {
    gap: 12,
  },
  partnershipBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  partnershipBoxTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 6,
  },
  partnershipBoxText: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 16,
    marginBottom: 10,
  },
  partnershipButton: {
    backgroundColor: '#8000FF',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  partnershipButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  activityConfirmButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  activityConfirmButtonActive: {
    backgroundColor: '#8000FF',
    borderColor: '#8000FF',
  },
  activityConfirmIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#666666',
  },
  activityConfirmIconActive: {
    color: '#FFFFFF',
  },
  activityConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    textAlign: 'center',
  },
  activityConfirmTextActive: {
    color: '#FFFFFF',
  },
  calendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  calendarButtonActive: {
    backgroundColor: '#F8F9FA',
    borderColor: '#8000FF',
  },
  calendarContent: {
    flex: 1,
    marginLeft: 12,
  },
  calendarLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  calendarSubtext: {
    fontSize: 14,
    color: '#666666',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#8000FF',
    borderRadius: 4,
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
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  modalCloseButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#8000FF',
    borderRadius: 6,
  },
  modalCloseText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  instructionSection: {
    marginTop: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  instructionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  instructionSubtitle: {
    fontSize: 14,
    color: '#666666',
    fontStyle: 'italic',
  },
  instructionStep: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8000FF',
    marginRight: 12,
    marginTop: 2,
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    lineHeight: 22,
  },
  meetingDetails: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    marginBottom: 30,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
  },
  detailItem: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 8,
    lineHeight: 20,
  },
  detailLabel: {
    fontWeight: 'bold',
    color: '#8000FF',
  },
  datePickerContainer: {
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  datePickerDone: {
    backgroundColor: '#8000FF',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  datePickerDoneText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  datePickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  datePickerDoneButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8000FF',
  },
  datePicker: {
    width: '100%',
  },
});
