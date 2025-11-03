import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Friend, Meeting } from '../types';
import FriendRow from '../components/FriendRow';
import Paywall from '../components/Paywall';
import { getFriends, getMeetings, deleteFriend, deleteMeetingsByFriendId, logout } from '../utils/storage';
import { shouldShowPaywall, markPaywallShown } from '../utils/paywallUtils';
import { isPremiumUser } from '../utils/premiumFeatures';
import { cleanupOrphanedMeetings, getDatabaseDiagnostics } from '../utils/dataRecovery';
import { useTheme } from '../utils/themeContext';

export default function MainScreen() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [deleteMode, setDeleteMode] = useState(false);
  const [sortMode, setSortMode] = useState<'default' | 'name' | 'tokens'>('default');
  const [showPaywall, setShowPaywall] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const { colors } = useTheme();
  const navigation = useNavigation();

  useEffect(() => {
    loadData();
    scheduleAnnualReset();
    checkPaywallStatus();
    checkPremiumStatus();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
      checkPaywallStatus();
    });
    return unsubscribe;
  }, [navigation]);

  const checkPaywallStatus = async () => {
    const premium = await isPremiumUser();
    setIsPremium(premium);

    if (!premium) {
      const shouldShow = await shouldShowPaywall();
      if (shouldShow) {
        setShowPaywall(true);
        await markPaywallShown();
      }
    }
  };

  const checkPremiumStatus = async () => {
    const premium = await isPremiumUser();
    setIsPremium(premium);
  };

  const loadData = async () => {
    const friendsData = await getFriends();
    const meetingsData = await getMeetings();
    
    console.log('=== LOADED DATA ===');
    console.log(`Total friends: ${friendsData.length}`);
    console.log(`Total meetings: ${meetingsData.length}`);
    
    if (meetingsData.length > 0) {
      console.log('All meetings:');
      meetingsData.forEach(m => {
        console.log(`  Meeting ${m.id}:`);
        console.log(`    friendId: ${m.friendId}`);
        console.log(`    date: ${m.date}`);
        console.log(`    activity: ${m.activity}`);
        console.log(`    notes: ${m.notes?.substring(0, 50)}`);
      });
    }
    
    if (friendsData.length > 0) {
      console.log('All friends:');
      friendsData.forEach(f => {
        console.log(`  Friend ${f.id}: ${f.name}`);
      });
    }
    
    setFriends(friendsData);
    setMeetings(meetingsData);
  };

  const handlePaywallSuccess = async () => {
    setShowPaywall(false);
    setIsPremium(true);
    Alert.alert(
      'Welcome to Premium! 🎉',
      'Thank you for supporting Friendo! You now have access to all premium features.',
      [{ text: 'Awesome!', style: 'default' }]
    );
  };

  const handlePaywallClose = () => {
    setShowPaywall(false);
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
    try {
      const currentYear = new Date().getFullYear();
      const allMeetings = await getMeetings();
      
      const updatedMeetings = allMeetings.filter((meeting) => {
        const meetingYear = new Date(meeting.date).getFullYear();
        const status = meeting.status || 'met';
        return !(meetingYear === currentYear && (status === 'met' || status === 'cancelled'));
      });
      
      const { saveMeetings } = await import('../utils/storage');
      await saveMeetings(updatedMeetings);
      await loadData();
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
              await deleteMeetingsByFriendId(friend.id);
              await deleteFriend(friend.id);
              await loadData();
              setDeleteMode(false);
              Alert.alert('Success', `${friend.name} has been deleted.`);
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
    (navigation as any).navigate('Profile');
  };

  const handleTestSupabase = async () => {
    const { testSupabaseConnection } = await import('../utils/testSupabase');
    await testSupabaseConnection();
    Alert.alert('Test Complete', 'Check the console for results');
  };

  const handleDiagnostics = async () => {
    const diagnostics = await getDatabaseDiagnostics();
    
    if ('error' in diagnostics) {
      Alert.alert('Error', diagnostics.error);
      return;
    }

    const message = `
Friends: ${diagnostics.friendsCount}
Meetings: ${diagnostics.meetingsCount}
Orphaned Meetings: ${diagnostics.orphanedMeetingsCount}

${diagnostics.orphanedMeetingsCount > 0 ? 'You have orphaned meetings (meetings without friends). Would you like to clean them up?' : 'Everything looks good!'}
    `.trim();

    console.log('=== DATABASE DIAGNOSTICS ===');
    console.log(JSON.stringify(diagnostics, null, 2));

    if (diagnostics.orphanedMeetingsCount > 0) {
      Alert.alert(
        'Database Diagnostics',
        message,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Clean Up',
            style: 'destructive',
            onPress: async () => {
              const result = await cleanupOrphanedMeetings();
              Alert.alert(
                result.success ? 'Success' : 'Error',
                result.message
              );
              if (result.success) {
                await loadData();
              }
            }
          }
        ]
      );
    } else {
      Alert.alert('Database Diagnostics', message);
    }
  };

  const getFriendMeetings = (friendId: string) => {
    const currentYear = new Date().getFullYear();
    
    const friendMeetings = meetings.filter(meeting => {
      if (meeting.friendId !== friendId) return false;
      
      const meetingYear = new Date(meeting.date).getFullYear();
      const isCurrentYear = meetingYear === currentYear;
      
      console.log(`Meeting ${meeting.id} for friend ${friendId}: date=${meeting.date}, year=${meetingYear}, isCurrentYear=${isCurrentYear}`);
      
      return isCurrentYear;
    });
    
    console.log(`Friend ${friendId} has ${friendMeetings.length} meetings in ${currentYear}`);
    return friendMeetings;
  };

  const getFriendMeetingCount = (friendId: string) => {
    const friendMeetings = getFriendMeetings(friendId);
    const nonCancelledCount = friendMeetings.filter(meeting => {
      const isCancelled = meeting.notes?.startsWith('[CANCELLED]');
      return !isCancelled;
    }).length;
    
    console.log(`Friend ${friendId} has ${nonCancelledCount} non-cancelled meetings`);
    return nonCancelledCount;
  };

  const getSortedFriends = () => {
    const friendsWithMeetings = friends.map(friend => ({
      ...friend,
      meetingCount: getFriendMeetingCount(friend.id)
    }));

    if (sortMode === 'default' && isPremium) {
      return [...friendsWithMeetings].sort((a, b) => {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return (a.createdAt || 0) - (b.createdAt || 0);
      });
    }

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
      meetings={getFriendMeetings(item.id)}
      onScheduleNext={handleScheduleNext}
      onMeetingPress={handleMeetingPress}
      deleteMode={deleteMode}
      onDataChange={loadData}
    />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Modal
        visible={showPaywall}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handlePaywallClose}
      >
        <Paywall 
          onSuccess={handlePaywallSuccess}
          onClose={handlePaywallClose}
        />
      </Modal>

      <View style={[styles.header, {
        backgroundColor: colors.cardBackground,
        borderBottomColor: colors.border
      }]}>
        <View style={styles.headerTop}>
          <View style={styles.sortContainer}>
            <Text style={[styles.sortLabel, { color: colors.textSecondary }]}>Sorting</Text>
            <TouchableOpacity 
              style={[styles.sortButton, { 
                backgroundColor: colors.isDarkMode ? '#2A2A2A' : '#F0F0F0'
              }]}
              onPress={cycleSortMode}
            >
              <Text style={[styles.sortButtonText, { color: colors.textSecondary }]}>{getSortLabel()}</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.centerContent}>
            <Text style={[styles.title, { color: colors.purple }]}>Friendo</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Your Friends ({friends.length})</Text>
          </View>
          
          <View style={styles.deleteContainer}>
            <Text style={[styles.deleteLabel, { color: colors.textSecondary }]}>Delete</Text>
            <TouchableOpacity 
              style={[styles.deleteButton, { 
                backgroundColor: colors.isDarkMode ? '#2A2A2A' : '#F0F0F0'
              }]}
              onPress={() => setDeleteMode(!deleteMode)}
            >
              <Text style={styles.deleteButtonText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {deleteMode && (
        <View style={[styles.deleteModeHeader, {
          backgroundColor: colors.isDarkMode ? 'rgba(239, 68, 68, 0.2)' : '#FFE6E6',
          borderBottomColor: colors.isDarkMode ? 'rgba(239, 68, 68, 0.4)' : '#FFB3B3'
        }]}>
          <Text style={[styles.deleteModeText, { color: colors.error }]}>Tap a friend to delete them</Text>
          <TouchableOpacity onPress={() => setDeleteMode(false)}>
            <Text style={[styles.cancelDeleteText, { color: colors.purple }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={getSortedFriends()}
        renderItem={renderFriend}
        keyExtractor={(item) => item.id}
        style={styles.friendsList}
        contentContainerStyle={styles.friendsListContent}
        showsVerticalScrollIndicator={false}
      />

      <View style={[styles.bottomNavigation, {
        backgroundColor: colors.cardBackground,
        borderTopColor: colors.border
      }]}>
        <TouchableOpacity style={styles.navButton} onPress={handleStats}>
          <Text style={[styles.navButtonText, { color: colors.purple }]}>📊 Stats</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton} onPress={handleAddMore}>
          <Text style={[styles.navButtonText, { color: colors.purple }]}>➕ Add More</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton} onPress={handleProfile}>
          <Text style={[styles.navButtonText, { color: colors.purple }]}>👤 Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
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
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
  },
  sortContainer: {
    alignItems: 'center',
  },
  sortLabel: {
    fontSize: 10,
    marginBottom: 4,
    fontWeight: '500',
  },
  sortButton: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  deleteContainer: {
    alignItems: 'center',
  },
  deleteLabel: {
    fontSize: 10,
    marginBottom: 4,
    fontWeight: '500',
  },
  deleteButton: {
    borderRadius: 8,
    padding: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 20,
  },
  deleteModeHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  deleteModeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  cancelDeleteText: {
    fontSize: 14,
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
  },
});