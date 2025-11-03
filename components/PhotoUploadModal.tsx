import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getPhotoConsentAccepted, setPhotoConsentAccepted } from '../utils/storage';
import { useTheme } from '../utils/themeContext';

interface PhotoUploadModalProps {
  visible: boolean;
  friendName: string;
  onUpload: (uri: string) => void;
  onClose: () => void;
}

export default function PhotoUploadModal({
  visible,
  friendName,
  onUpload,
  onClose,
}: PhotoUploadModalProps) {
  const [step, setStep] = useState<'photo-consent' | 'upload'>('photo-consent');
  const [photoConsentAccepted, setPhotoConsentAcceptedState] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const { colors } = useTheme();

  useEffect(() => {
    if (visible) {
      checkPhotoConsent();
    }
  }, [visible]);

  const checkPhotoConsent = async () => {
    const hasConsent = await getPhotoConsentAccepted();
    if (hasConsent) {
      setStep('upload');
      setShowConsentModal(false);
    } else {
      setStep('photo-consent');
      setShowConsentModal(true);
    }
  };

  const handleClose = () => {
    setStep('photo-consent');
    setPhotoConsentAcceptedState(false);
    setDontShowAgain(false);
    setSelectedImage(null);
    setShowConsentModal(false);
    onClose();
  };

  const handlePhotoConsentContinue = async () => {
    if (!photoConsentAccepted) {
      Alert.alert('Consent Required', 'Please accept the consent to continue.');
      return;
    }
    
    if (dontShowAgain) {
      await setPhotoConsentAccepted(true);
    }
    
    setShowConsentModal(false);
    setStep('upload');
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant permission to access your photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleUploadConfirm = () => {
    if (!selectedImage) {
      Alert.alert('No Image Selected', 'Please select an image first.');
      return;
    }
    onUpload(selectedImage);
    handleClose();
  };

  return (
    <>
      {/* Photo Consent Modal */}
      <Modal
        visible={visible && showConsentModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleClose}
      >
        <View style={styles.consentModalOverlay}>
          <View style={[styles.consentModalContent, { backgroundColor: colors.modalBackground }]}>
            <View style={[styles.consentModalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.consentModalTitle, { color: colors.text }]}>Photo Upload Consent</Text>
              <TouchableOpacity onPress={handleClose}>
                <Text style={[styles.modalClose, { color: colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.consentScrollContent} showsVerticalScrollIndicator={false}>
              <View style={styles.consentHeader}>
                <Text style={styles.consentIcon}>🔷</Text>
                <Text style={[styles.consentTitle, { color: colors.text }]}>Photo Upload Consent</Text>
              </View>

              <Text style={[styles.consentText, { color: colors.text }]}>
                By uploading this image, you confirm that:
              </Text>

              <View style={[styles.consentList, { backgroundColor: colors.isDarkMode ? '#2A2A2A' : '#F8F9FA' }]}>
                <Text style={[styles.consentItem, { color: colors.textSecondary }]}>
                  • Every identifiable person in the image has agreed to this upload.
                </Text>
                <Text style={[styles.consentItem, { color: colors.textSecondary }]}>
                  • The image is from a consented or publicly available source.
                </Text>
                <Text style={[styles.consentItem, { color: colors.textSecondary }]}>
                  • You will delete it if any person shown requests removal.
                </Text>
                <Text style={[styles.consentItem, { color: colors.textSecondary }]}>
                  • Friendo stores images privately and does not share them publicly.
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.checkboxContainer, {
                  backgroundColor: colors.isDarkMode ? 'rgba(168, 85, 247, 0.2)' : '#F0F4FF',
                  borderColor: colors.purple
                }]}
                onPress={() => setPhotoConsentAcceptedState(!photoConsentAccepted)}
              >
                <View style={[styles.checkbox, { borderColor: colors.purple }, photoConsentAccepted && { backgroundColor: colors.purple }]}>
                  {photoConsentAccepted && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={[styles.checkboxLabel, { color: colors.text }]}>
                  I confirm that I have consent from everyone shown and accept responsibility for compliance.
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
                style={[styles.continueButton, { backgroundColor: photoConsentAccepted ? colors.purple : colors.textDisabled }]}
                onPress={handlePhotoConsentContinue}
                disabled={!photoConsentAccepted}
              >
                <Text style={styles.continueButtonText}>Continue to Upload</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Upload Photo Modal */}
      <Modal
        visible={visible && !showConsentModal && step === 'upload'}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClose}
      >
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={[styles.header, { 
            backgroundColor: colors.cardBackground,
            borderBottomColor: colors.border
          }]}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Upload Photo</Text>
            <TouchableOpacity onPress={handleClose}>
              <Text style={[styles.closeButton, { color: colors.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
            <View style={styles.uploadSection}>
              <Text style={[styles.uploadTitle, { color: colors.text }]}>Upload Photo for {friendName}</Text>
              
              {selectedImage ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
                  <TouchableOpacity
                    style={[styles.changePhotoButton, { backgroundColor: colors.isDarkMode ? '#2A2A2A' : '#F0F0F0' }]}
                    onPress={handlePickImage}
                  >
                    <Text style={[styles.changePhotoButtonText, { color: colors.textSecondary }]}>Change Photo</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  style={[styles.uploadButton, {
                    backgroundColor: colors.isDarkMode ? '#2A2A2A' : '#F8F9FA',
                    borderColor: colors.border
                  }]} 
                  onPress={handlePickImage}
                >
                  <Text style={styles.uploadIcon}>📷</Text>
                  <Text style={[styles.uploadButtonText, { color: colors.textSecondary }]}>Select Photo from Gallery</Text>
                </TouchableOpacity>
              )}

              {selectedImage && (
                <TouchableOpacity
                  style={[styles.confirmButton, { backgroundColor: colors.green }]}
                  onPress={handleUploadConfirm}
                >
                  <Text style={styles.confirmButtonText}>Confirm Upload</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  consentModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  consentModalContent: {
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 500,
    maxHeight: '85%',
  },
  consentModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  consentModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalClose: {
    fontSize: 24,
  },
  consentScrollContent: {
    flex: 1,
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
  uploadSection: {
    flex: 1,
    alignItems: 'center',
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  uploadButton: {
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    width: '100%',
  },
  uploadIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  imagePreviewContainer: {
    alignItems: 'center',
    width: '100%',
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 20,
  },
  changePhotoButton: {
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 20,
  },
  changePhotoButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});