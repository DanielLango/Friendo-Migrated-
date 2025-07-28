import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export interface NotificationData {
  friendId: string;
  friendName: string;
  daysSinceLastMeeting: number;
}

class NotificationService {
  private initialized = false;

  async initialize() {
    if (this.initialized) return;

    try {
      // Request permissions
      await this.requestPermissions();
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  }

  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
        return false;
      }

      // For Android, set up notification channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('friend-reminders', {
          name: 'Friend Reminders',
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  async scheduleNotification(
    friendId: string,
    friendName: string,
    delayInDays: number
  ): Promise<string | null> {
    try {
      await this.initialize();

      // Cancel any existing notification for this friend
      await this.cancelNotificationForFriend(friendId);

      const trigger = {
        seconds: delayInDays * 24 * 60 * 60, // Convert days to seconds
      };

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Time to reconnect! 👋',
          body: `It\'s been a while since you last met with ${friendName}. Why not reach out?`,
          data: {
            friendId,
            friendName,
            type: 'friend-reminder',
          },
        },
        trigger,
      });

      // Store the notification ID for this friend
      await AsyncStorage.setItem(`notification_${friendId}`, notificationId);

      console.log(`Scheduled notification for ${friendName} in ${delayInDays} days`);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  async cancelNotificationForFriend(friendId: string): Promise<void> {
    try {
      const notificationId = await AsyncStorage.getItem(`notification_${friendId}`);
      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        await AsyncStorage.removeItem(`notification_${friendId}`);
        console.log(`Cancelled notification for friend ${friendId}`);
      }
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  }

  async rescheduleNotificationAfterMeeting(
    friendId: string,
    friendName: string,
    notificationDays: number
  ): Promise<void> {
    try {
      // Cancel existing notification
      await this.cancelNotificationForFriend(friendId);
      
      // Schedule new notification based on the friend's settings
      await this.scheduleNotification(friendId, friendName, notificationDays);
    } catch (error) {
      console.error('Error rescheduling notification after meeting:', error);
    }
  }

  async getAllScheduledNotifications() {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      return notifications;
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  // Listen for notification responses (when user taps on notification)
  addNotificationResponseListener(callback: (response: Notifications.NotificationResponse) => void) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  // Listen for notifications received while app is in foreground
  addNotificationReceivedListener(callback: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(callback);
  }
}

export const notificationService = new NotificationService();