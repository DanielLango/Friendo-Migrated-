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
        setFriends(friendsData || []);
      } catch (error) {
        console.error('Error loading friends:', error);
      }
    }
  };

  const loadMeetings = async () => {
    if (db) {
      try {
        const meetingsData = await db.from('meetings').getAll();
        setMeetings(meetingsData || []);
      } catch (error) {
        console.error('Error loading meetings:', error);
      }
    }
  };

  const handleScheduleNext = (friend: Friend) => {
    navigation.navigate('MeetingCreate' as never, { friend });
  };

  const handleMeetingPress = (meeting: Meeting) => {
    const meetingDate = new Date(meeting.date).toLocaleDateString();
    Alert.alert('Meeting Details', `Met on ${meetingDate}`);
  };

  const handleStats = () => {
    navigation.navigate('Stats' as never);
  };

  const handleAddMore = () => {
    navigation.navigate('Sync' as never);
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
        <Text style={styles.subtitle}>Your Friends ({friends.length}/50)</Text>
      </View>

      <FlatList
        data={friends}
        renderItem={renderFriend}
        keyExtractor={(item) => item.id}
        style={styles.friendsList}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.bottomNavigation}>
        <TouchableOpacity style={styles.navButton} onPress={handleStats}>
          <Text style={styles.navButtonText}>Stats</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton} onPress={handleAddMore}>
          <Text style={styles.navButtonText}>Add More</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton} onPress={handleProfile}>
          <Text style={styles.navButtonText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
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
  bottomNavigation: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
  },
  navButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8000FF',
  },
});