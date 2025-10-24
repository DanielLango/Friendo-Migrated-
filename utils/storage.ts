import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { Friend, Meeting } from '../types';

// Storage keys for local fallback
const KEYS = {
  FRIENDS: '@friendo_friends',
  MEETINGS: '@friendo_meetings',
  USER: '@friendo_user',
  LOGGED_IN: '@friendo_logged_in',
};

// User operations
export const saveUser = async (email: string, password: string) => {
  try {
    console.log('Attempting to sign in with Supabase...');
    
    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Only attempt sign up if the error is about user not existing
      if (error.message.includes('Invalid login credentials') || error.message.includes('User not found')) {
        console.log('User not found, attempting sign up...');
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: undefined,
          }
        });

        if (signUpError) {
          console.error('Error signing up:', signUpError);
          return false;
        }

        console.log('Sign up successful');
        await AsyncStorage.setItem(KEYS.LOGGED_IN, 'true');
        return true;
      }
      
      // For other errors, log and return false
      console.error('Sign in error:', error.message);
      return false;
    }

    console.log('Sign in successful');
    await AsyncStorage.setItem(KEYS.LOGGED_IN, 'true');
    return true;
  } catch (error) {
    console.error('Error saving user:', error);
    return false;
  }
};

export const getUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error getting user:', error);
      return null;
    }
    return user;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

export const isLoggedIn = async () => {
  try {
    console.log('Checking login status...');
    
    // Add a timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 5000)
    );
    
    const sessionPromise = supabase.auth.getSession();

    const { data: { session }, error } = await Promise.race([
      sessionPromise,
      timeoutPromise
    ]) as any;

    if (error) {
      console.error('Error checking session:', error);
      return false;
    }
    console.log('Session check complete:', !!session);
    return !!session;
  } catch (error) {
    console.error('Error checking login status:', error);
    // If there's an error or timeout, just return false
    return false;
  }
};

export const logout = async () => {
  try {
    await supabase.auth.signOut();
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user logged in');

    // Delete existing friends for this user
    await supabase
      .from('friends')
      .delete()
      .eq('user_id', user.id);

    // Insert new friends with snake_case column names
    const friendsWithUserId = friends.map(friend => ({
      id: friend.id,
      user_id: user.id,
      name: friend.name,
      email: friend.email,
      friendtype: friend.friendType,
      isonline: friend.isOnline,
      islocal: friend.isLocal,
      profilepicture: friend.profilePicture,
      city: friend.city,
      source: friend.source,
      notificationfrequency: friend.notificationFrequency,
      notificationdays: friend.notificationDays,
      created_at: friend.createdAt || Date.now(),
    }));

    const { error } = await supabase
      .from('friends')
      .insert(friendsWithUserId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving friends:', error);
    return false;
  }
};

export const getFriends = async (): Promise<Friend[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('friends')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) throw error;
    
    // Transform snake_case to camelCase
    const friends = (data || []).map(friend => ({
      id: friend.id,
      name: friend.name,
      email: friend.email,
      friendType: friend.friendtype || friend.friendType,
      isOnline: friend.isonline ?? friend.isOnline ?? false,
      isLocal: friend.islocal ?? friend.isLocal ?? false,
      profilePicture: friend.profilepicture || friend.profilePicture,
      city: friend.city,
      source: friend.source,
      notificationFrequency: friend.notificationfrequency || friend.notificationFrequency || 'monthly',
      notificationDays: friend.notificationdays ?? friend.notificationDays ?? 30,
      createdAt: friend.created_at || friend.createdAt,
    }));
    
    console.log(`Loaded ${friends.length} friends from Supabase`);
    return friends;
  } catch (error) {
    console.error('Error getting friends:', error);
    return [];
  }
};

