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
import { createSafeDbWrapper } from '../utils/safeDbWrapper';

export default function MainScreen() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [deleteMode, setDeleteMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAuthError, setHasAuthError] = useState(false);
  const navigation = useNavigation();
  const { db, signout } = useBasic();

  useEffect(() => {
    loadData();
  }, [db]);

  const loadData = async () => {
    if (!db) return;
    
    setIsLoading(true);
    setHasAuthError(false);
    
    const safeDb = createSafeDbWrapper(db, () => setHasAuthError(true));
    
    try {
      const [friendsResult, meetingsResult] = await Promise.all([
        safeDb.safeGetAll<Friend>('friends'),
        safeDb.safeGetAll<Meeting>('meetings')
      ]);
      
      if (friendsResult.shouldSignOut || meetingsResult.shouldSignOut) {
        setHasAuthError(true);
        return;
      }
      
      setFriends(friendsResult.data || []);
      setMeetings(meetingsResult.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      // Don't show alert here, let the error handling take care of it
    } finally {
      setIsLoading(false);
    }
  };

  const loadFriends = async () => {
    if (!db) return;
    
    const safeDb = createSafeDbWrapper(db, () => setHasAuthError(true));
    const result = await safeDb.safeGetAll<Friend>('friends');
    
    if (result.shouldSignOut) {
      setHasAuthError(true);
      return;
    }
    
    if (result.success) {
      setFriends(result.data || []);
    }
  };

  const loadMeetings = async () => {
    if (!db) return;
    
    const safeDb = createSafeDbWrapper(db, () => setHasAuthError(true));
    const result = await safeDb.safeGetAll<Meeting>('meetings');
    
    if (result.shouldSignOut) {
      setHasAuthError(true);
      return;
    }
    
    if (result.success) {
      setMeetings(result.data || []);
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
            if (!db) return;
            
            const safeDb = createSafeDbWrapper(db, () => setHasAuthError(true));
            
            try {
              // Delete all meetings for this friend
              const friendMeetings = meetings.filter(meeting => String(meeting.friendId) === String(friend.id));
              for (const meeting of friendMeetings) {
                const deleteResult = await safeDb.safeDelete('meetings', String(meeting.id));
                if (deleteResult.shouldSignOut) {
                  setHasAuthError(true);
                  return;
                }
              }
              
              // Delete all friendship memos for this friend
              const memosResult = await safeDb.safeGetAll('friendshipMemos');
              if (memosResult.shouldSignOut) {
                setHasAuthError(true);
                return;
              }
              
              if (memosResult.success && memosResult.data) {
                const friendMemos = (memosResult.data as any[]).filter((memo: any) => String(memo.friendId) === String(friend.id));
                for (const memo of friendMemos) {
                  const deleteMemoResult = await safeDb.safeDelete('friendshipMemos', String(memo.id));
                  if (deleteMemoResult.shouldSignOut) {
                    setHasAuthError(true);
                    return;
                  }
                }
              }
              
              // Delete the friend
              const deleteFriendResult = await safeDb.safeDelete('friends', String(friend.id));
              if (deleteFriendResult.shouldSignOut) {
                setHasAuthError(true);
                return;
              }
              
              if (deleteFriendResult.success) {
                // Reload data
                await loadFriends();
                await loadMeetings();
                
                setDeleteMode(false);
                Alert.alert('Success', `${friend.name} has been deleted.`);
              } else {
                Alert.alert('Error', deleteFriendResult.error || 'Failed to delete friend');
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

  // Show auth error screen if needed
  if (hasAuthError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.loadingContainer, { backgroundColor: '#FFF3CD' }]}>
          <Text style={[styles.loadingText, { color: '#856404', fontSize: 18, fontWeight: 'bold' }]}>
            🔐 Authentication Error
          </Text>
          <Text style={[styles.loadingText, { color: '#856404', marginTop: 10 }]}>
            Your session has expired. The app will handle this automatically.
          </Text>
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

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your friends...</Text>
        </View>
      ) : (
        <FlatList
          data={friends}
          renderItem={renderFriend}
          keyExtractor={(item) => String(item.id)}
          style={styles.friendsList}
          contentContainerStyle={styles.friendsListContent}
          showsVerticalScrollIndicator={false}
        />
      )}

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
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
