export interface Friend {
  id: string;
  name: string;
  email?: string;
  friendType: 'online' | 'local' | 'both';
  isOnline: boolean;
  isLocal: boolean;
  profilePicture?: string;
  city?: string;
  source: 'facebook' | 'instagram' | 'snapchat' | 'whatsapp' | 'linkedin' | 'telegram' | 'viber' | 'signal' | 'tiktok' | 'pinterest' | 'messenger' | 'apple' | 'google' | 'manual' | 'phone-contacts';
  notificationFrequency: 'days' | 'weekly' | 'monthly';
  notificationDays: number;
  createdAt: number;
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
