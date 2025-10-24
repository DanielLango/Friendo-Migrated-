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
import { getVenueCategory } from '../utils/venueTypes';
import { notificationService } from '../utils/notificationService';
import SimpleDatePicker from '../components/SimpleDatePicker';
import { createMeetingEvent, createAndDownloadMeetingICS } from '../utils/calendarUtils';
import { addMeeting } from '../utils/storage';
import Paywall from '../components/Paywall';
import { shouldShowPaywall, markPaywallShown } from '../utils/paywallUtils';

export default function MeetingCreateScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedVenue, setSelectedVenue] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState('');
  const [cityPlaceId, setCityPlaceId] = useState('');
  const [calendarOption, setCalendarOption] = useState<'device' | 'manual' | null>(null);
  const [meetingNotes, setMeetingNotes] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [activityConfirmed, setActivityConfirmed] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  
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

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
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
      await addMeeting(meetingData);
      console.log('Meeting created successfully');

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

      // Check if we should show the paywall
      const shouldShow = await shouldShowPaywall();
      if (shouldShow) {
        await markPaywallShown();
        setShowPaywall(true);
        return; // Don't navigate back yet, wait for paywall to close
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
      Alert.alert('Error', 'Failed to schedule meeting. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handlePaywallClose = () => {
    setShowPaywall(false);
    navigation.goBack();
  };

  const selectedCategoryData = getVenueCategory(selectedCategory);

  // Show paywall modal if needed
  if (showPaywall) {
    return (
      <Modal visible={true} animationType="slide" presentationStyle="fullScreen">
        <Paywall onClose={handlePaywallClose} onSuccess={handlePaywallClose} />
      </Modal>
    );
  }

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
                      We\'re working on partnerships with local restaurants in your area!
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
          <Text style={styles.sectionTitle}>📅 Calendar Options</Text>
          
          {/* Primary Option - Device Calendar */}
          <TouchableOpacity
            style={[
              styles.primaryCalendarButton,
              calendarOption === 'device' && styles.primaryCalendarButtonActive
            ]}
            onPress={() => setCalendarOption(calendarOption === 'device' ? null : 'device')}
          >
            <Text style={styles.primaryCalendarIcon}>📱</Text>
            <View style={styles.primaryCalendarContent}>
              <Text style={[
                styles.primaryCalendarTitle,
                calendarOption === 'device' && styles.primaryCalendarTitleActive
              ]}>
                Add to My Calendar
              </Text>
              <Text style={[
                styles.primaryCalendarSubtext,
                calendarOption === 'device' && styles.primaryCalendarSubtextActive
              ]}>
                Uses your phone\'s calendar app
              </Text>
            </View>
            <View style={[
              styles.radioButton,
              calendarOption === 'device' && styles.radioButtonActive
            ]}>
              {calendarOption === 'device' && <View style={styles.radioButtonInner} />}
            </View>
          </TouchableOpacity>

          {/* Secondary Option - Manual Import */}
          <View style={styles.manualImportContainer}>
            <Text style={styles.manualImportHeader}>📄 MANUAL IMPORT</Text>
            <TouchableOpacity
              style={[
                styles.manualImportButton,
                calendarOption === 'manual' && styles.manualImportButtonActive
              ]}
              onPress={() => setCalendarOption(calendarOption === 'manual' ? null : 'manual')}
            >
              <View style={[
                styles.checkbox,
                calendarOption === 'manual' && styles.checkboxChecked
              ]}>
                {calendarOption === 'manual' && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={styles.manualImportContent}>
                <Text style={styles.manualImportTitle}>Download .ics file</Text>
                <Text style={styles.manualImportSubtext}>Works with any calendar app</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* What to do now instructions */}
          <View style={styles.instructionsBox}>
            <Text style={styles.instructionsTitle}>
              What to do now?
            </Text>
            <Text style={styles.instructionsSubtitle}>
              (In case you selected a calendar option)
            </Text>
            
            <View style={styles.instructionsList}>
              <Text style={styles.instructionText}>
                After tapping 'Schedule Meetup':{'\n'}1.) In case you selected the Add to my calendar option, open your smartphone\'s default calendar app, and navigate to the day you selected for the meetup.{'\n'}2.) in case you selected Download .ics file navigate to the folder you downloaded it and open it.
              </Text>

              <Text style={styles.instructionsSubheading}>
                Once the meeting invite is in front of you in your calendar:
              </Text>

              <View style={styles.instructionItem}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.instructionText}>
                  Edit the event time in the calendar as needed.
                </Text>
              </View>

              <View style={styles.instructionItem}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.instructionText}>
                  Under Invitee, you can add an email if you want. Your default calendar app will then send the invitation to that email.
                </Text>
              </View>

              <View style={styles.instructionItem}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.instructionText}>
                  Feel free to change any other details about your meeting.
                </Text>
              </View>
            </View>
          </View>

          {/* Pro Tip */}
          <View style={styles.proTipBox}>
            <Text style={styles.proTipIcon}>💡</Text>
            <Text style={styles.proTipText}>
              <Text style={styles.proTipBold}>Pro Tip:</Text> You can also log past meetings or ones initiated by your friends, so your history and Met/Scheduled tokens stay accurate.
            </Text>
          </View>
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

      {/* Date Picker Modal - Using custom picker */}
      {showDatePicker && (
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
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
              <SimpleDatePicker
                value={selectedDate}
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

// I'll include the styles in the next message due to length...
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
  primaryCalendarButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#E0E0E0',
    marginBottom: 20,
  },
  primaryCalendarButtonActive: {
    backgroundColor: '#8000FF',
    borderColor: '#8000FF',
  },
  primaryCalendarIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  primaryCalendarContent: {
    flex: 1,
  },
  primaryCalendarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  primaryCalendarTitleActive: {
    color: '#FFFFFF',
  },
  primaryCalendarSubtext: {
    fontSize: 14,
    color: '#666666',
  },
  primaryCalendarSubtextActive: {
    color: '#E8D5FF',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#8000FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  radioButtonActive: {
    borderColor: '#FFFFFF',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  manualImportContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  manualImportHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666666',
    letterSpacing: 1,
    marginBottom: 12,
  },
  manualImportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  manualImportButtonActive: {
    borderColor: '#8000FF',
    backgroundColor: '#F8F4FF',
  },
  manualImportContent: {
    flex: 1,
    marginLeft: 12,
  },
  manualImportTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  manualImportSubtext: {
    fontSize: 13,
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
  instructionsBox: {
    backgroundColor: '#F0F4FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#D0DCFF',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  instructionsSubtitle: {
    fontSize: 13,
    color: '#666666',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  instructionsSubheading: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginTop: 8,
    marginBottom: 8,
  },
  instructionsList: {
    gap: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletPoint: {
    fontSize: 16,
    color: '#8000FF',
    marginRight: 8,
    marginTop: 2,
    fontWeight: 'bold',
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
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
  datePickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  datePickerModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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
  proTipBox: {
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FFE082',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  proTipIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  proTipText: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  proTipBold: {
    fontWeight: 'bold',
    color: '#F57C00',
  },
});
