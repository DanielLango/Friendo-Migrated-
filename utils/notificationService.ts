import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure how notifications are handled when the app is in the foreground
// Only configure on mobile platforms
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export interface NotificationData {
  friendId: string;
  friendName: string;
  daysSinceLastMeeting: number;
}

class NotificationService {
  private initialized = false;

  async initialize() {
    if (this.initialized) return;

    // Skip initialization on web
    if (Platform.OS === 'web') {
      console.log('Notifications not supported on web platform');
      this.initialized = true;
      return;
    }

    try {
      // Request permissions
      await this.requestPermissions();
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  }

  async requestPermissions(): Promise<boolean> {
    // Skip on web
    if (Platform.OS === 'web') {
      console.log('Notification permissions not needed on web');
      return false;
    }

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
    // Skip on web
    if (Platform.OS === 'web') {
      console.log(`Would schedule notification for ${friendName} in ${delayInDays} days (web platform - notifications not supported)`);
      return null;
    }

    try {
      await this.initialize();

      // Cancel any existing notification for this friend
      await this.cancelNotificationForFriend(friendId);

      const trigger: Notifications.TimeIntervalTriggerInput = {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: delayInDays * 24 * 60 * 60, // Convert days to seconds
        repeats: false,
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
    // Skip on web
    if (Platform.OS === 'web') {
      console.log(`Would cancel notification for friend ${friendId} (web platform - notifications not supported)`);
      return;
    }

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
    // Skip on web
    if (Platform.OS === 'web') {
      console.log(`Would reschedule notification for ${friendName} (web platform - notifications not supported)`);
      return;
    }

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
    // Skip on web
    if (Platform.OS === 'web') {
      console.log('Cannot get scheduled notifications on web platform');
      return [];
    }

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
    // Skip on web
    if (Platform.OS === 'web') {
      console.log('Notification listeners not supported on web');
      return { remove: () => {} };
    }

    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  // Listen for notifications received while app is in foreground
  addNotificationReceivedListener(callback: (notification: Notifications.Notification) => void) {
    // Skip on web
    if (Platform.OS === 'web') {
      console.log('Notification listeners not supported on web');
      return { remove: () => {} };
    }

    return Notifications.addNotificationReceivedListener(callback);
  }
}

export const notificationService = new NotificationService();
