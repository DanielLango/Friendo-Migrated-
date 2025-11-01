import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Modal,
  Alert,
} from 'react-native';
import { Friend } from '../types';

interface BirthdaySettingsProps {
  friend: Friend;
  onUpdate: (updates: Partial<Friend>) => void;
}

export default function BirthdaySettings({ friend, onUpdate }: BirthdaySettingsProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(
    friend.birthday ? parseInt(friend.birthday.split('/')[0]) : 1
  );
  const [selectedDay, setSelectedDay] = useState<number>(
    friend.birthday ? parseInt(friend.birthday.split('/')[1]) : 1
  );

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (month: number) => {
    const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return daysInMonth[month - 1];
  };

  const handleSaveBirthday = () => {
    const birthday = `${selectedMonth.toString().padStart(2, '0')}/${selectedDay.toString().padStart(2, '0')}`;
    onUpdate({ birthday });
    setShowDatePicker(false);
  };

  const handleToggleNotification = (enabled: boolean) => {
    if (enabled && !friend.birthday) {
      Alert.alert('Set Birthday First', 'Please set a birthday before enabling notifications.');
      return;
    }
    onUpdate({ birthdayNotificationEnabled: enabled });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>🎂</Text>
        <Text style={styles.headerText}>Birthday</Text>
      </View>

      <TouchableOpacity
        style={styles.birthdaySelector}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.birthdayLabel}>Birthday Date</Text>
        <Text style={styles.birthdayValue}>
          {friend.birthday || '__/__'}
        </Text>
      </TouchableOpacity>

      {friend.birthday && (
        <View style={styles.notificationToggle}>
          <View style={styles.notificationInfo}>
            <Text style={styles.notificationLabel}>Birthday Notification</Text>
            <Text style={styles.notificationSubtext}>
              Get reminded on their birthday
            </Text>
          </View>
          <Switch
            value={friend.birthdayNotificationEnabled || false}
            onValueChange={handleToggleNotification}
            trackColor={{ false: '#E0E0E0', true: '#8000FF' }}
            thumbColor="#FFFFFF"
          />
        </View>
      )}

      {/* Birthday Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Birthday</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.pickerContainer}>
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Month</Text>
                <View style={styles.pickerScroll}>
                  {months.map((month, index) => (
                    <TouchableOpacity
                      key={month}
                      style={[
                        styles.pickerItem,
                        selectedMonth === index + 1 && styles.pickerItemSelected
                      ]}
                      onPress={() => setSelectedMonth(index + 1)}
                    >
                      <Text style={[
                        styles.pickerItemText,
                        selectedMonth === index + 1 && styles.pickerItemTextSelected
                      ]}>
                        {month}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Day</Text>
                <View style={styles.pickerScroll}>
                  {Array.from({ length: getDaysInMonth(selectedMonth) }, (_, i) => i + 1).map(day => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.pickerItem,
                        selectedDay === day && styles.pickerItemSelected
                      ]}
                      onPress={() => setSelectedDay(day)}
                    >
                      <Text style={[
                        styles.pickerItemText,
                        selectedDay === day && styles.pickerItemTextSelected
                      ]}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveBirthday}
            >
              <Text style={styles.saveButtonText}>Save Birthday</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  birthdaySelector: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  birthdayLabel: {
    fontSize: 14,
    color: '#666666',
  },
  birthdayValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  notificationToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  notificationSubtext: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  modalClose: {
    fontSize: 24,
    color: '#666666',
  },
  pickerContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  pickerColumn: {
    flex: 1,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
    textAlign: 'center',
  },
  pickerScroll: {
    maxHeight: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  pickerItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  pickerItemSelected: {
    backgroundColor: '#8000FF',
  },
  pickerItemText: {
    fontSize: 14,
    color: '#333333',
    textAlign: 'center',
  },
  pickerItemTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#8000FF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});