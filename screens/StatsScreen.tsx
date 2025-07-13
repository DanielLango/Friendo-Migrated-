import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useBasic } from '@basictech/expo';
import { Friend, Meeting, FriendshipMemo } from '../types';

interface FriendStats {
  friend: Friend;
  meetingCount: number;
}

export default function StatsScreen() {
  const [friendStats, setFriendStats] = useState<FriendStats[]>([]);
  const [showMemoModal, setShowMemoModal] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [memoText, setMemoText] = useState('');
  const navigation = useNavigation();
  const { db } = useBasic();

  useEffect(() => {
    loadStats();
  }, [db]);

  const loadStats = async () => {
    if (db) {
      try {
        const friends = await db.from('friends').getAll();
        const meetings = await db.from('meetings').getAll();
        
        const currentYear = new Date().getFullYear();
        const yearMeetings = meetings?.filter(meeting => 
          new Date(meeting.date).getFullYear() === currentYear
        ) || [];

        const stats = friends?.map(friend => {
          const friendMeetings = yearMeetings.filter(meeting => meeting.friendId === friend.id);
          return {
            friend,
            meetingCount: friendMeetings.length,
          };
        }) || [];

        // Sort by meeting count (descending)
        stats.sort((a, b) => b.meetingCount - a.meetingCount);
        setFriendStats(stats);
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    }
  };

  const handleFriendshipMemo = (friend: Friend) => {
    setSelectedFriend(friend);
    setMemoText('');
    setShowMemoModal(true);
  };

  const saveMemo = async () => {
    if (!selectedFriend || !memoText.trim() || !db) return;

    try {
      await db.from('friendshipMemos').add({
        friendId: selectedFriend.id,
        year: new Date().getFullYear(),
        memo: memoText.trim(),
        createdAt: Date.now(),
      });

      Alert.alert('Success', 'Friendship memo saved!');
      setShowMemoModal(false);
      setSelectedFriend(null);
      setMemoText('');
    } catch (error) {
      console.error('Error saving memo:', error);
      Alert.alert('Error', 'Failed to save memo. Please try again.');
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Stats</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>
          Top list of most frequently met friends in {currentYear}:
        </Text>

        {friendStats.map((stat, index) => (
          <View key={stat.friend.id} style={styles.statRow}>
            <Text style={styles.statRank}>{index + 1}.</Text>
            <Text style={styles.statName}>{stat.friend.name}</Text>
            <Text style={styles.statCount}>— {stat.meetingCount} times</Text>
            <TouchableOpacity
              style={styles.memoButton}
              onPress={() => handleFriendshipMemo(stat.friend)}
            >
              <Text style={styles.memoButtonText}>📝</Text>
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.wrappedSection}>
          <Text style={styles.wrappedText}>See your Wrapped 🎁</Text>
          <TouchableOpacity style={styles.wrappedButton}>
            <Text style={styles.wrappedButtonText}>Coming Soon!</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {showMemoModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              Friendship Memo for {selectedFriend?.name}
            </Text>
            <TextInput
              style={styles.memoInput}
              value={memoText}
              onChangeText={setMemoText}
              placeholder="Write your annual note, quote, or shared memory..."
              multiline
              numberOfLines={4}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowMemoModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={saveMemo}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    fontSize: 16,
    color: '#8000FF',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  placeholder: {
    width: 50,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  statRank: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8000FF',
    width: 30,
  },
  statName: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
  },
  statCount: {
    fontSize: 16,
    color: '#666666',
    marginRight: 10,
  },
  memoButton: {
    padding: 5,
  },
  memoButtonText: {
    fontSize: 18,
  },
  wrappedSection: {
    marginTop: 40,
    alignItems: 'center',
  },
  wrappedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8000FF',
    marginBottom: 15,
  },
  wrappedButton: {
    backgroundColor: '#FFD700',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  wrappedButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
    textAlign: 'center',
  },
  memoInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    height: 120,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666666',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#8000FF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 10,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});