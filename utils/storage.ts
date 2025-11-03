import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { supabase } from './supabase';
import { Friend, Meeting } from '../types';

// Storage keys for local fallback
const KEYS = {
  FRIENDS: '@friendo_friends',
  MEETINGS: '@friendo_meetings',
  USER: '@friendo_user',
  LOGGED_IN: '@friendo_logged_in',
  REMEMBER_ME: '@friendo_remember_me',
  FRIEND_CONSENT_ACCEPTED: '@friendo_friend_consent_accepted',
  PHOTO_CONSENT_ACCEPTED: '@friendo_photo_consent_accepted',
};

// Secure storage keys
const SECURE_KEYS = {
  EMAIL: 'friendo_secure_email',
  PASSWORD: 'friendo_secure_password',
};

// Remember Me operations
export const saveRememberMeCredentials = async (email: string, password: string) => {
  try {
    if (Platform.OS === 'web') {
      // Use AsyncStorage for web
      await AsyncStorage.setItem(SECURE_KEYS.EMAIL, email);
      await AsyncStorage.setItem(SECURE_KEYS.PASSWORD, password);
    } else {
      // Use SecureStore for native platforms
      await SecureStore.setItemAsync(SECURE_KEYS.EMAIL, email);
      await SecureStore.setItemAsync(SECURE_KEYS.PASSWORD, password);
    }
    await AsyncStorage.setItem(KEYS.REMEMBER_ME, 'true');
    return true;
  } catch (error) {
    console.error('Error saving remember me credentials:', error);
    return false;
  }
};

export const getRememberMeCredentials = async (): Promise<{ email: string; password: string } | null> => {
  try {
    const rememberMe = await AsyncStorage.getItem(KEYS.REMEMBER_ME);
    if (rememberMe !== 'true') return null;

    let email: string | null;
    let password: string | null;

    if (Platform.OS === 'web') {
      // Use AsyncStorage for web
      email = await AsyncStorage.getItem(SECURE_KEYS.EMAIL);
      password = await AsyncStorage.getItem(SECURE_KEYS.PASSWORD);
    } else {
      // Use SecureStore for native platforms
      email = await SecureStore.getItemAsync(SECURE_KEYS.EMAIL);
      password = await SecureStore.getItemAsync(SECURE_KEYS.PASSWORD);
    }

    if (email && password) {
      return { email, password };
    }
    return null;
  } catch (error) {
    console.error('Error getting remember me credentials:', error);
    return null;
  }
};

export const clearRememberMeCredentials = async () => {
  try {
    if (Platform.OS === 'web') {
      // Use AsyncStorage for web
      await AsyncStorage.removeItem(SECURE_KEYS.EMAIL);
      await AsyncStorage.removeItem(SECURE_KEYS.PASSWORD);
    } else {
      // Use SecureStore for native platforms
      await SecureStore.deleteItemAsync(SECURE_KEYS.EMAIL);
      await SecureStore.deleteItemAsync(SECURE_KEYS.PASSWORD);
    }
    await AsyncStorage.removeItem(KEYS.REMEMBER_ME);
    return true;
  } catch (error) {
    console.error('Error clearing remember me credentials:', error);
    return false;
  }
};

// Consent operations
export const getFriendConsentAccepted = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(KEYS.FRIEND_CONSENT_ACCEPTED);
    return value === 'true';
  } catch (error) {
    console.error('Error getting friend consent:', error);
    return false;
  }
};

export const setFriendConsentAccepted = async (accepted: boolean): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(KEYS.FRIEND_CONSENT_ACCEPTED, accepted ? 'true' : 'false');
    return true;
  } catch (error) {
    console.error('Error setting friend consent:', error);
    return false;
  }
};

export const getPhotoConsentAccepted = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(KEYS.PHOTO_CONSENT_ACCEPTED);
    return value === 'true';
  } catch (error) {
    console.error('Error getting photo consent:', error);
    return false;
  }
};

export const setPhotoConsentAccepted = async (accepted: boolean): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(KEYS.PHOTO_CONSENT_ACCEPTED, accepted ? 'true' : 'false');
    return true;
  } catch (error) {
    console.error('Error setting photo consent:', error);
    return false;
  }
};

