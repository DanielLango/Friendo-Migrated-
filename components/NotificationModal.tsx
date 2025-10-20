import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { useBasic } from '@basictech/expo';
import { Friend } from '../types';
import { notificationService } from '../utils/notificationService';
import SimpleTimePicker from './SimpleTimePicker';

interface NotificationModalProps {
  visible: boolean;
  friend: Friend;
  onClose: () => void;
}

export default function NotificationModal({ visible, friend, onClose }: NotificationModalProps) {
  const [selectedFrequency, setSelectedFrequency] = useState<'days' | 'weekly' | 'monthly'>(friend.notificationFrequency || 'days');
  const [customDays, setCustomDays] = useState((friend.notificationDays || 7).toString());
  const [notificationTime, setNotificationTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const { db } = useBasic();

  const handleTimeChange = (selectedTime: Date) => {
    setNotificationTime(selectedTime);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleSave = async () => {
    if (db) {
      try {
        let days = parseInt(customDays) || 1;
        if (selectedFrequency === 'weekly') {
          days = days * 7;
        } else if (selectedFrequency === 'monthly') {
          days = days * 30;
        }

        // Update database
        await db.from('friends').update(friend.id, {
          notificationFrequency: selectedFrequency,
          notificationDays: days,
        });

        // Schedule the actual notification (only works on mobile)
        await notificationService.scheduleNotification(
          friend.id,
          friend.name,
          days
        );

        if (Platform.OS === 'web') {
          Alert.alert(
            'Settings Saved', 
            `Notification preferences saved! Note: Push notifications only work on mobile devices. When you use this app on your phone, you'll receive reminders to reconnect with ${friend.name} every ${days} day${days === 1 ? '' : 's'}.`
          );
        } else {
          Alert.alert('Success', `Notification set! You'll be reminded to reconnect with ${friend.name} in ${days} day${days === 1 ? '' : 's'}.`);
        }
        
        onClose();
      } catch (error) {
        console.error('Error updating notification settings:', error);
        Alert.alert('Error', 'Failed to update settings. Please try again.');
      }
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Notify me to see {friend.name} in:</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => setSelectedFrequency('days')}
            >
              <View style={[styles.radio, selectedFrequency === 'days' && styles.radioSelected]} />
              <Text style={styles.optionText}>days</Text>
              {selectedFrequency === 'days' && (
                <View style={styles.daysContainer}>
                  <Text style={styles.everyText}>every</Text>
                  <TextInput
                    style={styles.input}
                    value={customDays}
                    onChangeText={setCustomDays}
                    keyboardType="numeric"
                    placeholder="7"
                  />
                  <Text style={styles.everyText}>days</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => setSelectedFrequency('weekly')}
            >
              <View style={[styles.radio, selectedFrequency === 'weekly' && styles.radioSelected]} />
              <Text style={styles.optionText}>weekly</Text>
              {selectedFrequency === 'weekly' && (
                <View style={styles.weeklyContainer}>
                  <Text style={styles.everyText}>every</Text>
                  <TextInput
                    style={styles.input}
                    value={customDays}
                    onChangeText={setCustomDays}
                    keyboardType="numeric"
                    placeholder="1"
                  />
                  <Text style={styles.everyText}>weeks</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => setSelectedFrequency('monthly')}
            >
              <View style={[styles.radio, selectedFrequency === 'monthly' && styles.radioSelected]} />
              <Text style={styles.optionText}>monthly</Text>
              {selectedFrequency === 'monthly' && (
                <View style={styles.monthlyContainer}>
                  <Text style={styles.everyText}>every</Text>
                  <TextInput
                    style={styles.input}
                    value={customDays}
                    onChangeText={setCustomDays}
                    keyboardType="numeric"
                    placeholder="1"
                  />
                  <Text style={styles.everyText}>months</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.timeSection}>
            <Text style={styles.timeSectionTitle}>🕐 Notification Time</Text>
            <TouchableOpacity
              style={styles.timeSelector}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.timeSelectorText}>
                {formatTime(notificationTime)}
              </Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showTimePicker && (
        <Modal
          visible={showTimePicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowTimePicker(false)}
        >
          <View style={styles.timePickerOverlay}>
            <View style={styles.timePickerModal}>
              <View style={styles.timePickerHeader}>
                <Text style={styles.timePickerTitle}>Select Time</Text>
                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                  <Text style={styles.timePickerDoneButton}>Done</Text>
                </TouchableOpacity>
              </View>
              <SimpleTimePicker
                value={notificationTime}
                onChange={handleTimeChange}
              />
            </View>
          </View>
        </Modal>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '85%',
    maxWidth: 320,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
  },
  closeButton: {
    fontSize: 18,
    color: '#666666',
    marginLeft: 10,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#8000FF',
    marginRight: 12,
  },
  radioSelected: {
    backgroundColor: '#8000FF',
  },
  optionText: {
    fontSize: 16,
    color: '#333333',
    marginRight: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    width: 50,
    textAlign: 'center',
  },
  daysContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weeklyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthlyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  everyText: {
    fontSize: 14,
    color: '#666666',
    marginHorizontal: 5,
  },
  timeSection: {
    marginBottom: 20,
  },
  timeSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 10,
  },
  timeSelector: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  timeSelectorText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  dropdownIcon: {
    fontSize: 10,
    color: '#666666',
  },
  timePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  timePickerModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  timePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  timePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  timePickerDoneButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8000FF',
  },
  saveButton: {
    backgroundColor: '#8000FF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
