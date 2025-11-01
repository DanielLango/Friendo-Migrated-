import React, { useState } from 'react';
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
  const [step, setStep] = useState<'consent' | 'photo-consent' | 'upload'>('consent');
  const [friendConsentAccepted, setFriendConsentAccepted] = useState(false);
  const [photoConsentAccepted, setPhotoConsentAccepted] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleClose = () => {
    setStep('consent');
    setFriendConsentAccepted(false);
    setPhotoConsentAccepted(false);
    setSelectedImage(null);
    onClose();
  };

  const handleFriendConsentContinue = () => {
    if (!friendConsentAccepted) {
      Alert.alert('Consent Required', 'Please accept the consent to continue.');
      return;
    }
    setStep('photo-consent');
  };

  const handlePhotoConsentContinue = () => {
    if (!photoConsentAccepted) {
      Alert.alert('Consent Required', 'Please accept the consent to continue.');
      return;
    }
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
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {step === 'consent' ? 'Friend Consent' : 
             step === 'photo-consent' ? 'Photo Upload Consent' : 
             'Upload Photo'}
          </Text>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {step === 'consent' && (
            <View style={styles.consentSection}>
              <View style={styles.consentHeader}>
                <Text style={styles.consentIcon}>🔷</Text>
                <Text style={styles.consentTitle}>Friend Consent Confirmation</Text>
              </View>

              <Text style={styles.consentText}>
                Before adding your friend's details, please confirm that:
              </Text>

              <View style={styles.consentList}>
                <Text style={styles.consentItem}>
                  • You have their explicit permission to store this information in Friendo.
                </Text>
                <Text style={styles.consentItem}>
                  • You understand this data is for your personal use only and is not shared with others.
                </Text>
                <Text style={styles.consentItem}>
                  • You will remove it if your friend withdraws consent.
                </Text>
                <Text style={styles.consentItem}>
                  • The data will be stored securely and can be deleted at any time.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setFriendConsentAccepted(!friendConsentAccepted)}
              >
                <View style={[styles.checkbox, friendConsentAccepted && styles.checkboxChecked]}>
                  {friendConsentAccepted && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>
                  I confirm that I have my friend's explicit consent and accept responsibility for compliance.
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.continueButton, !friendConsentAccepted && styles.continueButtonDisabled]}
                onPress={handleFriendConsentContinue}
                disabled={!friendConsentAccepted}
              >
                <Text style={styles.continueButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 'photo-consent' && (
            <View style={styles.consentSection}>
              <View style={styles.consentHeader}>
                <Text style={styles.consentIcon}>🔷</Text>
                <Text style={styles.consentTitle}>Photo Upload Consent</Text>
              </View>

              <Text style={styles.consentText}>
                By uploading this image, you confirm that:
              </Text>

              <View style={styles.consentList}>
                <Text style={styles.consentItem}>
                  • Every identifiable person in the image has agreed to this upload.
                </Text>
                <Text style={styles.consentItem}>
                  • The image is from a consented or publicly available source.
                </Text>
                <Text style={styles.consentItem}>
                  • You will delete it if any person shown requests removal.
                </Text>
                <Text style={styles.consentItem}>
                  • Friendo stores images privately and does not share them publicly.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setPhotoConsentAccepted(!photoConsentAccepted)}
              >
                <View style={[styles.checkbox, photoConsentAccepted && styles.checkboxChecked]}>
                  {photoConsentAccepted && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>
                  I confirm that I have consent from everyone shown and accept responsibility for compliance.
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.continueButton, !photoConsentAccepted && styles.continueButtonDisabled]}
                onPress={handlePhotoConsentContinue}
                disabled={!photoConsentAccepted}
              >
                <Text style={styles.continueButtonText}>Continue to Upload</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 'upload' && (
            <View style={styles.uploadSection}>
              <Text style={styles.uploadTitle}>Upload Photo for {friendName}</Text>
              
              {selectedImage ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
                  <TouchableOpacity
                    style={styles.changePhotoButton}
                    onPress={handlePickImage}
                  >
                    <Text style={styles.changePhotoButtonText}>Change Photo</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.uploadButton} onPress={handlePickImage}>
                  <Text style={styles.uploadIcon}>📷</Text>
                  <Text style={styles.uploadButtonText}>Select Photo from Gallery</Text>
                </TouchableOpacity>
              )}

              {selectedImage && (
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleUploadConfirm}
                >
                  <Text style={styles.confirmButtonText}>Confirm Upload</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  closeButton: {
    fontSize: 24,
    color: '#666666',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  consentSection: {
    flex: 1,
  },
  consentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  consentIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  consentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  consentText: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 16,
    lineHeight: 22,
  },
  consentList: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  consentItem: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
    lineHeight: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#F0F4FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8000FF',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#8000FF',
    borderRadius: 6,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#8000FF',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    fontWeight: '500',
  },
  continueButton: {
    backgroundColor: '#8000FF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#CCCCCC',
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
    color: '#333333',
    marginBottom: 24,
    textAlign: 'center',
  },
  uploadButton: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    width: '100%',
  },
  uploadIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  uploadButtonText: {
    fontSize: 16,
    color: '#666666',
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
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 20,
  },
  changePhotoButtonText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
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