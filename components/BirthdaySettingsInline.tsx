import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import { Friend } from '../types';
import { getFriendConsentAccepted, setFriendConsentAccepted } from '../utils/storage';
import { useTheme } from '../utils/themeContext';

interface BirthdaySettingsInlineProps {
  friend: Friend;
  onUpdate: (updates: Partial<Friend>) => void;
}

export default function BirthdaySettingsInline({ friend, onUpdate }: BirthdaySettingsInlineProps) {
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(
    friend.birthday ? parseInt(friend.birthday.split('/')[0]) : 1
  );
  const [selectedDay, setSelectedDay] = useState<number>(
    friend.birthday ? parseInt(friend.birthday.split('/')[1]) : 1
  );
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const { colors } = useTheme();

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (month: number) => {
    const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return daysInMonth[month - 1];
  };

  const handleBirthdayClick = async () => {
    const hasConsent = await getFriendConsentAccepted();
    if (!hasConsent) {
      setShowConsentModal(true);
    } else {
      setShowDatePicker(true);
    }
  };

  const handleConsentContinue = async () => {
    if (!consentAccepted) {
      Alert.alert('Consent Required', 'Please accept the consent to continue.');
      return;
    }
    
    if (dontShowAgain) {
      await setFriendConsentAccepted(true);
    }
    
    setShowConsentModal(false);
    setShowDatePicker(true);
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
    <>
      <View style={[styles.container, { 
        backgroundColor: colors.isDarkMode ? 'rgba(255, 193, 7, 0.1)' : '#FFF9E6',
        borderColor: colors.isDarkMode ? 'rgba(255, 193, 7, 0.3)' : '#FFD700'
      }]}>
        <View style={[styles.header, { backgroundColor: colors.isDarkMode ? 'rgba(255, 193, 7, 0.2)' : '#FFF9E6' }]}>
          <Text style={styles.headerIcon}>🎂</Text>
          <Text style={[styles.headerText, { color: colors.text }]}>Birthday</Text>
        </View>

        <TouchableOpacity
          style={[styles.birthdaySelector, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
          onPress={handleBirthdayClick}
        >
          <Text style={[styles.birthdayLabel, { color: colors.textSecondary }]}>Birthday Date</Text>
          <Text style={[styles.birthdayValue, { color: colors.text }]}>
            {friend.birthday || '__/__'}
          </Text>
        </TouchableOpacity>

        {friend.birthday && (
          <View style={[styles.notificationToggle, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <View style={styles.notificationInfo}>
              <Text style={[styles.notificationLabel, { color: colors.text }]}>Birthday Notification</Text>
              <Text style={[styles.notificationSubtext, { color: colors.textSecondary }]}>
                Get reminded on their birthday
              </Text>
            </View>
            <Switch
              value={friend.birthdayNotificationEnabled || false}
              onValueChange={handleToggleNotification}
              trackColor={{ false: colors.border, true: colors.purple }}
              thumbColor={colors.white}
            />
          </View>
        )}
      </View>

      {/* Friend Consent Modal */}
      <Modal
        visible={showConsentModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConsentModal(false)}
      >
        <View style={styles.consentModalOverlay}>
          <View style={[styles.consentModalContent, { backgroundColor: colors.modalBackground }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Friend Consent Confirmation</Text>
              <TouchableOpacity onPress={() => setShowConsentModal(false)}>
                <Text style={[styles.modalClose, { color: colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.consentContent} showsVerticalScrollIndicator={false}>
              <View style={styles.consentHeader}>
                <Text style={styles.consentIcon}>🔷</Text>
                <Text style={[styles.consentTitle, { color: colors.text }]}>Before Adding Birthday</Text>
              </View>

              <Text style={[styles.consentText, { color: colors.text }]}>
                Please confirm that:
              </Text>

              <View style={[styles.consentList, { backgroundColor: colors.isDarkMode ? '#2A2A2A' : '#F8F9FA' }]}>
                <Text style={[styles.consentItem, { color: colors.textSecondary }]}>
                  • You have their explicit permission to store this information in Friendo.
                </Text>
                <Text style={[styles.consentItem, { color: colors.textSecondary }]}>
                  • You understand this data is for your personal use only and is not shared with others.
                </Text>
                <Text style={[styles.consentItem, { color: colors.textSecondary }]}>
                  • You will remove it if your friend withdraws consent.
                </Text>
                <Text style={[styles.consentItem, { color: colors.textSecondary }]}>
                  • The data will be stored securely and can be deleted at any time.
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.checkboxContainer, {
                  backgroundColor: colors.isDarkMode ? 'rgba(168, 85, 247, 0.2)' : '#F0F4FF',
                  borderColor: colors.purple
                }]}
                onPress={() => setConsentAccepted(!consentAccepted)}
              >
                <View style={[styles.checkbox, { borderColor: colors.purple }, consentAccepted && { backgroundColor: colors.purple }]}>
                  {consentAccepted && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={[styles.checkboxLabel, { color: colors.text }]}>
                  I confirm that I have my friend\'s explicit consent and accept responsibility for compliance.
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.checkboxContainer, {
                  backgroundColor: colors.isDarkMode ? 'rgba(255, 193, 7, 0.2)' : '#FFF9E6',
                  borderColor: colors.orange
                }]}
                onPress={() => setDontShowAgain(!dontShowAgain)}
              >
                <View style={[styles.checkbox, { borderColor: colors.orange }, dontShowAgain && { backgroundColor: colors.orange }]}>
                  {dontShowAgain && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={[styles.checkboxLabel, { color: colors.text }]}>
                  I hereby acknowledge this, therefore this message does not need to appear again.
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.continueButton, { backgroundColor: consentAccepted ? colors.purple : colors.textDisabled }]}
                onPress={handleConsentContinue}
                disabled={!consentAccepted}
              >
                <Text style={styles.continueButtonText}>Continue</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Birthday Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.modalBackground }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Birthday</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={[styles.modalClose, { color: colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.pickerContainer}>
              <View style={styles.pickerColumn}>
                <Text style={[styles.pickerLabel, { color: colors.textSecondary }]}>Month</Text>
                <ScrollView style={[styles.pickerScroll, { borderColor: colors.border }]} nestedScrollEnabled>
                  {months.map((month, index) => (
                    <TouchableOpacity
                      key={month}
                      style={[
                        styles.pickerItem,
                        { borderBottomColor: colors.borderLight },
                        selectedMonth === index + 1 && { backgroundColor: colors.purple }
                      ]}
                      onPress={() => setSelectedMonth(index + 1)}
                    >
                      <Text style={[
                        styles.pickerItemText,
                        { color: colors.text },
                        selectedMonth === index + 1 && styles.pickerItemTextSelected
                      ]}>
                        {month}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.pickerColumn}>
                <Text style={[styles.pickerLabel, { color: colors.textSecondary }]}>Day</Text>
                <ScrollView style={[styles.pickerScroll, { borderColor: colors.border }]} nestedScrollEnabled>
                  {Array.from({ length: getDaysInMonth(selectedMonth) }, (_, i) => i + 1).map(day => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.pickerItem,
                        { borderBottomColor: colors.borderLight },
                        selectedDay === day && { backgroundColor: colors.purple }
                      ]}
                      onPress={() => setSelectedDay(day)}
                    >
                      <Text style={[
                        styles.pickerItemText,
                        { color: colors.text },
                        selectedDay === day && styles.pickerItemTextSelected
                      ]}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.purple }]}
              onPress={handleSaveBirthday}
            >
              <Text style={styles.saveButtonText}>Save Birthday</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderRadius: 8,
    padding: 8,
  },
  headerIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
  },
  birthdaySelector: {
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
  },
  birthdayLabel: {
    fontSize: 14,
  },
  birthdayValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  notificationToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  notificationSubtext: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  consentModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  consentModalContent: {
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalClose: {
    fontSize: 24,
  },
  consentContent: {
    maxHeight: '100%',
  },
  consentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  consentIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  consentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  consentText: {
    fontSize: 16,
    marginBottom: 16,
    lineHeight: 22,
  },
  consentList: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  consentItem: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: 6,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  continueButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
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
    marginBottom: 8,
    textAlign: 'center',
  },
  pickerScroll: {
    maxHeight: 200,
    borderRadius: 8,
    borderWidth: 1,
  },
  pickerItem: {
    padding: 12,
    borderBottomWidth: 1,
  },
  pickerItemText: {
    fontSize: 14,
    textAlign: 'center',
  },
  pickerItemTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  saveButton: {
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