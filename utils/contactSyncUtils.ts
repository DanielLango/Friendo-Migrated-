import { Alert } from 'react-native';
import * as Contacts from 'expo-contacts';
import { Friend } from '../types';

export interface ContactSyncResult {
  success: boolean;
  contacts: Friend[];
  error?: string;
}

export const requestContactsPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Contacts.requestPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Contacts Permission Required',
        'Please grant contacts permission to sync your friends from your phone.'
      );
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error requesting contacts permission:', error);
    return false;
  }
};

export const syncPhoneContacts = async (): Promise<ContactSyncResult> => {
  try {
    const hasPermission = await requestContactsPermission();
    if (!hasPermission) {
      return { success: false, contacts: [], error: 'Permission denied' };
    }

    const { data } = await Contacts.getContactsAsync({
      fields: [
        Contacts.Fields.Name,
        Contacts.Fields.PhoneNumbers,
        Contacts.Fields.Emails,
        Contacts.Fields.Image,
      ],
    });

    const friends: Friend[] = data
      .filter(contact => contact.name && (contact.phoneNumbers?.length || contact.emails?.length))
      .map(contact => ({
        id: contact.id || `contact-${Date.now()}-${Math.random()}`,
        name: contact.name || 'Unknown',
        email: contact.emails?.[0]?.email || '',
        friendType: 'local' as const,
        isOnline: false,
        isLocal: true,
        profilePicture: contact.imageAvailable ? '📱' : '👤',
        city: '',
        source: 'phone-contacts',
        notificationFrequency: 'weekly' as const,
        notificationDays: 7,
        createdAt: Date.now(),
      }));

    return { success: true, contacts: friends };
  } catch (error) {
    console.error('Error syncing phone contacts:', error);
    return { 
      success: false, 
      contacts: [], 
      error: 'Failed to sync phone contacts' 
    };
  }
};

// Mock implementations for social media platforms
// In a real app, these would integrate with actual APIs

export const syncFacebookContacts = async (): Promise<ContactSyncResult> => {
  // This would require Facebook SDK integration
  Alert.alert(
    'Facebook Sync',
    'Facebook contact sync requires additional setup with Facebook SDK. This is a demo implementation.'
  );
  
  // Mock data for demonstration
  const mockFacebookFriends: Friend[] = [
    {
      id: 'fb-1',
      name: 'John Facebook',
      email: 'john@facebook.com',
      friendType: 'online',
      isOnline: true,
      isLocal: false,
      profilePicture: '📘',
      city: 'San Francisco',
      source: 'facebook',
      notificationFrequency: 'weekly',
      notificationDays: 7,
      createdAt: Date.now(),
    },
    {
      id: 'fb-2',
      name: 'Sarah Facebook',
      email: 'sarah@facebook.com',
      friendType: 'online',
      isOnline: true,
      isLocal: false,
      profilePicture: '📘',
      city: 'New York',
      source: 'facebook',
      notificationFrequency: 'monthly',
      notificationDays: 30,
      createdAt: Date.now(),
    },
  ];

  return { success: true, contacts: mockFacebookFriends };
};

export const syncInstagramContacts = async (): Promise<ContactSyncResult> => {
  Alert.alert(
    'Instagram Sync',
    'Instagram contact sync requires Instagram Basic Display API integration. This is a demo implementation.'
  );
  
  const mockInstagramFriends: Friend[] = [
    {
      id: 'ig-1',
      name: 'Mike Instagram',
      email: 'mike@instagram.com',
      friendType: 'online',
      isOnline: true,
      isLocal: false,
      profilePicture: '📷',
      city: 'Los Angeles',
      source: 'instagram',
      notificationFrequency: 'weekly',
      notificationDays: 7,
      createdAt: Date.now(),
    },
  ];

  return { success: true, contacts: mockInstagramFriends };
};

export const syncWhatsAppContacts = async (): Promise<ContactSyncResult> => {
  Alert.alert(
    'WhatsApp Sync',
    'WhatsApp contact sync would use your phone contacts to identify WhatsApp users. This is a demo implementation.'
  );
  
  const mockWhatsAppFriends: Friend[] = [
    {
      id: 'wa-1',
      name: 'Anna WhatsApp',
      email: 'anna@whatsapp.com',
      friendType: 'both',
      isOnline: true,
      isLocal: true,
      profilePicture: '💬',
      city: 'Chicago',
      source: 'whatsapp',
      notificationFrequency: 'weekly',
      notificationDays: 7,
      createdAt: Date.now(),
    },
  ];

  return { success: true, contacts: mockWhatsAppFriends };
};

export const syncLinkedInContacts = async (): Promise<ContactSyncResult> => {
  Alert.alert(
    'LinkedIn Sync',
    'LinkedIn contact sync requires LinkedIn API integration. This is a demo implementation.'
  );
  
  const mockLinkedInFriends: Friend[] = [
    {
      id: 'li-1',
      name: 'David LinkedIn',
      email: 'david@linkedin.com',
      friendType: 'online',
      isOnline: true,
      isLocal: false,
      profilePicture: '💼',
      city: 'Seattle',
      source: 'linkedin',
      notificationFrequency: 'monthly',
      notificationDays: 30,
      createdAt: Date.now(),
    },
  ];

  return { success: true, contacts: mockLinkedInFriends };
};