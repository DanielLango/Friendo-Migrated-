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

export default function BatchNotificationsScreen() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set());
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [selectedTime, setSelectedTime] = useState('11:00');
  const [selectedDay, setSelectedDay] = useState(0); // For weekly: 0-6 (Sun-Sat)
  const [selectedDate, setSelectedDate] = useState(1); // For monthly: 1-31
  
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

    // Here you would save the batch notification settings
    // For now, just show a success message
    Alert.alert(
      'Batch Notifications Set',
      `Notifications will be sent ${frequency} at ${selectedTime} for ${selectedFriends.size} friend(s).`,
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Batch Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Friends</Text>
          <Text style={styles.sectionSubtitle}>
            Choose which friends to include in this batch notification
          </Text>
          
          {friends.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No friends added yet</Text>
              <Text style={styles.emptyStateSubtext}>Add friends first to use batch notifications</Text>
            </View>
          ) : (
            <View style={styles.friendsList}>
              {friends.map((friend) => (
                <TouchableOpacity
                  key={friend.id}
                  style={[
                    styles.friendItem,
                    selectedFriends.has(friend.id) && styles.friendItemSelected
                  ]}
                  onPress={() => toggleFriendSelection(friend.id)}
                >
                  <View style={styles.friendInfo}>
                    <Text style={styles.friendName}>{friend.name}</Text>
                    <Text style={styles.friendType}>{friend.friendType}</Text>
                  </View>
                  <View style={[
                    styles.checkbox,
                    selectedFriends.has(friend.id) && styles.checkboxChecked
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequency</Text>
          <View style={styles.frequencyButtons}>
            <TouchableOpacity
              style={[
                styles.frequencyButton,
                frequency === 'daily' && styles.frequencyButtonActive
              ]}
              onPress={() => setFrequency('daily')}
            >
              <Text style={[
                styles.frequencyButtonText,
                frequency === 'daily' && styles.frequencyButtonTextActive
              ]}>
                Daily
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.frequencyButton,
                frequency === 'weekly' && styles.frequencyButtonActive
              ]}
              onPress={() => setFrequency('weekly')}
            >
              <Text style={[
                styles.frequencyButtonText,
                frequency === 'weekly' && styles.frequencyButtonTextActive
              ]}>
                Weekly
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.frequencyButton,
                frequency === 'monthly' && styles.frequencyButtonActive
              ]}
              onPress={() => setFrequency('monthly')}
            >
              <Text style={[
                styles.frequencyButtonText,
                frequency === 'monthly' && styles.frequencyButtonTextActive
              ]}>
                Monthly
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {frequency === 'weekly' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Day of Week</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.dayButtons}>
                {weekDays.map((day, index) => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayButton,
                      selectedDay === index && styles.dayButtonActive
                    ]}
                    onPress={() => setSelectedDay(index)}
                  >
                    <Text style={[
                      styles.dayButtonText,
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
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Day of Month</Text>
            <View style={styles.dateSelector}>
              <Text style={styles.dateSelectorLabel}>Day:</Text>
              <View style={styles.dateButtons}>
                {[1, 5, 10, 15, 20, 25].map((date) => (
                  <TouchableOpacity
                    key={date}
                    style={[
                      styles.dateButton,
                      selectedDate === date && styles.dateButtonActive
                    ]}
                    onPress={() => setSelectedDate(date)}
                  >
                    <Text style={[
                      styles.dateButtonText,
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Time</Text>
          <SimpleTimePicker
            value={selectedTime}
            onChange={setSelectedTime}
          />
        </View>

        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Summary</Text>
          <Text style={styles.summaryText}>
            {selectedFriends.size} friend(s) selected
          </Text>
          <Text style={styles.summaryText}>
            Notifications will be sent {frequency}
            {frequency === 'weekly' && ` on ${weekDays[selectedDay]}`}
            {frequency === 'monthly' && ` on day ${selectedDate}`}
            {' '}at {selectedTime}
          </Text>
        </View>

        <TouchableOpacity 
          style={[
            styles.saveButton,
            selectedFriends.size === 0 && styles.saveButtonDisabled
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
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    fontSize: 16,
    color: '#8000FF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  placeholder: {
    width: 50,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
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
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 12,
    color: '#999999',
  },
  friendsList: {
    gap: 8,
  },
  friendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  friendItemSelected: {
    backgroundColor: '#F3EDFF',
    borderColor: '#8000FF',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  friendType: {
    fontSize: 12,
    color: '#666666',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#8000FF',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#8000FF',
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
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  frequencyButtonActive: {
    backgroundColor: '#8000FF',
    borderColor: '#8000FF',
  },
  frequencyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
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
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  dayButtonActive: {
    backgroundColor: '#8000FF',
    borderColor: '#8000FF',
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
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
    color: '#333333',
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
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  dateButtonActive: {
    backgroundColor: '#8000FF',
    borderColor: '#8000FF',
  },
  dateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  dateButtonTextActive: {
    color: '#FFFFFF',
  },
  summarySection: {
    padding: 20,
    backgroundColor: '#F3EDFF',
    marginHorizontal: 20,
    marginVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8000FF',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 20,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});