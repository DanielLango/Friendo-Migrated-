import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useBasic } from '@basictech/expo';
import { Friend, Meeting } from '../types';
import FriendRow from '../components/FriendRow';

export default function MainScreen() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const navigation = useNavigation();
  const { db, signout } = useBasic();

  useEffect(() => {
    loadFriends();
    loadMeetings();
  }, [db]);

  const loadFriends = async () => {
    if (db) {
      try {
        const friendsData = await db.from('friends').getAll();
        setFriends((friendsData || []) as any);
      } catch (error) {
        console.error('Error loading friends:', error);
      }
    }
  };

  const loadMeetings = async () => {
    if (db) {
      try {
        const meetingsData = await db.from('meetings').getAll();
        setMeetings((meetingsData || []) as any);
      } catch (error) {
        console.error('Error loading meetings:', error);
      }
    }
  };

  const handleScheduleNext = (friend: Friend) => {
    (navigation as any).navigate('MeetingCreate', { friend });
  };

  const handleMeetingPress = (meeting: Meeting) => {
    const meetingDate = new Date(meeting.date).toLocaleDateString();
    Alert.alert('Meeting Details', `Met on ${meetingDate}`);
  };

  const handleStats = () => {
    (navigation as any).navigate('Stats');
  };

  const handleAddMore = () => {
    (navigation as any).navigate('ManualAdd');
  };

  const handleProfile = () => {
    Alert.alert(
      'Profile',
      'Profile settings coming soon!',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', onPress: signout, style: 'destructive' }
      ]
    );
  };

  const getFriendMeetings = (friendId: string) => {
    return meetings.filter(meeting => meeting.friendId === friendId);
  };

  const renderFriend = ({ item }: { item: Friend }) => (
    <FriendRow
      friend={item}
      meetings={getFriendMeetings(item.id)}
      onScheduleNext={handleScheduleNext}
      onMeetingPress={handleMeetingPress}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Friendo</Text>
        <Text style={styles.subtitle}>Your Friends ({friends.length})</Text>
      </View>

      <FlatList
        data={friends}
        renderItem={renderFriend}
        keyExtractor={(item) => item.id}
        style={styles.friendsList}
        contentContainerStyle={styles.friendsListContent}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.bottomNavigation}>
        <TouchableOpacity style={styles.navButton} onPress={handleStats}>
          <Text style={styles.navButtonText}>📊 Stats</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton} onPress={handleAddMore}>
          <Text style={styles.navButtonText}>➕ Add More</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton} onPress={handleProfile}>
          <Text style={styles.navButtonText}>👤 Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8000FF',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  friendsList: {
    flex: 1,
  },
  friendsListContent: {
    paddingVertical: 8,
  },
  bottomNavigation: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
  },
  navButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8000FF',
  },
});
