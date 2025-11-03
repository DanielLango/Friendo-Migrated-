import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Modal,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getFriends, addFriend, getUser } from '../utils/storage';
import { uploadProfilePicture } from '../utils/imageUpload';
import Paywall from '../components/Paywall';
import BirthdaySettings from '../components/BirthdaySettings';
import PhotoUploadModal from '../components/PhotoUploadModal';
import { shouldShowPaywall, markPaywallShown } from '../utils/paywallUtils';
import { isPremiumUser } from '../utils/premiumFeatures';

export default function ManualAddScreen() {
  const [fullName, setFullName] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [isLocal, setIsLocal] = useState(false);
  const [currentFriendCount, setCurrentFriendCount] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [birthday, setBirthday] = useState<string | undefined>(undefined);
  const [birthdayNotificationEnabled, setBirthdayNotificationEnabled] = useState(false);
  const [profilePictureUri, setProfilePictureUri] = useState<string | undefined>(undefined);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const navigation = useNavigation();

  useEffect(() => {
    checkPremiumStatus();
    fetchFriendCount();
  }, []);

  const checkPremiumStatus = async () => {
    const premium = await isPremiumUser();
    setIsPremium(premium);
  };

  const fetchFriendCount = async () => {
    try {
      const friends = await getFriends();
      setCurrentFriendCount(friends.length);
    } catch (error) {
      console.error('Error fetching friend count:', error);
    }
  };

  const handleAdd = async () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter a friend\'s name');
      return;
    }

    if (!isOnline && !isLocal) {
      Alert.alert('Error', 'Please select at least one friend type');
      return;
    }

    try {
      // Check friend limit FIRST before any uploads
      const friends = await getFriends();
      const maxFriends = isPremium ? 1000 : 50;
      
      if (friends.length >= maxFriends) {
        Alert.alert(
          'Friend Limit Reached',
          `You can only add up to ${maxFriends} friends${!isPremium ? '. Upgrade to Premium for up to 1000 friends!' : '.'}`,
          [{ text: 'OK' }]
        );
        return;
      }
      
      // Upload profile picture if provided (but don't block on failure)
      let uploadedImageUrl: string | undefined = undefined;
      if (profilePictureUri) {
        try {
          setIsUploading(true);
          const user = await getUser();
          if (user) {
            console.log('Uploading profile picture...');
            uploadedImageUrl = await uploadProfilePicture(profilePictureUri, user.id);
            if (uploadedImageUrl) {
              console.log('Profile picture uploaded:', uploadedImageUrl);
            } else {
              console.warn('Profile picture upload returned null');
            }
          }
        } catch (uploadError) {
          console.error('Profile picture upload failed:', uploadError);
          // Continue without the profile picture instead of failing completely
          Alert.alert(
            'Photo Upload Failed',
            'The profile picture could not be uploaded, but your friend will still be added. You can try uploading the photo again later.',
            [{ text: 'OK' }]
          );
        } finally {
          setIsUploading(false);
        }
      }
      
      // Add friend (this should always succeed even if photo upload failed)
      const addedFriend = await addFriend({
        name: fullName.trim(),
        email: '',
        friendType: isOnline && isLocal ? 'both' : isOnline ? 'online' : 'local',
        isOnline,
        isLocal,
        profilePicture: '👤',
        profilePictureUri: uploadedImageUrl, // Will be undefined if upload failed
        city: '',
        source: 'manual',
        notificationFrequency: 'monthly',
        notificationDays: 30,
        birthday,
        birthdayNotificationEnabled,
      });

      if (!addedFriend) {
        throw new Error('Failed to add friend to database');
      }

      // Check if we should show the paywall (once per day)
      const shouldShow = await shouldShowPaywall();
      if (shouldShow) {
        await markPaywallShown();
        setShowPaywall(true);
      } else {
        // Show success message if not showing paywall
        Alert.alert('Success', 'Friend added successfully!', [
          { 
            text: 'Add Another', 
            style: 'default',
            onPress: () => {
              setFullName('');
              setIsOnline(false);
              setIsLocal(false);
              setBirthday(undefined);
              setBirthdayNotificationEnabled(false);
              setProfilePictureUri(undefined);
            }
          },
          { 
            text: 'Done', 
            style: 'default',
            onPress: () => (navigation as any).navigate('AddFriends') 
          }
        ]);
      }
    } catch (error) {
      console.error('Error adding friend:', error);
      setIsUploading(false);
      Alert.alert('Error', 'Failed to add friend. Please try again.');
    }
  };

  const handlePaywallClose = () => {
    setShowPaywall(false);
    Alert.alert('Success', 'Friend added successfully!', [
      { 
        text: 'Add Another', 
        style: 'default',
        onPress: () => {
          setFullName('');
          setIsOnline(false);
          setIsLocal(false);
          setBirthday(undefined);
          setBirthdayNotificationEnabled(false);
          setProfilePictureUri(undefined);
        }
      },
      { 
        text: 'Done', 
        style: 'default',
        onPress: () => (navigation as any).navigate('AddFriends') 
      }
    ]);
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  // Show paywall modal if needed
  if (showPaywall) {
    return (
      <Modal visible={true} animationType="slide" presentationStyle="fullScreen">
        <Paywall onClose={handlePaywallClose} onSuccess={handlePaywallClose} />
      </Modal>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {isUploading && (
        <View style={styles.uploadingOverlay}>
          <ActivityIndicator size="large" color="#8000FF" />
          <Text style={styles.uploadingText}>Uploading...</Text>
        </View>
      )}
      
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add Friend Manually</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nickname of your friend</Text>
          <Text style={styles.sublabel}>How you like to call the person</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Alex, Johnny, Sarah..."
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        {/* Premium: Photo Upload */}
        {isPremium && (
          <View style={styles.premiumSection}>
            <View style={styles.premiumHeader}>
              <Text style={styles.premiumIcon}>⭐</Text>
              <Text style={styles.premiumLabel}>Premium Feature</Text>
            </View>
            
            <TouchableOpacity
              style={styles.photoUploadButton}
              onPress={() => setShowPhotoUpload(true)}
            >
              {profilePictureUri ? (
                <Image source={{ uri: profilePictureUri }} style={styles.profileImage} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Text style={styles.photoPlaceholderIcon}>📷</Text>
                  <Text style={styles.photoPlaceholderText}>Set Photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Friend Type:</Text>
          
          <TouchableOpacity 
            style={styles.checkboxContainer}
            onPress={() => setIsOnline(!isOnline)}
          >
            <View style={[styles.checkbox, isOnline && styles.checkboxChecked]}>
              {isOnline && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>Online friend</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.checkboxContainer}
            onPress={() => setIsLocal(!isLocal)}
          >
            <View style={[styles.checkbox, isLocal && styles.checkboxChecked]}>
              {isLocal && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>Local friend</Text>
          </TouchableOpacity>
        </View>

        {/* Premium: Birthday Settings */}
        {isPremium && (
          <BirthdaySettings
            friend={{
              id: 'temp',
              name: fullName || 'Friend',
              friendType: 'both',
              isOnline,
              isLocal,
              source: 'manual',
              notificationFrequency: 'monthly',
              notificationDays: 30,
              createdAt: Date.now(),
              birthday,
              birthdayNotificationEnabled,
            }}
            onUpdate={(updates) => {
              if (updates.birthday !== undefined) setBirthday(updates.birthday);
              if (updates.birthdayNotificationEnabled !== undefined) {
                setBirthdayNotificationEnabled(updates.birthdayNotificationEnabled);
              }
            }}
          />
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={handleAdd}
          >
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        {/* Privacy Disclaimer */}
        <View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimerText}>
            This app is for your personal use only. Please avoid entering sensitive or real personal data about others unless you have their permission.
          </Text>
        </View>
      </ScrollView>

      {/* Photo Upload Modal */}
      <PhotoUploadModal
        visible={showPhotoUpload}
        friendName={fullName || 'Friend'}
        onUpload={(uri) => setProfilePictureUri(uri)}
        onClose={() => setShowPhotoUpload(false)}
      />
    </SafeAreaView>
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
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    fontSize: 16,
    color: '#8000FF',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  placeholder: {
    width: 50,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  inputGroup: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  sectionContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#8000FF',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#8000FF',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333333',
  },
  sublabel: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666666',
  },
  addButton: {
    flex: 1,
    backgroundColor: '#8000FF',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginLeft: 10,
  },
  addButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  disclaimerContainer: {
    marginTop: 30,
    paddingHorizontal: 10,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 16,
    fontStyle: 'italic',
  },
  premiumSection: {
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  premiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  premiumIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  premiumLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
  },
  photoUploadButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#8000FF',
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  photoPlaceholderIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  photoPlaceholderText: {
    fontSize: 12,
    color: '#666666',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  uploadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 12,
    fontWeight: '600',
  },
});
