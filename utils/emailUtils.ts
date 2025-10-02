import { Alert, Linking } from 'react-native';

interface CalendarInviteParams {
  friendName: string;
  friendEmail: string;
  date: Date;
  city: string;
  notes: string;
  syncToGoogle?: boolean;
  syncToOutlook?: boolean;
  syncToApple?: boolean;
}

interface EmailInviteParams {
  friendName: string;
  friendEmail: string;
  date: Date;
  city: string;
  notes: string;
}

export const sendCalendarInvite = async (params: CalendarInviteParams) => {
  const { friendName, date, city, notes, syncToGoogle, syncToOutlook, syncToApple } = params;
  
  const startDate = date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const endDate = new Date(date.getTime() + 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  const title = encodeURIComponent(`Meeting with ${friendName}`);
  const details = encodeURIComponent(`Meeting with ${friendName} in ${city}. ${notes}`);
  const location = encodeURIComponent(city);

  try {
    if (syncToGoogle) {
      const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${details}&location=${location}`;
      await Linking.openURL(googleUrl);
    }

    if (syncToOutlook) {
      // Generate ICS file content
      const icsContent = generateICSContent({
        title: `Meeting with ${friendName}`,
        startDate: date,
        endDate: new Date(date.getTime() + 60 * 60 * 1000),
        location: city,
        description: `Meeting with ${friendName} in ${city}. ${notes}`,
      });
      
      // In a real app, you would save this as a file and allow download
      Alert.alert('ICS File', 'ICS file content generated. In a real app, this would be downloaded.');
    }

    if (syncToApple) {
      // For Apple Calendar, we would use the device's calendar API
      Alert.alert('Apple Calendar', 'Meeting would be added to device calendar.');
    }
  } catch (error) {
    console.error('Error opening calendar:', error);
    Alert.alert('Error', 'Failed to open calendar application.');
  }
};

export const sendEmailInvite = async (params: EmailInviteParams) => {
  const { friendName, friendEmail, date, city, notes } = params;
  
  const subject = encodeURIComponent(`Meeting Invitation - ${date.toLocaleDateString()}`);
  const body = encodeURIComponent(`Hi ${friendName},

I'd like to schedule a meeting with you!

Date: ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}
Location: ${city}

${notes ? `Additional details: ${notes}` : ''}

Looking forward to seeing you!

Best regards`);

  const mailtoUrl = `mailto:${friendEmail}?subject=${subject}&body=${body}`;
  
  try {
    const canOpen = await Linking.canOpenURL(mailtoUrl);
    if (canOpen) {
      await Linking.openURL(mailtoUrl);
    } else {
      Alert.alert('Email Error', 'No email app available to send the invitation.');
    }
  } catch (error) {
    console.error('Error opening email:', error);
    Alert.alert('Error', 'Failed to open email application.');
  }
};

const generateICSContent = (params: {
  title: string;
  startDate: Date;
  endDate: Date;
  location: string;
  description: string;
}) => {
  const { title, startDate, endDate, location, description } = params;
  
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Friendo//Meeting Scheduler//EN
BEGIN:VEVENT
UID:${Date.now()}@friendo.app
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${title}
DESCRIPTION:${description}
LOCATION:${location}
END:VEVENT
END:VCALENDAR`;
};