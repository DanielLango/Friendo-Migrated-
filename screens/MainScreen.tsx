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
  const [deleteMode, setDeleteMode] = useState(false);
  const [sortMode, setSortMode] = useState<'default' | 'name' | 'tokens'>('default');
  const navigation = useNavigation();
  const { db, signout } = useBasic();

  useEffect(() => {
    loadFriends();
    loadMeetings();
    scheduleAnnualReset();
  }, [db]);

  const loadFriends = async () => {
    if (db) {
      try {
        const friendsData = await db.from('friends').getAll();
        setFriends((friendsData || []) as unknown as Friend[]);
      } catch (error) {
        console.error('Error loading friends:', error);
      }
    }
  };

  const loadMeetings = async () => {
    if (db) {
      try {
        const meetingsData = await db.from('meetings').getAll();
        setMeetings((meetingsData || []) as unknown as Meeting[]);
      } catch (error) {
        console.error('Error loading meetings:', error);
      }
    }
  };

  const scheduleAnnualReset = () => {
    const now = new Date();
    const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    const timeUntilReset = endOfYear.getTime() - now.getTime();

    if (timeUntilReset > 0) {
      setTimeout(async () => {
        await performAnnualReset();
        scheduleAnnualReset();
      }, timeUntilReset);
    }
  };

  const performAnnualReset = async () => {
    if (!db) return;

    try {
      const currentYear = new Date().getFullYear();
      const allMeetings = await db.from('meetings').getAll();
      
      for (const meeting of (allMeetings || []) as unknown as Meeting[]) {
        const meetingYear = new Date(meeting.date).getFullYear();
        const status = meeting.status || 'met';
        
        if (meetingYear === currentYear && (status === 'met' || status === 'cancelled')) {
          await db.from('meetings').delete(String(meeting.id));
        }
      }
      
      await loadMeetings();
    } catch (error) {
      console.error('Error performing annual reset:', error);
    }
  };

  const handleDeleteFriend = async (friend: Friend) => {
    Alert.alert(
      'Delete Friend',
      `Are you sure you want to delete ${friend.name}? This will also delete all meeting data for this friend.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              if (db) {
                const friendMeetings = meetings.filter(meeting => String(meeting.friendId) === String(friend.id));
                for (const meeting of friendMeetings) {
                  await db.from('meetings').delete(String(meeting.id));
                }
                
                try {
                  const friendshipMemos = await db.from('friendshipMemos').getAll();
                  const friendMemos = (friendshipMemos || []).filter((memo: any) => String(memo.friendId) === String(friend.id));
                  for (const memo of friendMemos) {
                    await db.from('friendshipMemos').delete(String(memo.id));
                  }
                } catch (error) {
                  console.log('No friendship memos to delete or error:', error);
                }
                
                await db.from('friends').delete(String(friend.id));
                
                await loadFriends();
                await loadMeetings();
                
                setDeleteMode(false);
                Alert.alert('Success', `${friend.name} has been deleted.`);
              }
            } catch (error) {
              console.error('Error deleting friend:', error);
              Alert.alert('Error', 'Failed to delete friend. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleScheduleNext = (friend: Friend) => {
    if (deleteMode) {
      handleDeleteFriend(friend);
    } else {
      (navigation as any).navigate('MeetingCreate', { friend });
    }
  };

  const handleMeetingPress = (meeting: Meeting) => {
    if (!deleteMode) {
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
    }
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
    const currentYear = new Date().getFullYear();
    
    return meetings.filter(meeting => {
      if (String(meeting.friendId) !== friendId) return false;
      
      const meetingYear = new Date(meeting.date).getFullYear();
      return meetingYear === currentYear;
    });
  };

  const getFriendMeetingCount = (friendId: string) => {
    return getFriendMeetings(friendId).filter(meeting => {
      const isCancelled = meeting.notes?.startsWith('[CANCELLED]');
      return !isCancelled;
    }).length;
  };

  const getSortedFriends = () => {
    const friendsWithMeetings = friends.map(friend => ({
      ...friend,
      meetingCount: getFriendMeetingCount(String(friend.id))
    }));

    if (sortMode === 'name') {
      return [...friendsWithMeetings].sort((a, b) => 
        a.name.localeCompare(b.name)
      );
    } else if (sortMode === 'tokens') {
      return [...friendsWithMeetings].sort((a, b) => 
        b.meetingCount - a.meetingCount
      );
    }
    
    return [...friendsWithMeetings].sort((a, b) => 
      (a.createdAt || 0) - (b.createdAt || 0)
    );
  };

  const cycleSortMode = () => {
    if (sortMode === 'default') {
      setSortMode('name');
    } else if (sortMode === 'name') {
      setSortMode('tokens');
    } else {
      setSortMode('default');
    }
  };

  const getSortLabel = () => {
    if (sortMode === 'name') return 'A-Z';
    if (sortMode === 'tokens') return 'Met Tokens';
    return 'Default';
  };

  const renderFriend = ({ item }: { item: Friend }) => (
    <FriendRow
      friend={item}
      meetings={getFriendMeetings(String(item.id))}
      onScheduleNext={handleScheduleNext}
      onMeetingPress={handleMeetingPress}
      deleteMode={deleteMode}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.sortContainer}>
            <Text style={styles.sortLabel}>Sorting</Text>
            <TouchableOpacity 
              style={styles.sortButton}
              onPress={cycleSortMode}
            >
              <Text style={styles.sortButtonText}>{getSortLabel()}</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.centerContent}>
            <Text style={styles.title}>Friendo</Text>
            <Text style={styles.subtitle}>Your Friends ({friends.length})</Text>
          </View>
          
          <View style={styles.deleteContainer}>
            <Text style={styles.deleteLabel}>Delete</Text>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => setDeleteMode(!deleteMode)}
            >
              <Text style={styles.deleteButtonText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {deleteMode && (
        <View style={styles.deleteModeHeader}>
          <Text style={styles.deleteModeText}>Tap a friend to delete them</Text>
          <TouchableOpacity onPress={() => setDeleteMode(false)}>
            <Text style={styles.cancelDeleteText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={getSortedFriends()}
        renderItem={renderFriend}
        keyExtractor={(item) => String(item.id)}
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
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  centerContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 0,
    pointerEvents: 'none',
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
  sortContainer: {
    alignItems: 'center',
  },
  sortLabel: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 4,
    fontWeight: '500',
  },
  sortButton: {
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
  },
  deleteContainer: {
    alignItems: 'center',
  },
  deleteLabel: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 4,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 20,
  },
  deleteModeHeader: {
    backgroundColor: '#FFE6E6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#FFB3B3',
  },
  deleteModeText: {
    fontSize: 14,
    color: '#CC0000',
    fontWeight: '500',
  },
  cancelDeleteText: {
    fontSize: 14,
    color: '#8000FF',
    fontWeight: '600',
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
