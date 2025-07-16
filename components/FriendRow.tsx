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
}

export default function FriendRow({ 
  friend, 
  meetings, 
  onScheduleNext, 
  onMeetingPress 
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
    <View style={styles.container}>
      {/* Friend Info Section */}
      <View style={styles.friendInfo}>
        <Text style={styles.avatar}>{friend.profilePicture || '👤'}</Text>
        <View style={styles.nameSection}>
          <Text style={styles.name} numberOfLines={1}>{friend.name}</Text>
          <View style={styles.typeIndicator}>
            <Text style={styles.typeIcon}>
              {friend.friendType === 'online' ? '🌐' : '📡'}
            </Text>
            <Text style={styles.typeText}>
              {friend.friendType === 'online' ? 'Online' : 'Local'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.scheduleButton}
          onPress={() => onScheduleNext(friend)}
        >
          <Text style={styles.scheduleText}>Schedule next</Text>
        </TouchableOpacity>
      </View>

      {/* Meetings Section */}
      <View style={styles.meetingsSection}>
        <View style={styles.meetingsContainer}>
          {displayMeetings.map((meeting, index) => (
            <TouchableOpacity
              key={meeting.id}
              style={styles.metToken}
              onPress={() => onMeetingPress(meeting)}
            >
              <Text style={styles.metText}>met</Text>
            </TouchableOpacity>
          ))}
          {hasMoreMeetings && !showAllMeetings && (
            <TouchableOpacity
              style={styles.moreToken}
              onPress={() => setShowAllMeetings(true)}
            >
              <Text style={styles.moreText}>+{yearMeetings.length - 5}</Text>
            </TouchableOpacity>
          )}
        </View>
        {showAllMeetings && hasMoreMeetings && (
          <TouchableOpacity onPress={() => setShowAllMeetings(false)}>
            <Text style={styles.showLessText}>Show less</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Actions Section */}
      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => setShowNotificationModal(true)}
        >
          <Text style={styles.bellIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      <NotificationModal
        visible={showNotificationModal}
        friend={friend}
        onClose={() => setShowNotificationModal(false)}
      />
    </View>
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
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    fontSize: 32,
    marginRight: 12,
  },
  nameSection: {
    flex: 1,
    minWidth: 0, // Important for text truncation
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
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
  actionsSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  scheduleButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
  },
  scheduleText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: 'bold',
  },
  notificationButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  bellIcon: {
    fontSize: 18,
  },
});
