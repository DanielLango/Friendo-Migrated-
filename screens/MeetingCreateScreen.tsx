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
import { useTheme } from '../utils/themeContext';

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
  const [showInstructions, setShowInstructions] = useState(false);
  const { colors } = useTheme();
  
  const navigation = useNavigation();
  const route = useRoute();
  
  const friend = (route.params as any)?.friend as Friend;

  if (!friend) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, {
          backgroundColor: colors.cardBackground,
          borderBottomColor: colors.border
        }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backButton, { color: colors.purple }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Error</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ fontSize: 16, color: colors.textSecondary, textAlign: 'center' }}>
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
    setSelectedVenue('');
  };

  const handleCitySelect = (city: string, placeId: string) => {
    setSelectedCity(city);
    setCityPlaceId(placeId);
    setSelectedVenue('');
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
        status: 'scheduled' as const,
        createdAt: Date.now(),
      };
      
      console.log('Creating meeting with data:', meetingData);
      
      await addMeeting(meetingData);
      console.log('Meeting created successfully');

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
      }

      const shouldShow = await shouldShowPaywall();
      if (shouldShow) {
        await markPaywallShown();
        setShowPaywall(true);
        return;
      }

      if (calendarOption === 'device') {
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
    Alert.alert('Success', 'Meeting scheduled successfully!');
    navigation.goBack();
  };

  const selectedCategoryData = getVenueCategory(selectedCategory);

  if (showPaywall) {
    return (
      <Modal visible={true} animationType="slide" presentationStyle="fullScreen">
        <Paywall onClose={handlePaywallClose} onSuccess={handlePaywallClose} />
      </Modal>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, {
        backgroundColor: colors.cardBackground,
        borderBottomColor: colors.border
      }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backButton, { color: colors.purple }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Schedule with {friend?.name}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>📅 Select Date</Text>
          <TouchableOpacity
            style={[styles.dateSelector, {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border
            }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={[styles.dateSelectorText, { color: colors.text }]}>
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>📍 Select City</Text>
          <SimpleCitySelector
            selectedCity={selectedCity}
            onCitySelect={handleCitySelect}
            placeholder="Choose a city..."
          />
        </View>

        {selectedCity && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>🎯 Type of Activity</Text>
            <VenueCategorySelector
              selectedCategory={selectedCategory}
              onCategorySelect={handleCategorySelect}
              selectedCity={selectedCity}
            />
            
            {selectedCategory && (
              <View style={[styles.partnershipSection, {
                backgroundColor: colors.isDarkMode ? '#1E1E1E' : '#F8F9FA',
                borderColor: colors.border
              }]}>
                <View style={styles.partnershipHeader}>
                  <Text style={styles.partnershipIcon}>🏪</Text>
                  <View style={styles.partnershipHeaderText}>
                    <Text style={[styles.partnershipTitle, { color: colors.text }]}>
                      Highlighted Advertisement Partners
                    </Text>
                    <Text style={[styles.partnershipSubtitle, { color: colors.textSecondary }]}>
                      No partner venues yet in {selectedCity}
                    </Text>
                    <Text style={[styles.partnershipSubtitle, { color: colors.textSecondary }]}>
                      We're working on partnerships with local restaurants in your area!
                    </Text>
                  </View>
                </View>
                
                <View style={styles.partnershipBoxes}>
                  <View style={[styles.partnershipBox, {
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.border
                  }]}>
                    <Text style={[styles.partnershipBoxTitle, { color: colors.text }]}>Want to be featured on this list?</Text>
                    <Text style={[styles.partnershipBoxText, { color: colors.textSecondary }]}>
                      Submit your venue here — get your business on our upcoming list of top 5 spots locals are recommended to in each city.
                    </Text>
                    <TouchableOpacity 
                      style={[styles.partnershipButton, { backgroundColor: colors.purple }]}
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
                  
                  <View style={[styles.partnershipBox, {
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.border
                  }]}>
                    <Text style={[styles.partnershipBoxTitle, { color: colors.text }]}>Want to help promote great local spots?</Text>
                    <Text style={[styles.partnershipBoxText, { color: colors.textSecondary }]}>
                      Join our soon-starting affiliate program and earn small commissions by helping great venues get discovered.
                    </Text>
                    <TouchableOpacity 
                      style={[styles.partnershipButton, { backgroundColor: colors.purple }]}
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
                    {
                      backgroundColor: colors.cardBackground,
                      borderColor: colors.border
                    },
                    activityConfirmed && { 
                      backgroundColor: colors.purple,
                      borderColor: colors.purple
                    }
                  ]}
                  onPress={() => setActivityConfirmed(!activityConfirmed)}
                >
                  <Text style={[
                    styles.activityConfirmIcon,
                    { color: colors.textSecondary },
                    activityConfirmed && styles.activityConfirmIconActive
                  ]}>📍</Text>
                  <Text style={[
                    styles.activityConfirmText,
                    { color: colors.textSecondary },
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
            <View style={[styles.parkInfo, {
              backgroundColor: colors.isDarkMode ? 'rgba(128, 0, 255, 0.2)' : '#F0F8FF',
              borderColor: colors.purple
            }]}>
              <Text style={styles.parkInfoIcon}>🌳</Text>
              <View style={styles.parkInfoText}>
                <Text style={[styles.parkInfoTitle, { color: colors.purple }]}>Park Activity Selected</Text>
                <Text style={[styles.parkInfoSubtext, { color: colors.textSecondary }]}>
                  Perfect for outdoor meetups! You can choose the specific park when you meet.
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>📅 Calendar Options</Text>
          
          <TouchableOpacity
            style={[
              styles.primaryCalendarButton,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border
              },
              calendarOption === 'device' && { 
                backgroundColor: colors.purple,
                borderColor: colors.purple
              }
            ]}
            onPress={() => setCalendarOption(calendarOption === 'device' ? null : 'device')}
          >
            <Text style={styles.primaryCalendarIcon}>📱</Text>
            <View style={styles.primaryCalendarContent}>
              <Text style={[
                styles.primaryCalendarTitle,
                { color: colors.text },
                calendarOption === 'device' && styles.primaryCalendarTitleActive
              ]}>
                Add to My Calendar
              </Text>
              <Text style={[
                styles.primaryCalendarSubtext,
                { color: colors.textSecondary },
                calendarOption === 'device' && styles.primaryCalendarSubtextActive
              ]}>
                Uses your phone's calendar app
              </Text>
            </View>
            <View style={[
              styles.radioButton,
              { borderColor: colors.purple },
              calendarOption === 'device' && styles.radioButtonActive
            ]}>
              {calendarOption === 'device' && <View style={styles.radioButtonInner} />}
            </View>
          </TouchableOpacity>

          <View style={[styles.manualImportContainer, {
            backgroundColor: colors.isDarkMode ? '#1E1E1E' : '#F8F9FA',
            borderColor: colors.border
          }]}>
            <Text style={[styles.manualImportHeader, { color: colors.textSecondary }]}>📄 MANUAL IMPORT</Text>
            <TouchableOpacity
              style={[
                styles.manualImportButton,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.border
                },
                calendarOption === 'manual' && {
                  borderColor: colors.purple,
                  backgroundColor: colors.isDarkMode ? 'rgba(168, 85, 247, 0.2)' : '#F8F4FF'
                }
              ]}
              onPress={() => setCalendarOption(calendarOption === 'manual' ? null : 'manual')}
            >
              <View style={[
                styles.checkbox,
                { borderColor: colors.purple },
                calendarOption === 'manual' && { backgroundColor: colors.purple }
              ]}>
                {calendarOption === 'manual' && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={styles.manualImportContent}>
                <Text style={[styles.manualImportTitle, { color: colors.text }]}>Download .ics file</Text>
                <Text style={[styles.manualImportSubtext, { color: colors.textSecondary }]}>Works with any calendar app</Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.instructionsHeader, {
              backgroundColor: colors.isDarkMode ? 'rgba(59, 130, 246, 0.2)' : '#F0F4FF',
              borderColor: colors.isDarkMode ? 'rgba(59, 130, 246, 0.4)' : '#D0DCFF'
            }]}
            onPress={() => setShowInstructions(!showInstructions)}
            activeOpacity={0.7}
          >
            <View style={styles.instructionsHeaderContent}>
              <Text style={[styles.instructionsHeaderTitle, { color: colors.text }]}>
                What to do now?
              </Text>
              <Text style={[styles.instructionsHeaderSubtitle, { color: colors.textSecondary }]}>
                (In case you selected a calendar option)
              </Text>
            </View>
            <Text style={[
              styles.instructionsDropdownIcon,
              { color: colors.purple },
              showInstructions && styles.instructionsDropdownIconOpen
            ]}>
              ▼
            </Text>
          </TouchableOpacity>

          {showInstructions && (
            <View style={[styles.instructionsBox, {
              backgroundColor: colors.isDarkMode ? 'rgba(59, 130, 246, 0.2)' : '#F0F4FF',
              borderColor: colors.isDarkMode ? 'rgba(59, 130, 246, 0.4)' : '#D0DCFF'
            }]}>
              <View style={styles.instructionsList}>
                <Text style={[styles.instructionText, { color: colors.text }]}>
                  After tapping 'Schedule Meetup':{'\n'}1.) In case you selected the Add to my calendar option, open your smartphone's default calendar app, and navigate to the day you selected for the meetup.{'\n'}2.) in case you selected Download .ics file navigate to the folder you downloaded it and open it.
                </Text>

                <Text style={[styles.instructionsSubheading, { color: colors.text }]}>
                  Once the meeting invite is in front of you in your calendar:
                </Text>

                <View style={styles.instructionItem}>
                  <Text style={[styles.bulletPoint, { color: colors.purple }]}>•</Text>
                  <Text style={[styles.instructionText, { color: colors.text }]}>
                    Edit the event time in the calendar as needed.
                  </Text>
                </View>

                <View style={styles.instructionItem}>
                  <Text style={[styles.bulletPoint, { color: colors.purple }]}>•</Text>
                  <Text style={[styles.instructionText, { color: colors.text }]}>
                    Under Invitee, you can add an email if you want. Your default calendar app will then send the invitation to that email.
                  </Text>
                </View>

                <View style={styles.instructionItem}>
                  <Text style={[styles.bulletPoint, { color: colors.purple }]}>•</Text>
                  <Text style={[styles.instructionText, { color: colors.text }]}>
                    Feel free to change any other details about your meeting.
                  </Text>
                </View>
              </View>
            </View>
          )}

          <View style={[styles.proTipBox, {
            backgroundColor: colors.isDarkMode ? 'rgba(245, 124, 0, 0.2)' : '#FFF9E6',
            borderColor: colors.isDarkMode ? 'rgba(245, 124, 0, 0.4)' : '#FFE082'
          }]}>
            <Text style={styles.proTipIcon}>💡</Text>
            <Text style={[styles.proTipText, { color: colors.text }]}>
              <Text style={[styles.proTipBold, { color: colors.orange }]}>Pro Tip:</Text> You can also log past meetings or ones initiated by your friends, so your history and Met/Scheduled tokens stay accurate.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>📝 What's the plan? Fill it in here!</Text>
          <View style={styles.notesHints}>
            <Text style={[styles.notesHint, { color: colors.textTertiary }]}>
              • Click outside the box once filled
            </Text>
            <Text style={[styles.notesHint, { color: colors.textTertiary }]}>
              • Add any details about the meeting
            </Text>
          </View>
          <TextInput
            style={[styles.notesInput, {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
              color: colors.text
            }]}
            value={meetingNotes}
            onChangeText={setMeetingNotes}
            placeholder="Add any details about the meeting... (e.g., 'Looking forward to catching up!' or 'Let's discuss the project')"
            placeholderTextColor={colors.textTertiary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity 
          style={[
            styles.createButton,
            { backgroundColor: colors.green },
            isCreating && { backgroundColor: colors.textDisabled }
          ]} 
          onPress={handleCreateMeeting}
          disabled={isCreating}
        >
          <Text style={styles.createButtonText}>
            {isCreating ? 'Creating Meetup...' : 'Schedule Meetup'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {showDatePicker && (
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.datePickerModalOverlay}>
            <View style={[styles.datePickerModalContent, { backgroundColor: colors.modalBackground }]}>
              <View style={[styles.datePickerHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.datePickerTitle, { color: colors.text }]}>Select Date</Text>
                <TouchableOpacity onPress={handleDatePickerDone}>
                  <Text style={[styles.datePickerDoneButton, { color: colors.purple }]}>Done</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  backButton: {
    fontSize: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
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
    marginBottom: 15,
  },
  dateSelector: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateSelectorText: {
    fontSize: 16,
  },
  dropdownIcon: {
    fontSize: 12,
  },
  parkInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
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
    marginBottom: 4,
  },
  parkInfoSubtext: {
    fontSize: 14,
    lineHeight: 18,
  },
  partnershipSection: {
    marginTop: 20,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
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
    marginBottom: 4,
  },
  partnershipSubtitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  partnershipBoxes: {
    gap: 12,
  },
  partnershipBox: {
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
  },
  partnershipBoxTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  partnershipBoxText: {
    fontSize: 13,
    lineHeight: 16,
    marginBottom: 10,
  },
  partnershipButton: {
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
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    borderWidth: 2,
  },
  activityConfirmIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  activityConfirmIconActive: {
    color: '#FFFFFF',
  },
  activityConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  activityConfirmTextActive: {
    color: '#FFFFFF',
  },
  primaryCalendarButton: {
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 3,
    marginBottom: 20,
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
    marginBottom: 4,
  },
  primaryCalendarTitleActive: {
    color: '#FFFFFF',
  },
  primaryCalendarSubtext: {
    fontSize: 14,
  },
  primaryCalendarSubtextActive: {
    color: '#E8D5FF',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
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
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  manualImportHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 12,
  },
  manualImportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  manualImportContent: {
    flex: 1,
    marginLeft: 12,
  },
  manualImportTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  manualImportSubtext: {
    fontSize: 13,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  instructionsBox: {
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
  },
  instructionsSubheading: {
    fontSize: 14,
    fontWeight: '600',
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
    marginRight: 8,
    marginTop: 2,
    fontWeight: 'bold',
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 100,
  },
  notesHint: {
    fontSize: 11,
    fontStyle: 'italic',
    marginBottom: 2,
  },
  notesHints: {
    marginBottom: 10,
  },
  createButton: {
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
  datePickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  datePickerModalContent: {
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
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  datePickerDoneButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  proTipBox: {
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
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
    lineHeight: 20,
  },
  proTipBold: {
    fontWeight: 'bold',
  },
  instructionsHeader: {
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  instructionsHeaderContent: {
    flex: 1,
  },
  instructionsHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  instructionsHeaderSubtitle: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  instructionsDropdownIcon: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  instructionsDropdownIconOpen: {
    transform: [{ rotate: '180deg' }],
  },
});