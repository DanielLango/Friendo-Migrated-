import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Friend } from '../types';
import { getFriends } from '../utils/storage';
import SimpleTimePicker from '../components/SimpleTimePicker';
import { useTheme } from '../utils/themeContext';

export default function BatchNotificationsScreen() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set());
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedDate, setSelectedDate] = useState(1);
  const { colors } = useTheme();
  
  const navigation = useNavigation();

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      const friendsData = await getFriends();
      setFriends(friendsData);
    } catch (error) {
      console.error('Error loading friends:', error);
      Alert.alert('Error', 'Failed to load friends. Please try again.');
    }
  };

  const toggleFriendSelection = (friendId: string) => {
    const newSelection = new Set(selectedFriends);
    if (newSelection.has(friendId)) {
      newSelection.delete(friendId);
    } else {
      newSelection.add(friendId);
    }
    setSelectedFriends(newSelection);
  };

  const handleSave = () => {
    if (selectedFriends.size === 0) {
      Alert.alert('No Friends Selected', 'Please select at least one friend.');
      return;
    }

    const timeString = selectedTime.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });

    Alert.alert(
      'Batch Notifications Set',
      `Notifications will be sent ${frequency} at ${timeString} for ${selectedFriends.size} friend(s).`,
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, {
        backgroundColor: colors.cardBackground,
        borderBottomColor: colors.border
      }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backButton, { color: colors.purple }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Batch Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Friends</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Choose which friends to include in this batch notification
          </Text>
          
          {friends.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>No friends added yet</Text>
              <Text style={[styles.emptyStateSubtext, { color: colors.textTertiary }]}>Add friends first to use batch notifications</Text>
            </View>
          ) : (
            <View style={styles.friendsList}>
              {friends.map((friend) => (
                <TouchableOpacity
                  key={friend.id}
                  style={[
                    styles.friendItem,
                    { 
                      backgroundColor: colors.isDarkMode ? '#2A2A2A' : '#F8F9FA',
                      borderColor: selectedFriends.has(friend.id) ? colors.purple : 'transparent'
                    },
                    selectedFriends.has(friend.id) && {
                      backgroundColor: colors.isDarkMode ? 'rgba(168, 85, 247, 0.2)' : '#F3EDFF'
                    }
                  ]}
                  onPress={() => toggleFriendSelection(friend.id)}
                >
                  <View style={styles.friendInfo}>
                    <Text style={[styles.friendName, { color: colors.text }]}>{friend.name}</Text>
                    <Text style={[styles.friendType, { color: colors.textSecondary }]}>{friend.friendType}</Text>
                  </View>
                  <View style={[
                    styles.checkbox,
                    { borderColor: colors.purple },
                    selectedFriends.has(friend.id) && { backgroundColor: colors.purple }
                  ]}>
                    {selectedFriends.has(friend.id) && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Frequency</Text>
          <View style={styles.frequencyButtons}>
            <TouchableOpacity
              style={[
                styles.frequencyButton,
                { 
                  backgroundColor: colors.isDarkMode ? '#2A2A2A' : '#F8F9FA',
                  borderColor: colors.border
                },
                frequency === 'daily' && { 
                  backgroundColor: colors.purple,
                  borderColor: colors.purple
                }
              ]}
              onPress={() => setFrequency('daily')}
            >
              <Text style={[
                styles.frequencyButtonText,
                { color: colors.textSecondary },
                frequency === 'daily' && styles.frequencyButtonTextActive
              ]}>
                Daily
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.frequencyButton,
                { 
                  backgroundColor: colors.isDarkMode ? '#2A2A2A' : '#F8F9FA',
                  borderColor: colors.border
                },
                frequency === 'weekly' && { 
                  backgroundColor: colors.purple,
                  borderColor: colors.purple
                }
              ]}
              onPress={() => setFrequency('weekly')}
            >
              <Text style={[
                styles.frequencyButtonText,
                { color: colors.textSecondary },
                frequency === 'weekly' && styles.frequencyButtonTextActive
              ]}>
                Weekly
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.frequencyButton,
                { 
                  backgroundColor: colors.isDarkMode ? '#2A2A2A' : '#F8F9FA',
                  borderColor: colors.border
                },
                frequency === 'monthly' && { 
                  backgroundColor: colors.purple,
                  borderColor: colors.purple
                }
              ]}
              onPress={() => setFrequency('monthly')}
            >
              <Text style={[
                styles.frequencyButtonText,
                { color: colors.textSecondary },
                frequency === 'monthly' && styles.frequencyButtonTextActive
              ]}>
                Monthly
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {frequency === 'weekly' && (
          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Day of Week</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.dayButtons}>
                {weekDays.map((day, index) => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayButton,
                      { 
                        backgroundColor: colors.isDarkMode ? '#2A2A2A' : '#F8F9FA',
                        borderColor: colors.border
                      },
                      selectedDay === index && { 
                        backgroundColor: colors.purple,
                        borderColor: colors.purple
                      }
                    ]}
                    onPress={() => setSelectedDay(index)}
                  >
                    <Text style={[
                      styles.dayButtonText,
                      { color: colors.textSecondary },
                      selectedDay === index && styles.dayButtonTextActive
                    ]}>
                      {day.slice(0, 3)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {frequency === 'monthly' && (
          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Day of Month</Text>
            <View style={styles.dateSelector}>
              <Text style={[styles.dateSelectorLabel, { color: colors.text }]}>Day:</Text>
              <View style={styles.dateButtons}>
                {[1, 5, 10, 15, 20, 25].map((date) => (
                  <TouchableOpacity
                    key={date}
                    style={[
                      styles.dateButton,
                      { 
                        backgroundColor: colors.isDarkMode ? '#2A2A2A' : '#F8F9FA',
                        borderColor: colors.border
                      },
                      selectedDate === date && { 
                        backgroundColor: colors.purple,
                        borderColor: colors.purple
                      }
                    ]}
                    onPress={() => setSelectedDate(date)}
                  >
                    <Text style={[
                      styles.dateButtonText,
                      { color: colors.textSecondary },
                      selectedDate === date && styles.dateButtonTextActive
                    ]}>
                      {date}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Time</Text>
          <SimpleTimePicker
            value={selectedTime}
            onChange={setSelectedTime}
          />
        </View>

        <View style={[styles.summarySection, {
          backgroundColor: colors.isDarkMode ? 'rgba(168, 85, 247, 0.2)' : '#F3EDFF',
          borderColor: colors.purple
        }]}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>Summary</Text>
          <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
            {selectedFriends.size} friend(s) selected
          </Text>
          <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
            Notifications will be sent {frequency}
            {frequency === 'weekly' && ` on ${weekDays[selectedDay]}`}
            {frequency === 'monthly' && ` on day ${selectedDate}`}
            {' '}at {selectedTime.toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true 
            })}
          </Text>
        </View>

        <TouchableOpacity 
          style={[
            styles.saveButton,
            { backgroundColor: colors.green },
            selectedFriends.size === 0 && { backgroundColor: colors.textDisabled }
          ]} 
          onPress={handleSave}
          disabled={selectedFriends.size === 0}
        >
          <Text style={styles.saveButtonText}>Save Batch Notifications</Text>
        </TouchableOpacity>
      </ScrollView>
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
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 50,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 12,
  },
  friendsList: {
    gap: 8,
  },
  friendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  friendType: {
    fontSize: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  frequencyButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  frequencyButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  frequencyButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  frequencyButtonTextActive: {
    color: '#FFFFFF',
  },
  dayButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  dayButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dayButtonTextActive: {
    color: '#FFFFFF',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateSelectorLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 12,
  },
  dateButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    flex: 1,
  },
  dateButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
  },
  dateButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dateButtonTextActive: {
    color: '#FFFFFF',
  },
  summarySection: {
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    marginBottom: 4,
  },
  saveButton: {
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 20,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});