import * as MailComposer from 'expo-mail-composer';
import { Alert } from 'react-native';
import { Friend } from '../types';

export interface EmailOptions {
  to: string[];
  subject: string;
  body: string;
  isHtml?: boolean;
  attachments?: string[];
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    const isAvailable = await MailComposer.isAvailableAsync();
    
    if (!isAvailable) {
      Alert.alert(
        'Email Not Available',
        'Email is not available on this device. Please set up an email account in your device settings.'
      );
      return false;
    }

    const result = await MailComposer.composeAsync({
      recipients: options.to,
      subject: options.subject,
      body: options.body,
      isHtml: options.isHtml || false,
      attachments: options.attachments || [],
    });

    return result.status === MailComposer.MailComposerStatus.SENT;
  } catch (error) {
    console.error('Error sending email:', error);
    Alert.alert('Email Error', 'Failed to send email. Please try again.');
    return false;
  }
};

export const sendFriendInvitation = async (friend: Friend, userEmail: string): Promise<boolean> => {
  const subject = `You're invited to connect on Friendo!`;
  const body = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #8000FF;">You're invited to Friendo! 🎉</h2>
          
          <p>Hi ${friend.name}!</p>
          
          <p>Your friend <strong>${userEmail}</strong> has invited you to join Friendo - the app that helps friends stay connected and meet up regularly.</p>
          
          <div style="background-color: #f8f4ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #8000FF; margin-top: 0;">What is Friendo?</h3>
            <ul>
              <li>📅 Schedule regular meetups with friends</li>
              <li>🔔 Get reminders to stay in touch</li>
              <li>📊 Track your friendship connections</li>
              <li>💜 Build stronger relationships</li>
            </ul>
          </div>
          
          <p>Download Friendo today and start building stronger friendships!</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="background-color: #8000FF; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">Download Friendo</a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            This invitation was sent by ${userEmail}. If you don't want to receive these invitations, please contact them directly.
          </p>
        </div>
      </body>
    </html>
  `;

  return await sendEmail({
    to: [friend.email || ''],
    subject,
    body,
    isHtml: true,
  });
};

export const sendMeetingReminder = async (friend: Friend, meetingDate: Date, userEmail: string): Promise<boolean> => {
  const subject = `Reminder: Meeting with ${friend.name} tomorrow!`;
  const body = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #8000FF;">Meeting Reminder 📅</h2>
          
          <p>Hi there!</p>
          
          <p>This is a friendly reminder that you have a meeting scheduled with <strong>${friend.name}</strong> tomorrow!</p>
          
          <div style="background-color: #f8f4ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #8000FF; margin-top: 0;">Meeting Details</h3>
            <p><strong>Friend:</strong> ${friend.name}</p>
            <p><strong>Date:</strong> ${meetingDate.toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${meetingDate.toLocaleTimeString()}</p>
            <p><strong>Type:</strong> ${friend.friendType}</p>
          </div>
          
          <p>Don't forget to:</p>
          <ul>
            <li>Confirm the meeting time</li>
            <li>Choose a location if needed</li>
            <li>Log the meeting in Friendo after you meet</li>
          </ul>
          
          <p>Have a great time catching up! 😊</p>
          
          <p style="color: #666; font-size: 14px;">
            This reminder was sent by Friendo. You can adjust your notification settings in the app.
          </p>
        </div>
      </body>
    </html>
  `;

  return await sendEmail({
    to: [userEmail],
    subject,
    body,
    isHtml: true,
  });
};