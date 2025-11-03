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
import { Friend } from '../types';
import { notificationService } from '../utils/notificationService';
import SimpleTimePicker from './SimpleTimePicker';
import { getFriends, saveFriends } from '../utils/storage';
import { useTheme } from '../utils/themeContext';

interface NotificationModalProps {
  visible: boolean;
  friend: Friend;
  onClose: () => void;
}

export default function NotificationModal({ visible, friend, onClose }: NotificationModalProps) {
  const { colors } = useTheme();
  const [selectedFrequency, setSelectedFrequency] = useState<'days' | 'weekly' | 'monthly'>(friend.notificationFrequency || 'days');
  
  // Set default values based on frequency
  const getDefaultValue = () => {
    if (friend.notificationDays) {
      // If friend already has a value, calculate it based on frequency
      if (selectedFrequency === 'weekly') {
        return Math.round(friend.notificationDays / 7).toString();
      } else if (selectedFrequency === 'monthly') {
        return Math.round(friend.notificationDays / 30).toString();
      }
      return friend.notificationDays.toString();
    }
    // Default values for new settings
    if (selectedFrequency === 'weekly') return '3';
    if (selectedFrequency === 'monthly') return '1';
    return '7';
  };
  
  const [customDays, setCustomDays] = useState(getDefaultValue());
  const [notificationTime, setNotificationTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Update customDays when frequency changes
  React.useEffect(() => {
    if (selectedFrequency === 'days') {
      setCustomDays('7');
    } else if (selectedFrequency === 'weekly') {
      setCustomDays('3');
    } else if (selectedFrequency === 'monthly') {
      setCustomDays('1');
    }
  }, [selectedFrequency]);

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
    try {
      let days = parseInt(customDays) || 1;
      if (selectedFrequency === 'weekly') {
        days = days * 7;
      } else if (selectedFrequency === 'monthly') {
        days = days * 30;
      }

      // Update storage
      const friends = await getFriends();
      const updatedFriends = friends.map(f => {
        if (f.id === friend.id) {
          return {
            ...f,
            notificationFrequency: selectedFrequency,
            notificationDays: days,
          };
        }
        return f;
      });
      await saveFriends(updatedFriends);

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
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: colors.modalBackground }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Notify me to see {friend.name} in:</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.closeButton, { color: colors.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => setSelectedFrequency('days')}
            >
              <View style={[styles.radio, { borderColor: colors.purple }, selectedFrequency === 'days' && { backgroundColor: colors.purple }]} />
              <Text style={[styles.optionText, { color: colors.text }]}>days</Text>
              {selectedFrequency === 'days' && (
                <View style={styles.daysContainer}>
                  <Text style={[styles.everyText, { color: colors.textSecondary }]}>every</Text>
                  <TextInput
                    style={[styles.input, { 
                      borderColor: colors.border,
                      backgroundColor: colors.cardBackground,
                      color: colors.text
                    }]}
                    value={customDays}
                    onChangeText={setCustomDays}
                    keyboardType="numeric"
                    placeholder="7"
                    placeholderTextColor={colors.textTertiary}
                  />
                  <Text style={[styles.everyText, { color: colors.textSecondary }]}>days</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => setSelectedFrequency('weekly')}
            >
              <View style={[styles.radio, { borderColor: colors.purple }, selectedFrequency === 'weekly' && { backgroundColor: colors.purple }]} />
              <Text style={[styles.optionText, { color: colors.text }]}>weekly</Text>
              {selectedFrequency === 'weekly' && (
                <View style={styles.weeklyContainer}>
                  <Text style={[styles.everyText, { color: colors.textSecondary }]}>every</Text>
                  <TextInput
                    style={[styles.input, { 
                      borderColor: colors.border,
                      backgroundColor: colors.cardBackground,
                      color: colors.text
                    }]}
                    value={customDays}
                    onChangeText={setCustomDays}
                    keyboardType="numeric"
                    placeholder="3"
                    placeholderTextColor={colors.textTertiary}
                  />
                  <Text style={[styles.everyText, { color: colors.textSecondary }]}>weeks</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => setSelectedFrequency('monthly')}
            >
              <View style={[styles.radio, { borderColor: colors.purple }, selectedFrequency === 'monthly' && { backgroundColor: colors.purple }]} />
              <Text style={[styles.optionText, { color: colors.text }]}>monthly</Text>
              {selectedFrequency === 'monthly' && (
                <View style={styles.monthlyContainer}>
                  <Text style={[styles.everyText, { color: colors.textSecondary }]}>every</Text>
                  <TextInput
                    style={[styles.input, { 
                      borderColor: colors.border,
                      backgroundColor: colors.cardBackground,
                      color: colors.text
                    }]}
                    value={customDays}
                    onChangeText={setCustomDays}
                    keyboardType="numeric"
                    placeholder="1"
                    placeholderTextColor={colors.textTertiary}
                  />
                  <Text style={[styles.everyText, { color: colors.textSecondary }]}>months</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.timeSection}>
            <Text style={[styles.timeSectionTitle, { color: colors.textSecondary }]}>🕐 Notification Time</Text>
            <TouchableOpacity
              style={[styles.timeSelector, { 
                borderColor: colors.border,
                backgroundColor: colors.cardBackground
              }]}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={[styles.timeSelectorText, { color: colors.text }]}>
                {formatTime(notificationTime)}
              </Text>
              <Text style={[styles.dropdownIcon, { color: colors.textSecondary }]}>▼</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.purple }]} onPress={handleSave}>
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
            <View style={[styles.timePickerModal, { backgroundColor: colors.modalBackground }]}>
              <View style={[styles.timePickerHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.timePickerTitle, { color: colors.text }]}>Select Time</Text>
                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                  <Text style={[styles.timePickerDoneButton, { color: colors.purple }]}>Done</Text>
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
    flex: 1,
  },
  closeButton: {
    fontSize: 18,
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
    marginRight: 12,
  },
  radioSelected: {
    // Removed - now handled inline
  },
  optionText: {
    fontSize: 16,
    marginRight: 10,
  },
  input: {
    borderWidth: 1,
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
    marginHorizontal: 5,
  },
  timeSection: {
    marginBottom: 20,
  },
  timeSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  timeSelector: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeSelectorText: {
    fontSize: 16,
    fontWeight: '500',
  },
  dropdownIcon: {
    fontSize: 10,
  },
  timePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  timePickerModal: {
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
  },
  timePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  timePickerDoneButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
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
