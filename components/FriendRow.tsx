import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Pressable,
  Image,
} from 'react-native';
import { Friend, Meeting } from '../types';
import NotificationModal from './NotificationModal';
import CancellationModal from './CancellationModal';
import PhotoUploadModal from './PhotoUploadModal';
import BirthdaySettings from './BirthdaySettings';
import { getMeetings, saveMeetings } from '../utils/storage';
import { saveFriends, getFriends } from '../utils/storage';
import { isPremiumUser } from '../utils/premiumFeatures';

interface FriendRowProps {
  friend: Friend;
  meetings: Meeting[];
  onScheduleNext: (friend: Friend) => void;
  onMeetingPress: (meeting: Meeting) => void;
  deleteMode?: boolean;
}

export default function FriendRow({ 
  friend, 
  meetings, 
  onScheduleNext, 
  onMeetingPress,
  deleteMode = false
}: FriendRowProps) {
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showAllMeetings, setShowAllMeetings] = useState(false);
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [selectedMeetingForCancellation, setSelectedMeetingForCancellation] = useState<Meeting | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [showBirthdaySettings, setShowBirthdaySettings] = useState(false);
  
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [pressingMeetingId, setPressingMeetingId] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();
  
  console.log(`FriendRow for ${friend.name}: received ${meetings.length} meetings`);
  meetings.forEach(m => {
    console.log(`  - Meeting ${m.id}: date=${m.date}, notes=${m.notes?.substring(0, 50)}`);
  });
  
  // Filter meetings for current year and update status based on date
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
      
      // Set time to end of day for comparison
      const endOfMeetingDay = new Date(meetingDate);
      endOfMeetingDay.setHours(23, 59, 59, 999);
      
      // Check if cancelled by looking at notes
      const isCancelled = meeting.notes?.startsWith('[CANCELLED]');
      
      // If meeting is cancelled, keep it cancelled
      if (isCancelled) {
        console.log(`Meeting ${meeting.id} is CANCELLED`);
        return { ...meeting, status: 'cancelled' as const };
      }
      
      // If meeting date has passed (after 23:59), mark as met
      if (now > endOfMeetingDay) {
        console.log(`Meeting ${meeting.id} is MET (date passed)`);
        return { ...meeting, status: 'met' as const };
      }
      
      // Otherwise, it's scheduled
      console.log(`Meeting ${meeting.id} is SCHEDULED (future date)`);
      return { ...meeting, status: 'scheduled' as const };
    })
    .sort((a, b) => {
      // Sort by date, earliest first
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateA - dateB;
    });

  const displayMeetings = showAllMeetings ? yearMeetings : yearMeetings.slice(0, 5);
  const hasMoreMeetings = yearMeetings.length > 5;

  console.log(`Friend ${friend.name} has ${yearMeetings.length} meetings this year to display`);
  console.log(`Display meetings:`, displayMeetings.map(m => ({ id: m.id, status: m.status })));

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
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handlePhotoUpload = async (uri: string) => {
    try {
      const allFriends = await getFriends();
      const updatedFriends = allFriends.map(f => {
        if (f.id === friend.id) {
          return { ...f, profilePictureUri: uri };
        }
        return f;
      });
      await saveFriends(updatedFriends);
    } catch (error) {
      console.error('Error updating profile picture:', error);
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
    } catch (error) {
      console.error('Error updating birthday:', error);
    }
  };

  const handleLongPressStart = (meetingId: string) => {
    setPressingMeetingId(meetingId);
    longPressTimer.current = setTimeout(() => {
      handleLongPressComplete(meetingId);
    }, 1000); // Changed from 3000 to 1000 (1 second)
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

    // Check if meeting is cancelled by looking at the notes field
    const isCancelled = meeting.notes?.startsWith('[CANCELLED]');

    if (isCancelled) {
      // If already cancelled, offer to erase completely
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
      // Check if user is premium
      const isPremium = await isPremiumUser();
      
      if (isPremium) {
        // Premium users get the "who cancelled" modal
        setSelectedMeetingForCancellation(meeting);
        setShowCancellationModal(true);
      } else {
        // Free users get the old behavior
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
      // Check who cancelled (premium feature)
      if (meeting.cancelledBy === 'user') {
        return styles.cancelledByUserToken; // Pink
      } else if (meeting.cancelledBy === 'friend') {
        return styles.cancelledByFriendToken; // Red
      }
      // Default red for non-premium or old cancelled meetings
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
      style={[styles.container, deleteMode && styles.deleteMode]}
      onPress={() => deleteMode && onScheduleNext(friend)}
      disabled={!deleteMode}
    >
      {deleteMode && (
        <View style={styles.deleteOverlay}>
          <Text style={styles.deleteIcon}>🗑️</Text>
        </View>
      )}
      
      {/* Friend Info Section */}
      <View style={styles.friendInfo}>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => !deleteMode && setShowNotificationModal(true)}
          disabled={deleteMode}
        >
          <Text style={styles.bellIcon}>🔔</Text>
        </TouchableOpacity>
        
        {/* Premium: Profile Picture */}
        {isPremium && friend.profilePictureUri ? (
          <TouchableOpacity
            style={styles.profilePictureContainer}
            onPress={() => !deleteMode && setShowPhotoUpload(true)}
            disabled={deleteMode}
          >
            <Image source={{ uri: friend.profilePictureUri }} style={styles.profilePicture} />
          </TouchableOpacity>
        ) : isPremium ? (
          <TouchableOpacity
            style={styles.profilePicturePlaceholder}
            onPress={() => !deleteMode && setShowPhotoUpload(true)}
            disabled={deleteMode}
          >
            <Text style={styles.profilePicturePlaceholderText}>📷</Text>
          </TouchableOpacity>
        ) : null}
        
        <View style={styles.nameSection}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{friend.name}</Text>
            
            {!deleteMode && (
              <TouchableOpacity
                style={styles.scheduleButton}
                onPress={() => onScheduleNext(friend)}
              >
                <Text style={styles.scheduleText}>Schedule next</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.typeIndicator}>
            <Text style={styles.typeIcon}>
              {friend.friendType === 'online' ? '🌐' : '📡'}
            </Text>
            <Text style={styles.typeText}>
              {friend.friendType === 'online' ? 'Online' : 'Local'}
            </Text>
            
            {/* Premium: Birthday indicator */}
            {isPremium && friend.birthday && (
              <TouchableOpacity
                style={styles.birthdayIndicator}
                onPress={() => !deleteMode && setShowBirthdaySettings(true)}
                disabled={deleteMode}
              >
                <Text style={styles.birthdayIcon}>🎂</Text>
                <Text style={styles.birthdayText}>{friend.birthday}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Meetings Section */}
      <View style={styles.meetingsSection}>
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
              style={styles.moreToken}
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
            <Text style={styles.showLessText}>Show less</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Premium: Favorite Star - Bottom Right Corner */}
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

      {/* Premium: Photo Upload Modal */}
      {isPremium && (
        <PhotoUploadModal
          visible={showPhotoUpload}
          friendName={friend.name}
          onUpload={handlePhotoUpload}
          onClose={() => setShowPhotoUpload(false)}
        />
      )}

      {/* Premium: Birthday Settings Modal */}
      {isPremium && showBirthdaySettings && (
        <View style={styles.birthdaySettingsModal}>
          <BirthdaySettings
            friend={friend}
            onUpdate={handleBirthdayUpdate}
          />
          <TouchableOpacity
            style={styles.closeBirthdayButton}
            onPress={() => setShowBirthdaySettings(false)}
          >
            <Text style={styles.closeBirthdayButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
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
    borderColor: '#FF4444',
    backgroundColor: '#FFF5F5',
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
    backgroundColor: '#F5F5F5',
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
    borderColor: '#8000FF',
  },
  profilePicturePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
    color: '#8000FF',
    flex: 1,
    marginRight: 8,
  },
  scheduleButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  scheduleText: {
    color: '#4CAF50',
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
    fontSize: 24,
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
    color: '#666666',
    marginRight: 12,
  },
  birthdayIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  birthdayIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  birthdayText: {
    fontSize: 11,
    color: '#666666',
    fontWeight: '600',
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
    backgroundColor: '#FF69B4', // Pink
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 4,
  },
  cancelledByFriendToken: {
    backgroundColor: '#FF4444', // Red
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
    backgroundColor: '#FF9800',
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
    color: '#8000FF',
    marginTop: 4,
    textAlign: 'center',
  },
  birthdaySettingsModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    zIndex: 100,
  },
  closeBirthdayButton: {
    backgroundColor: '#8000FF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  closeBirthdayButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});