// User operations
export const saveUser = async (email: string, password: string, rememberMe: boolean = false) => {
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
        
        // Save credentials if remember me is checked
        if (rememberMe) {
          await saveRememberMeCredentials(email, password);
        }
        
        return true;
      }
      
      // For other errors, log and return false
      console.error('Sign in error:', error.message);
      return false;
    }

    console.log('Sign in successful');
    await AsyncStorage.setItem(KEYS.LOGGED_IN, 'true');
    
    // Save credentials if remember me is checked
    if (rememberMe) {
      await saveRememberMeCredentials(email, password);
    } else {
      // Clear credentials if remember me is not checked
      await clearRememberMeCredentials();
    }
    
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

    // Insert new friends with correct snake_case column names matching database
    const friendsWithUserId = friends.map(friend => ({
      id: friend.id,
      user_id: user.id,
      name: friend.name,
      email: friend.email,
      friend_type: friend.friendType,
      is_online: friend.isOnline,
      is_local: friend.isLocal,
      profile_picture: friend.profilePicture,
      profile_picture_uri: friend.profilePictureUri,
      city: friend.city,
      source: friend.source,
      notification_frequency: friend.notificationFrequency,
      notification_days: friend.notificationDays,
      birthday: friend.birthday,
      birthday_notification_enabled: friend.birthdayNotificationEnabled,
      birthday_notification_time: friend.birthdayNotificationTime,
      is_favorite: friend.isFavorite,
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
      friendType: friend.friend_type,
      isOnline: friend.is_online ?? false,
      isLocal: friend.is_local ?? false,
      profilePicture: friend.profile_picture,
      profilePictureUri: friend.profile_picture_uri,
      city: friend.city,
      source: friend.source,
      notificationFrequency: friend.notification_frequency || 'monthly',
      notificationDays: friend.notification_days ?? 30,
      birthday: friend.birthday,
      birthdayNotificationEnabled: friend.birthday_notification_enabled,
      birthdayNotificationTime: friend.birthday_notification_time,
      isFavorite: friend.is_favorite ?? false,
      createdAt: friend.created_at,
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
    console.log('=== ADD FRIEND START ===');
    console.log('Friend data to add:', friend);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user logged in');
    
    console.log('User ID:', user.id);

    const newFriend = {
      user_id: user.id,
      name: friend.name,
      email: friend.email || '',
      friend_type: friend.friendType,
      is_online: friend.isOnline,
      is_local: friend.isLocal,
      profile_picture: friend.profilePicture || '👤',
      profile_picture_uri: friend.profilePictureUri || null,
      city: friend.city || '',
      source: friend.source,
      notification_frequency: friend.notificationFrequency,
      notification_days: friend.notificationDays,
      birthday: friend.birthday || null,
      birthday_notification_enabled: friend.birthdayNotificationEnabled || false,
      birthday_notification_time: friend.birthdayNotificationTime || null,
      is_favorite: friend.isFavorite || false,
      created_at: Date.now(),
    };
    
    console.log('Formatted friend for Supabase:', newFriend);

    const { data, error } = await supabase
      .from('friends')
      .insert([newFriend])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }
    
    console.log('Friend inserted successfully:', data);
    
    // Transform response back to camelCase
    const result = {
      id: data.id,
      name: data.name,
      email: data.email,
      friendType: data.friend_type,
      isOnline: data.is_online,
      isLocal: data.is_local,
      profilePicture: data.profile_picture,
      profilePictureUri: data.profile_picture_uri,
      city: data.city,
      source: data.source,
      notificationFrequency: data.notification_frequency,
      notificationDays: data.notification_days,
      birthday: data.birthday,
      birthdayNotificationEnabled: data.birthday_notification_enabled,
      birthdayNotificationTime: data.birthday_notification_time,
      isFavorite: data.is_favorite,
      createdAt: data.created_at,
    };
    
    console.log('Returning friend:', result);
    console.log('=== ADD FRIEND END ===');
    
    return result;
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

    // Insert new meetings with snake_case column names INCLUDING PREMIUM FIELDS
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
      cancelledby: meeting.cancelledBy, // Premium
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
    console.log('=== GET MEETINGS START ===');
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('No user logged in');
      return [];
    }
    
    console.log('Fetching meetings for user:', user.id);

    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) {
      console.error('Supabase fetch error:', error);
      throw error;
    }
    
    console.log('Raw data from Supabase:', data);
    
    // Transform snake_case to camelCase INCLUDING PREMIUM FIELDS
    const meetings = (data || []).map(meeting => ({
      id: meeting.id,
      friendId: meeting.friend_id,
      date: meeting.date,
      activity: meeting.activity,
      venue: meeting.venue,
      city: meeting.city,
      notes: meeting.notes,
      status: meeting.status,
      cancelledBy: meeting.cancelledby, // Premium
      createdAt: meeting.created_at,
    }));
    
    console.log(`Loaded ${meetings.length} meetings from Supabase`);
    console.log('Transformed meetings:', meetings);
    console.log('=== GET MEETINGS END ===');
    
    return meetings;
  } catch (error) {
    console.error('Error getting meetings:', error);
    return [];
  }
};

export const addMeeting = async (meeting: Omit<Meeting, 'id'>) => {
  try {
    console.log('=== ADD MEETING START ===');
    console.log('Meeting data to add:', meeting);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user logged in');
    
    console.log('User ID:', user.id);

    const newMeeting = {
      user_id: user.id,
      friend_id: meeting.friendId,
      date: meeting.date,
      activity: meeting.activity,
      venue: meeting.venue,
      city: meeting.city,
      notes: meeting.notes,
      status: meeting.status || 'scheduled',
      cancelledby: meeting.cancelledBy, // Premium
      created_at: typeof meeting.createdAt === 'number' ? meeting.createdAt : Date.now(),
    };
    
    console.log('Formatted meeting for Supabase:', newMeeting);

    const { data, error } = await supabase
      .from('meetings')
      .insert([newMeeting])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }
    
    console.log('Meeting inserted successfully:', data);
    
    // Transform response back to camelCase INCLUDING PREMIUM FIELDS
    const result = {
      id: data.id,
      friendId: data.friend_id,
      date: data.date,
      activity: data.activity,
      venue: data.venue,
      city: data.city,
      notes: data.notes,
      status: data.status,
      cancelledBy: data.cancelledby, // Premium
      createdAt: data.created_at,
    };
    
    console.log('Returning meeting:', result);
    console.log('=== ADD MEETING END ===');
    
    return result;
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

export const clearAllMeetings = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user logged in');

    const { error } = await supabase
      .from('meetings')
      .delete()
      .eq('user_id', user.id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error clearing all meetings:', error);
    return false;
  }
};
