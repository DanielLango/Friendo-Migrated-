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
import { handleBasicTechError, clearAllAuthData } from '../utils/authUtils';

export default function MainScreen() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [deleteMode, setDeleteMode] = useState(false);
  const [hasAuthError, setHasAuthError] = useState(false);
  const navigation = useNavigation();
  const { db, signout, isSignedIn } = useBasic();

  useEffect(() => {
    if (isSignedIn && db) {
      loadData();
    }
  }, [db, isSignedIn]);

  const loadData = async () => {
    try {
      await Promise.all([loadFriends(), loadMeetings()]);
      setHasAuthError(false); // Reset error state on successful load
    } catch (error) {
      console.error('Error loading data:', error);
      handleDataLoadError(error);
    }
  };

  const handleDataLoadError = (error: any) => {
    const errorInfo = handleBasicTechError(error);
    
    if (errorInfo.type === 'TOKEN_ERROR') {
      setHasAuthError(true);
      Alert.alert(
        'Session Expired',
        'Your authentication session has expired. Please clear your auth data and sign in again.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Clear Auth Data', 
            onPress: handleClearAuthAndSignOut,
            style: 'destructive'
          }
        ]
      );
    } else {
      Alert.alert('Error', 'Failed to load data. Please try again.');
    }
  };

  const handleClearAuthAndSignOut = async () => {
    try {
      await clearAllAuthData();
      await signout();
      // Navigation back to login will happen automatically via App.tsx
    } catch (error) {
      console.error('Error clearing auth data:', error);
      Alert.alert('Notice', 'Please restart the app and try again.');
    }
  };

  const loadFriends = async () => {
    if (db) {
      try {
        const friendsData = await db.from('friends').getAll();
        setFriends((friendsData || []) as unknown as Friend[]);
      } catch (error) {
        console.error('Error loading friends:', error);
        throw error; // Re-throw to be caught by loadData
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
        throw error; // Re-throw to be caught by loadData
      }
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
                // Delete all meetings for this friend
                const friendMeetings = meetings.filter(meeting => String(meeting.friendId) === String(friend.id));
                for (const meeting of friendMeetings) {
                  await db.from('meetings').delete(String(meeting.id));
                }
                
                // Delete all friendship memos for this friend
                try {
                  const friendshipMemos = await db.from('friendshipMemos').getAll();
                  const friendMemos = (friendshipMemos || []).filter((memo: any) => String(memo.friendId) === String(friend.id));
                  for (const memo of friendMemos) {
                    await db.from('friendshipMemos').delete(String(memo.id));
                  }
                } catch (error) {
                  console.log('No friendship memos to delete or error:', error);
                }
                
                // Delete the friend
                await db.from('friends').delete(String(friend.id));
                
                // Reload data
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
      Alert.alert('Meeting Details', `Met on ${meetingDate}`);
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
    return meetings.filter(meeting => String(meeting.friendId) === friendId);
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

  // If there's an auth error, show error state
  if (hasAuthError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Authentication Error</Text>
          <Text style={styles.errorText}>
            Your session has expired. Please clear your authentication data and sign in again.
          </Text>
          <TouchableOpacity 
            style={styles.clearAuthButton}
            onPress={handleClearAuthAndSignOut}
          >
            <Text style={styles.clearAuthButtonText}>Clear Auth Data & Sign Out</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setHasAuthError(false);
              loadData();
            }}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Friendo</Text>
        <Text style={styles.subtitle}>Your Friends ({friends.length})</Text>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => setDeleteMode(!deleteMode)}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
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
        data={friends}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  clearAuthButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginBottom: 15,
  },
  clearAuthButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  retryButton: {
    backgroundColor: '#8000FF',
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    alignItems: 'center',
    position: 'relative',
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
  deleteButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 8,
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