export const addFriend = async (friend: Omit<Friend, 'id' | 'createdAt'>) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user logged in');

    const newFriend = {
      user_id: user.id,
      name: friend.name,
      email: friend.email,
      friendtype: friend.friendType,
      isonline: friend.isOnline,
      islocal: friend.isLocal,
      profilepicture: friend.profilePicture,
      city: friend.city,
      source: friend.source,
      notificationfrequency: friend.notificationFrequency,
      notificationdays: friend.notificationDays,
      created_at: Date.now(),
    };

    const { data, error } = await supabase
      .from('friends')
      .insert([newFriend])
      .select()
      .single();

    if (error) throw error;
    
    // Transform response back to camelCase
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      friendType: data.friendtype,
      isOnline: data.isonline,
      isLocal: data.islocal,
      profilePicture: data.profilepicture,
      city: data.city,
      source: data.source,
      notificationFrequency: data.notificationfrequency,
      notificationDays: data.notificationdays,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error('Error adding friend:', error);
    return null;
  }
};

export const deleteFriend = async (friendId: string) => {
  try {
    const { error } = await supabase
      .from('friends')
      .delete()
      .eq('id', friendId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting friend:', error);
    return false;
  }
};

// Meeting operations
export const saveMeetings = async (meetings: Meeting[]) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user logged in');

    // Delete existing meetings for this user
    await supabase
      .from('meetings')
      .delete()
      .eq('user_id', user.id);

    // Insert new meetings with snake_case column names
    const meetingsWithUserId = meetings.map(meeting => ({
      id: meeting.id,
      user_id: user.id,
      friend_id: meeting.friendId,
      date: meeting.date,
      activity: meeting.activity,
      venue: meeting.venue,
      city: meeting.city,
      notes: meeting.notes,
      status: meeting.status || 'scheduled',
      created_at: typeof meeting.createdAt === 'number' ? meeting.createdAt : Date.now(),
    }));

    const { error } = await supabase
      .from('meetings')
      .insert(meetingsWithUserId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving meetings:', error);
    return false;
  }
};

export const getMeetings = async (): Promise<Meeting[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) throw error;
    
    // Transform snake_case to camelCase
    const meetings = (data || []).map(meeting => ({
      id: meeting.id,
      friendId: meeting.friend_id,
      date: meeting.date,
      activity: meeting.activity,
      venue: meeting.venue,
      city: meeting.city,
      notes: meeting.notes,
      status: meeting.status,
      createdAt: meeting.created_at,
    }));
    
    console.log(`Loaded ${meetings.length} meetings from Supabase`);
    return meetings;
  } catch (error) {
    console.error('Error getting meetings:', error);
    return [];
  }
};

export const addMeeting = async (meeting: Omit<Meeting, 'id'>) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user logged in');

    const newMeeting = {
      user_id: user.id,
      friend_id: meeting.friendId,
      date: meeting.date,
      activity: meeting.activity,
      venue: meeting.venue,
      city: meeting.city,
      notes: meeting.notes,
      status: meeting.status || 'scheduled',
      created_at: typeof meeting.createdAt === 'number' ? meeting.createdAt : Date.now(),
    };

    const { data, error } = await supabase
      .from('meetings')
      .insert([newMeeting])
      .select()
      .single();

    if (error) throw error;
    
    // Transform response back to camelCase
    return {
      id: data.id,
      friendId: data.friend_id,
      date: data.date,
      activity: data.activity,
      venue: data.venue,
      city: data.city,
      notes: data.notes,
      status: data.status,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error('Error adding meeting:', error);
    return null;
  }
};

export const deleteMeeting = async (meetingId: string) => {
  try {
    const { error } = await supabase
      .from('meetings')
      .delete()
      .eq('id', meetingId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting meeting:', error);
    return false;
  }
};

export const deleteMeetingsByFriendId = async (friendId: string) => {
  try {
    const { error } = await supabase
      .from('meetings')
      .delete()
      .eq('friend_id', friendId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting meetings by friend:', error);
    return false;
  }
};
