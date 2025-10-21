import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Pressable,
} from 'react-native';
import { Friend, Meeting } from '../types';
import NotificationModal from './NotificationModal';
import { useBasic } from '@basictech/expo';

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
  const { db } = useBasic();
  
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [pressingMeetingId, setPressingMeetingId] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();
  
  // Filter meetings for current year and update status based on date
  const yearMeetings = meetings
    .filter(meeting => new Date(meeting.date).getFullYear() === currentYear)
    .map(meeting => {
      const meetingDate = new Date(meeting.date);
      const now = new Date();
      
      // Set time to end of day for comparison
      const endOfMeetingDay = new Date(meetingDate);
      endOfMeetingDay.setHours(23, 59, 59, 999);
      
      // If meeting is cancelled, keep it cancelled
      if (meeting.status === 'cancelled') {
        return meeting;
      }
      
      // If meeting date has passed (after 23:59), mark as met
      if (now > endOfMeetingDay) {
        return { ...meeting, status: 'met' as const };
      }
      
      // Otherwise, it's scheduled
      return { ...meeting, status: 'scheduled' as const };
    });

  const displayMeetings = showAllMeetings ? yearMeetings : yearMeetings.slice(0, 5);
  const hasMoreMeetings = yearMeetings.length > 5;

  const handleLongPressStart = (meetingId: string) => {
    setPressingMeetingId(meetingId);
    longPressTimer.current = setTimeout(() => {
      handleLongPressComplete(meetingId);
    }, 8000); // 8 seconds
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

    if (meeting.status === 'cancelled') {
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
                if (!db) {
                  Alert.alert('Error', 'Database not available. Please try again.');
                  return;
                }
                
                await db.from('meetings').delete(String(meeting.id));
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
      // If not cancelled, offer to cancel
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
                if (!db) {
                  Alert.alert('Error', 'Database not available. Please try again.');
                  return;
                }
                
                // Update with all existing fields plus the new status
                const updatedMeeting = {
                  date: meeting.date,
                  notes: meeting.notes || '',
                  venue: meeting.venue || '',
                  activity: meeting.activity || '',
                  friendId: String(meeting.friendId),
                  createdAt: meeting.createdAt || Date.now(),
                  city: meeting.city || '',
                  status: 'cancelled'
                };
                
                await db.from('meetings').replace(String(meeting.id), updatedMeeting);
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

      <NotificationModal
        visible={showNotificationModal && !deleteMode}
        friend={friend}
        onClose={() => setShowNotificationModal(false)}
      />
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
  typeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  typeText: {
    fontSize: 14,
    color: '#666666',
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
});
