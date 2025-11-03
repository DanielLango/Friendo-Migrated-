import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Pressable,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Friend, Meeting } from '../types';
import NotificationModal from './NotificationModal';
import CancellationModal from './CancellationModal';
import PhotoUploadModal from './PhotoUploadModal';
import { getMeetings, saveMeetings, getUser } from '../utils/storage';
import { saveFriends, getFriends } from '../utils/storage';
import { isPremiumUser } from '../utils/premiumFeatures';
import { uploadProfilePicture } from '../utils/imageUpload';
import { useTheme } from '../utils/themeContext';

interface FriendRowProps {
  friend: Friend;
  meetings: Meeting[];
  onScheduleNext: (friend: Friend) => void;
  onMeetingPress: (meeting: Meeting) => void;
  deleteMode?: boolean;
  onDataChange?: () => void;
}

export default function FriendRow({ 
  friend, 
  meetings, 
  onScheduleNext, 
  onMeetingPress,
  deleteMode = false,
  onDataChange
}: FriendRowProps) {
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showAllMeetings, setShowAllMeetings] = useState(false);
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [selectedMeetingForCancellation, setSelectedMeetingForCancellation] = useState<Meeting | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const { colors } = useTheme();
  
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [pressingMeetingId, setPressingMeetingId] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();
  
  console.log(`FriendRow for ${friend.name}: received ${meetings.length} meetings`);
  meetings.forEach(m => {
    console.log(`  - Meeting ${m.id}: date=${m.date}, notes=${m.notes?.substring(0, 50)}`);
  });
  
  const yearMeetings = meetings
    .filter(meeting => {
      const meetingDate = new Date(meeting.date);
      const meetingYear = meetingDate.getFullYear();
      console.log(`Meeting ${meeting.id} date: ${meeting.date}, year: ${meetingYear}, current year: ${currentYear}`);
      return meetingYear === currentYear;
    })
    .map(meeting => {
      const meetingDate = new Date(meeting.date);
      const now = new Date();
      
      const endOfMeetingDay = new Date(meetingDate);
      endOfMeetingDay.setHours(23, 59, 59, 999);
      
      const isCancelled = meeting.notes?.startsWith('[CANCELLED]');
      
      if (isCancelled) {
        console.log(`Meeting ${meeting.id} is CANCELLED`);
        return { ...meeting, status: 'cancelled' as const };
      }
      
      if (now > endOfMeetingDay) {
        console.log(`Meeting ${meeting.id} is MET (date passed)`);
        return { ...meeting, status: 'met' as const };
      }
      
      console.log(`Meeting ${meeting.id} is SCHEDULED (future date)`);
      return { ...meeting, status: 'scheduled' as const };
    })
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateA - dateB;
    });

  const displayMeetings = showAllMeetings ? yearMeetings : yearMeetings.slice(0, 5);
  const hasMoreMeetings = yearMeetings.length > 5;

  console.log(`Friend ${friend.name} has ${yearMeetings.length} meetings this year to display`);
  console.log(`Display meetings:`, displayMeetings.map(m => ({ id: m.id, status: m.status })));
  console.log(`displayMeetings.length: ${displayMeetings.length}`);

  useEffect(() => {
    checkPremiumStatus();
  }, []);

  const checkPremiumStatus = async () => {
    const premium = await isPremiumUser();
    setIsPremium(premium);
  };

  const handleToggleFavorite = async () => {
    try {
      const allFriends = await getFriends();
      const updatedFriends = allFriends.map(f => {
        if (f.id === friend.id) {
          return { ...f, isFavorite: !f.isFavorite };
        }
        return f;
      });
      await saveFriends(updatedFriends);
      if (onDataChange) onDataChange();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handlePhotoUpload = async (uri: string) => {
    try {
      setIsUploadingPhoto(true);
      
      const user = await getUser();
      if (!user) {
        Alert.alert('Error', 'You must be logged in to upload photos');
        setIsUploadingPhoto(false);
        return;
      }

      console.log('Uploading profile picture for friend:', friend.name);
      console.log('User ID:', user.id);
      console.log('Image URI:', uri);
      
      const uploadedUrl = await uploadProfilePicture(uri, user.id);
      
      console.log('Photo uploaded successfully:', uploadedUrl);

      const allFriends = await getFriends();
      const updatedFriends = allFriends.map(f => {
        if (f.id === friend.id) {
          return { ...f, profilePictureUri: uploadedUrl };
        }
        return f;
      });
      await saveFriends(updatedFriends);
      
      setIsUploadingPhoto(false);
      if (onDataChange) onDataChange();
      
      Alert.alert('Success', 'Profile picture updated!');
    } catch (error) {
      console.error('Error updating profile picture:', error);
      setIsUploadingPhoto(false);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile picture';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleBirthdayUpdate = async (updates: Partial<Friend>) => {
    try {
      const allFriends = await getFriends();
      const updatedFriends = allFriends.map(f => {
        if (f.id === friend.id) {
          return { ...f, ...updates };
        }
        return f;
      });
      await saveFriends(updatedFriends);
      if (onDataChange) onDataChange();
    } catch (error) {
      console.error('Error updating birthday:', error);
    }
  };

  const handleLongPressStart = (meetingId: string) => {
    setPressingMeetingId(meetingId);
    longPressTimer.current = setTimeout(() => {
      handleLongPressComplete(meetingId);
    }, 1000);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setPressingMeetingId(null);
  };

  const handleLongPressComplete = async (meetingId: string) => {
    const meeting = meetings.find(m => m.id === meetingId);
    if (!meeting) return;

    handleLongPressEnd();

    const isCancelled = meeting.notes?.startsWith('[CANCELLED]');

    if (isCancelled) {
      Alert.alert(
        'Erase Meeting?',
        'This will permanently delete this meeting from your history. This action cannot be undone.',
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Yes, Erase',
            style: 'destructive',
            onPress: async () => {
              try {
                const allMeetings = await getMeetings();
                const updatedMeetings = allMeetings.filter(m => m.id !== meeting.id);
                await saveMeetings(updatedMeetings);
                Alert.alert('Success', 'Meeting erased completely.');
              } catch (error) {
                console.error('Error deleting meeting:', error);
                Alert.alert('Error', `Failed to delete meeting: ${error}`);
              }
            }
          }
        ]
      );
    } else {
      const isPremium = await isPremiumUser();
      
      if (isPremium) {
        setSelectedMeetingForCancellation(meeting);
        setShowCancellationModal(true);
      } else {
        Alert.alert(
          'Mark Meeting as Cancelled?',
          'This will mark the meeting as cancelled. The token will turn red and won\'t count toward your meeting total.',
          [
            { text: 'No', style: 'cancel' },
            {
              text: 'Yes, Cancel Meeting',
              style: 'destructive',
              onPress: async () => {
                try {
                  const allMeetings = await getMeetings();
                  const updatedMeetings = allMeetings.map(m => {
                    if (m.id === meeting.id) {
                      return {
                        ...m,
                        notes: `[CANCELLED] ${m.notes || ''}`
                      };
                    }
                    return m;
                  });
                  await saveMeetings(updatedMeetings);
                  Alert.alert('Success', 'Meeting marked as cancelled.');
                } catch (error) {
                  console.error('Error updating meeting:', error);
                  Alert.alert('Error', `Failed to update meeting: ${error}`);
                }
              }
            }
          ]
        );
      }
    }
  };

  const handleCancellationByUser = async () => {
    if (!selectedMeetingForCancellation) return;
    
    try {
      const allMeetings = await getMeetings();
      const updatedMeetings = allMeetings.map(m => {
        if (m.id === selectedMeetingForCancellation.id) {
          return {
            ...m,
            notes: `[CANCELLED] ${m.notes || ''}`,
            cancelledBy: 'user' as const,
          };
        }
        return m;
      });
      await saveMeetings(updatedMeetings);
      setShowCancellationModal(false);
      setSelectedMeetingForCancellation(null);
      Alert.alert('Success', 'Meeting marked as cancelled by you.');
    } catch (error) {
      console.error('Error updating meeting:', error);
      Alert.alert('Error', `Failed to update meeting: ${error}`);
    }
  };

  const handleCancellationByFriend = async () => {
    if (!selectedMeetingForCancellation) return;
    
    try {
      const allMeetings = await getMeetings();
      const updatedMeetings = allMeetings.map(m => {
        if (m.id === selectedMeetingForCancellation.id) {
          return {
            ...m,
            notes: `[CANCELLED] ${m.notes || ''}`,
            cancelledBy: 'friend' as const,
          };
        }
        return m;
      });
      await saveMeetings(updatedMeetings);
      setShowCancellationModal(false);
      setSelectedMeetingForCancellation(null);
      Alert.alert('Success', `Meeting marked as cancelled by ${friend.name}.`);
    } catch (error) {
      console.error('Error updating meeting:', error);
      Alert.alert('Error', `Failed to update meeting: ${error}`);
    }
  };

  const handleTokenPress = (meeting: Meeting) => {
    if (deleteMode) return;
    
    const meetingDate = new Date(meeting.date).toLocaleDateString();
    const status = meeting.status || 'met';
    
    if (status === 'cancelled') {
      Alert.alert(
        'Meeting Details',
        `This was scheduled for ${meetingDate}, but got cancelled.`
      );
    } else if (status === 'scheduled') {
      const instructions = `Scheduled for ${meetingDate}\n\n\nWhat to do now?\n(In case you selected a calendar option)\n\nAfter tapping 'Schedule Meetup':\n1.) In case you selected the Add to my calendar option, open your smartphone's default calendar app, and navigate to the day you selected for the meetup.\n2.) in case you selected Download .ics file navigate to the folder you downloaded it and open it.\n\nOnce the meeting invite is in front of you in your calendar:\n• Edit the event time in the calendar as needed.\n• Under Invitee, you can add an email if you want. Your default calendar app will then send the invitation to that email.\n• Feel free to change any other details about your meeting.`;
      Alert.alert('Meeting Details', instructions);
    } else {
      Alert.alert('Meeting Details', `Met on ${meetingDate}`);
    }
  };

  const getTokenStyle = (meeting: Meeting) => {
    const status = meeting.status || 'met';
    
    if (status === 'cancelled') {
      if (meeting.cancelledBy === 'user') {
        return styles.cancelledByUserToken;
      } else if (meeting.cancelledBy === 'friend') {
        return styles.cancelledByFriendToken;
      }
      return styles.cancelledToken;
    } else if (status === 'scheduled') {
      return styles.scheduledToken;
    }
    return styles.metToken;
  };

  const getTokenText = (meeting: Meeting) => {
    const status = meeting.status || 'met';
    
    if (status === 'cancelled') {
      return 'Cancelled';
    } else if (status === 'scheduled') {
      return 'Scheduled';
    }
    return 'Met';
  };

  return (
    <TouchableOpacity 
      style={[
        styles.container,
        { backgroundColor: colors.cardBackground },
        deleteMode && [styles.deleteMode, {
          borderColor: colors.error,
          backgroundColor: colors.isDarkMode ? 'rgba(239, 68, 68, 0.2)' : '#FFF5F5'
        }]
      ]}
      onPress={() => deleteMode && onScheduleNext(friend)}
      disabled={!deleteMode}
    >
      {isUploadingPhoto && (
        <View style={[styles.uploadingOverlay, { backgroundColor: colors.isDarkMode ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)' }]}>
          <ActivityIndicator size="small" color={colors.purple} />
        </View>
      )}
      
      {deleteMode && (
        <View style={styles.deleteOverlay}>
          <Text style={styles.deleteIcon}>🗑️</Text>
        </View>
      )}
      
      <View style={styles.friendInfo}>
        <TouchableOpacity
          style={[styles.notificationButton, { backgroundColor: colors.isDarkMode ? '#2A2A2A' : '#F5F5F5' }]}
          onPress={() => !deleteMode && setShowNotificationModal(true)}
          disabled={deleteMode}
        >
          <Text style={styles.bellIcon}>🔔</Text>
        </TouchableOpacity>
        
        {isPremium && friend.profilePictureUri ? (
          <TouchableOpacity
            style={styles.profilePictureContainer}
            onPress={() => !deleteMode && setShowPhotoUpload(true)}
            disabled={deleteMode}
          >
            <Image source={{ uri: friend.profilePictureUri }} style={[styles.profilePicture, { borderColor: colors.purple }]} />
          </TouchableOpacity>
        ) : isPremium ? (
          <TouchableOpacity
            style={[styles.profilePicturePlaceholder, {
              backgroundColor: colors.isDarkMode ? '#2A2A2A' : '#F5F5F5',
              borderColor: colors.border
            }]}
            onPress={() => !deleteMode && setShowPhotoUpload(true)}
            disabled={deleteMode}
          >
            <Text style={styles.profilePicturePlaceholderText}>📷</Text>
          </TouchableOpacity>
        ) : null}
        
        <View style={styles.nameSection}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: colors.purple }]} numberOfLines={1}>{friend.name}</Text>
            
            {!deleteMode && (
              <TouchableOpacity
                style={[styles.scheduleButton, { borderColor: colors.green }]}
                onPress={() => onScheduleNext(friend)}
              >
                <Text style={[styles.scheduleText, { color: colors.green }]}>Schedule next</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.typeIndicator}>
            <Text style={styles.typeIcon}>
              {friend.friendType === 'online' ? '🌐' : '📡'}
            </Text>
            <Text style={[styles.typeText, { color: colors.textSecondary }]}>
              {friend.friendType === 'online' ? 'Online' : 'Local'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.meetingsSection}>
        {displayMeetings.length === 0 ? (
          <Text style={[styles.noMeetingsText, { color: colors.textTertiary }]}>No meetings this year</Text>
        ) : (
          <>
            <View style={styles.meetingsContainer}>
              {displayMeetings.map((meeting, index) => (
                <Pressable
                  key={meeting.id}
                  style={[
                    getTokenStyle(meeting),
                    pressingMeetingId === meeting.id && styles.tokenPressing
                  ]}
                  onPress={() => handleTokenPress(meeting)}
                  onPressIn={() => handleLongPressStart(meeting.id)}
                  onPressOut={handleLongPressEnd}
                  disabled={deleteMode}
                >
                  <Text style={styles.tokenText}>{getTokenText(meeting)}</Text>
                </Pressable>
              ))}
              {hasMoreMeetings && !showAllMeetings && (
                <TouchableOpacity
                  style={[styles.moreToken, { backgroundColor: colors.orange }]}
                  onPress={() => !deleteMode && setShowAllMeetings(true)}
                  disabled={deleteMode}
                >
                  <Text style={styles.moreText}>+{yearMeetings.length - 5}</Text>
                </TouchableOpacity>
              )}
            </View>
            {showAllMeetings && hasMoreMeetings && (
              <TouchableOpacity 
                onPress={() => !deleteMode && setShowAllMeetings(false)}
                disabled={deleteMode}
              >
                <Text style={[styles.showLessText, { color: colors.purple }]}>Show less</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>

      {isPremium && friend.birthday && (
        <View style={styles.birthdayContainer}>
          <View style={styles.birthdayRow}>
            <Text style={[styles.birthdayRowText, { color: colors.textTertiary }]}>Birthday: {friend.birthday}</Text>
            <View style={styles.birthdayNotificationSection}>
              <Text style={[styles.birthdayRowText, { color: colors.textTertiary }]}>Birthday Notification</Text>
              <View style={[
                styles.notificationToggle,
                { backgroundColor: colors.isDarkMode ? '#2A2A2A' : '#E0E0E0' },
                friend.birthdayNotificationEnabled && { backgroundColor: colors.green }
              ]}>
                <View style={[
                  styles.notificationToggleThumb,
                  friend.birthdayNotificationEnabled && styles.notificationToggleThumbOn
                ]} />
              </View>
            </View>
          </View>
        </View>
      )}

      {isPremium && !deleteMode && (
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={handleToggleFavorite}
        >
          <Text style={styles.favoriteIcon}>
            {friend.isFavorite ? '⭐' : '☆'}
          </Text>
        </TouchableOpacity>
      )}

      <CancellationModal
        visible={showCancellationModal}
        friendName={friend.name}
        onSelectUser={handleCancellationByUser}
        onSelectFriend={handleCancellationByFriend}
        onCancel={() => {
          setShowCancellationModal(false);
          setSelectedMeetingForCancellation(null);
        }}
      />

      <NotificationModal
        visible={showNotificationModal && !deleteMode}
        friend={friend}
        onClose={() => setShowNotificationModal(false)}
      />

      {isPremium && (
        <PhotoUploadModal
          visible={showPhotoUpload}
          friendName={friend.name}
          onUpload={handlePhotoUpload}
          onClose={() => setShowPhotoUpload(false)}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  deleteMode: {
    borderWidth: 2,
  },
  deleteOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    alignItems: 'center',
    zIndex: 1,
  },
  deleteIcon: {
    fontSize: 20,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  notificationButton: {
    padding: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  bellIcon: {
    fontSize: 18,
  },
  profilePictureContainer: {
    marginRight: 12,
  },
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
  },
  profilePicturePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  profilePicturePlaceholderText: {
    fontSize: 16,
  },
  nameSection: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  scheduleButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  scheduleText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  favoriteButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    padding: 4,
    zIndex: 10,
  },
  favoriteIcon: {
    fontSize: 20,
  },
  typeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  typeIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  typeText: {
    fontSize: 14,
    marginRight: 12,
  },
  birthdayContainer: {
    marginTop: 4,
    marginBottom: 8,
    paddingRight: 40,
  },
  birthdayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  birthdayRowText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  birthdayNotificationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  notificationToggle: {
    width: 32,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  notificationToggleThumb: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
  },
  notificationToggleThumbOn: {
    alignSelf: 'flex-end',
  },
  meetingsSection: {
    marginBottom: 12,
  },
  meetingsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  metToken: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 4,
  },
  scheduledToken: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 4,
  },
  cancelledToken: {
    backgroundColor: '#FF4444',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 4,
  },
  cancelledByUserToken: {
    backgroundColor: '#FF69B4',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 4,
  },
  cancelledByFriendToken: {
    backgroundColor: '#FF4444',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 4,
  },
  tokenPressing: {
    opacity: 0.6,
    transform: [{ scale: 0.95 }],
  },
  tokenText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  moreToken: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 4,
  },
  moreText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  showLessText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  noMeetingsText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    zIndex: 999,
  },
});
