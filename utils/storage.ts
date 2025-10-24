import AsyncStorage from '@react-native-async-storage/async-storage';
import { Friend, Meeting } from '../types';

// Storage keys
const KEYS = {
  FRIENDS: '@friendo_friends',
  MEETINGS: '@friendo_meetings',
  USER: '@friendo_user',
  LOGGED_IN: '@friendo_logged_in',
};

// User operations
export const saveUser = async (email: string, password: string) => {
  try {
    await AsyncStorage.setItem(KEYS.USER, JSON.stringify({ email, password }));
    await AsyncStorage.setItem(KEYS.LOGGED_IN, 'true');
    return true;
  } catch (error) {
    console.error('Error saving user:', error);
    return false;
  }
};

export const getUser = async () => {
  try {
    const userData = await AsyncStorage.getItem(KEYS.USER);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

export const isLoggedIn = async () => {
  try {
    const loggedIn = await AsyncStorage.getItem(KEYS.LOGGED_IN);
    return loggedIn === 'true';
  } catch (error) {
    console.error('Error checking login status:', error);
    return false;
  }
};

export const logout = async () => {
  try {
    await AsyncStorage.removeItem(KEYS.LOGGED_IN);
    return true;
  } catch (error) {
    console.error('Error logging out:', error);
    return false;
  }
};

// Friend operations
export const saveFriends = async (friends: Friend[]) => {
  try {
    await AsyncStorage.setItem(KEYS.FRIENDS, JSON.stringify(friends));
    return true;
  } catch (error) {
    console.error('Error saving friends:', error);
    return false;
  }
};

export const getFriends = async (): Promise<Friend[]> => {
  try {
    const friendsData = await AsyncStorage.getItem(KEYS.FRIENDS);
    return friendsData ? JSON.parse(friendsData) : [];
  } catch (error) {
    console.error('Error getting friends:', error);
    return [];
  }
};

export const addFriend = async (friend: Omit<Friend, 'id' | 'createdAt'>) => {
  try {
    const friends = await getFriends();
    const newFriend: Friend = {
      ...friend,
      id: Date.now().toString(),
      createdAt: Date.now(),
    };
    friends.push(newFriend);
    await saveFriends(friends);
    return newFriend;
  } catch (error) {
    console.error('Error adding friend:', error);
    return null;
  }
};

export const deleteFriend = async (friendId: string) => {
  try {
    const friends = await getFriends();
    const updatedFriends = friends.filter(f => f.id !== friendId);
    await saveFriends(updatedFriends);
    return true;
  } catch (error) {
    console.error('Error deleting friend:', error);
    return false;
  }
};

// Meeting operations
export const saveMeetings = async (meetings: Meeting[]) => {
  try {
    await AsyncStorage.setItem(KEYS.MEETINGS, JSON.stringify(meetings));
    return true;
  } catch (error) {
    console.error('Error saving meetings:', error);
    return false;
  }
};

export const getMeetings = async (): Promise<Meeting[]> => {
  try {
    const meetingsData = await AsyncStorage.getItem(KEYS.MEETINGS);
    return meetingsData ? JSON.parse(meetingsData) : [];
  } catch (error) {
    console.error('Error getting meetings:', error);
    return [];
  }
};

export const addMeeting = async (meeting: Omit<Meeting, 'id'>) => {
  try {
    const meetings = await getMeetings();
    const newMeeting: Meeting = {
      ...meeting,
      id: Date.now().toString(),
    };
    meetings.push(newMeeting);
    await saveMeetings(meetings);
    return newMeeting;
  } catch (error) {
    console.error('Error adding meeting:', error);
    return null;
  }
};

export const deleteMeeting = async (meetingId: string) => {
  try {
    const meetings = await getMeetings();
    const updatedMeetings = meetings.filter(m => m.id !== meetingId);
    await saveMeetings(updatedMeetings);
    return true;
  } catch (error) {
    console.error('Error deleting meeting:', error);
    return false;
  }
};

export const deleteMeetingsByFriendId = async (friendId: string) => {
  try {
    const meetings = await getMeetings();
    const updatedMeetings = meetings.filter(m => m.friendId !== friendId);
    await saveMeetings(updatedMeetings);
    return true;
  } catch (error) {
    console.error('Error deleting meetings by friend:', error);
    return false;
  }
};