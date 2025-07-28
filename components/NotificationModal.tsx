import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useBasic } from '@basictech/expo';
import { Friend } from '../types';
import { notificationService } from '../utils/notificationService';

interface NotificationModalProps {
  visible: boolean;
  friend: Friend;
  onClose: () => void;
}

export default function NotificationModal({ visible, friend, onClose }: NotificationModalProps) {
  const [selectedFrequency, setSelectedFrequency] = useState<'days' | 'weekly' | 'monthly'>(friend.notificationFrequency || 'days');
  const [customDays, setCustomDays] = useState((friend.notificationDays || 7).toString());
  const { db } = useBasic();

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

        // Schedule the actual notification
        await notificationService.scheduleNotification(
          friend.id,
          friend.name,
          days
        );

        Alert.alert('Success', `Notification set! You'll be reminded to reconnect with ${friend.name} in ${days} day${days === 1 ? '' : 's'}.`);
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
                <TextInput
                  style={styles.input}
                  value={customDays}
                  onChangeText={setCustomDays}
                  keyboardType="numeric"
                  placeholder="7"
                />
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

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    width: '80%',
    maxWidth: 300,
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
