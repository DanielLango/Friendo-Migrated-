import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Friend, Meeting } from '../types';
import NotificationModal from './NotificationModal';

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

  const currentYear = new Date().getFullYear();
  const yearMeetings = meetings.filter(meeting => 
    new Date(meeting.date).getFullYear() === currentYear
  );

  const displayMeetings = showAllMeetings ? yearMeetings : yearMeetings.slice(0, 5);
  const hasMoreMeetings = yearMeetings.length > 5;

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
            <TouchableOpacity
              key={meeting.id}
              style={styles.metToken}
              onPress={() => onMeetingPress(meeting)}
              disabled={deleteMode}
            >
              <Text style={styles.metText}>met</Text>
            </TouchableOpacity>
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
  deleteText: {
    fontSize: 10,
    color: '#FF4444',
    fontWeight: '600',
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
  scheduleButtonDisabled: {
    borderColor: '#FF4444',
  },
  scheduleText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scheduleTextDisabled: {
    color: '#FF4444',
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
  metText: {
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
