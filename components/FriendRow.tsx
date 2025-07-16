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
      <View style={styles.leftSection}>
        <Text style={styles.avatar}>{friend.profilePicture || '👤'}</Text>
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{friend.name}</Text>
          <View style={styles.friendTypeContainer}>
            <Text style={styles.friendTypeIcon}>
              {friend.friendType === 'online' ? '🌐' : '📡'}
            </Text>
            <Text style={styles.friendTypeText}>
              {friend.friendType === 'online' ? 'Online' : 'Local'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.middleSection}>
        <View style={styles.meetingsRow}>
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
              style={styles.plusToken}
              onPress={() => setShowAllMeetings(true)}
            >
              <Text style={styles.plusText}>+</Text>
            </TouchableOpacity>
          )}
        </View>
        {showAllMeetings && hasMoreMeetings && (
          <TouchableOpacity onPress={() => setShowAllMeetings(false)}>
            <Text style={styles.showLessText}>Show less</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.rightSection}>
        <TouchableOpacity
          style={styles.scheduleButton}
          onPress={() => onScheduleNext(friend)}
        >
          <Text style={styles.scheduleText}>Schedule next</Text>
        </TouchableOpacity>
        
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    fontSize: 30,
    marginRight: 12,
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 2,
  },
  friendTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendTypeIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  friendTypeText: {
    fontSize: 12,
    color: '#666666',
  },
  middleSection: {
    flex: 2,
    alignItems: 'center',
  },
  meetingsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  metToken: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginHorizontal: 2,
    marginVertical: 2,
  },
  metText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  plusToken: {
    backgroundColor: '#FF9800',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginHorizontal: 2,
    marginVertical: 2,
  },
  plusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  showLessText: {
    fontSize: 12,
    color: '#8000FF',
    marginTop: 5,
  },
  rightSection: {
    alignItems: 'center',
  },
  scheduleButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 5,
  },
  scheduleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  notificationButton: {
    padding: 5,
  },
  bellIcon: {
    fontSize: 16,
  },
});
