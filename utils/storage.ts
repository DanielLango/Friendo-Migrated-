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

    // Insert new friends
    const friendsWithUserId = friends.map(friend => ({
      ...friend,
      user_id: user.id,
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
      .order('createdAt', { ascending: true });

    if (error) throw error;
    return data || [];
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
      ...friend,
      user_id: user.id,
      createdAt: Date.now(),
    };

    const { data, error } = await supabase
      .from('friends')
      .insert([newFriend])
      .select()
      .single();

    if (error) throw error;
    return data;
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

    // Insert new meetings
    const meetingsWithUserId = meetings.map(meeting => ({
      ...meeting,
      user_id: user.id,
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
    return data || [];
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
      ...meeting,
      user_id: user.id,
    };

    const { data, error } = await supabase
      .from('meetings')
      .insert([newMeeting])
      .select()
      .single();

    if (error) throw error;
    return data;
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
      .eq('friendId', friendId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting meetings by friend:', error);
    return false;
  }
};
