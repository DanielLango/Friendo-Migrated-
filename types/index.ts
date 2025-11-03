export interface Friend {
  id: string;
  name: string;
  email?: string;
  friendType: 'online' | 'local' | 'both';
  isOnline: boolean;
  isLocal: boolean;
  profilePicture?: string;
  profilePictureUri?: string; // Premium: Custom uploaded photo
  city?: string;
  source: 'facebook' | 'instagram' | 'snapchat' | 'whatsapp' | 'linkedin' | 'telegram' | 'viber' | 'signal' | 'tiktok' | 'pinterest' | 'messenger' | 'apple' | 'google' | 'manual' | 'phone-contacts';
  notificationFrequency: 'days' | 'weekly' | 'monthly';
  notificationDays: number;
  createdAt: number;
  birthday?: string; // Premium: Format MM/DD
  birthdayNotificationEnabled?: boolean; // Premium: Birthday notification toggle
  birthdayNotificationTime?: string; // Premium: Time for birthday notification
  isFavorite?: boolean; // Premium: Mark as favorite
}

export interface Meeting {
  id: string;
  friendId: string;
  date: string;
  activity: string;
  venue: string;
  city?: string;
  notes: string;
  createdAt: number;
  status?: 'scheduled' | 'met' | 'cancelled'; // Meeting status
  cancelledBy?: 'user' | 'friend'; // Premium: Who cancelled the meeting
}

export interface FriendshipMemo {
  id: string;
  friendId: string;
  year: number;
  memo: string;
  createdAt: number;
}

export interface ContactSource {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface SyncedContact {
  id: string;
  name: string;
  profilePicture?: string;
  city?: string;
  source: string;
  selected: boolean;
}

export interface ActivityType {
  id: string;
  name: string;
  venues: Venue[];
}

export interface Venue {
  id: string;
  name: string;
  popularity: number;
}

export interface BatchNotificationSettings {
  friendIds: string[];
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string; // HH:MM format
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
}
