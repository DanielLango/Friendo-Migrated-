import * as Calendar from 'expo-calendar';
import { Paths, File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';
import { Friend } from '../types';

export interface CalendarEvent {
  title: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  notes?: string;
  allDay?: boolean;
}

export const requestCalendarPermissions = async (): Promise<boolean> => {
  try {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Calendar Permission Required',
        'Please grant calendar permissions to add events to your calendar.'
      );
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error requesting calendar permissions:', error);
    return false;
  }
};

export const addEventToCalendar = async (event: CalendarEvent): Promise<boolean> => {
  try {
    const hasPermission = await requestCalendarPermissions();
    if (!hasPermission) return false;

    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const defaultCalendar = calendars.find(cal => cal.source.name === 'Default') || calendars[0];

    if (!defaultCalendar) {
      Alert.alert('Error', 'No calendar found on this device.');
      return false;
    }

    await Calendar.createEventAsync(defaultCalendar.id, {
      title: event.title,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location,
      notes: event.notes,
      allDay: event.allDay || false,
    });

    Alert.alert('Success', 'Event added to your calendar!');
    return true;
  } catch (error) {
    console.error('Error adding event to calendar:', error);
    Alert.alert('Error', 'Failed to add event to calendar.');
    return false;
  }
};

export const createMeetingEvent = async (
  friend: Friend, 
  meetingDate: Date, 
  notes?: string, 
  venue?: string,
  duration: number = 60
): Promise<boolean> => {
  const startDate = meetingDate;
  const endDate = new Date(meetingDate.getTime() + duration * 60 * 1000); // Add duration in minutes

  const event: CalendarEvent = {
    title: `Meeting with ${friend.name}`,
    startDate,
    endDate,
    location: venue || friend.city || '',
    notes: notes ? `${notes}\n\nFriendo meeting with ${friend.name} (${friend.friendType} friend)` : `Friendo meeting with ${friend.name} (${friend.friendType} friend)`,
    allDay: false,
  };

  return await addEventToCalendar(event);
};

export const generateICSFile = (event: CalendarEvent): string => {
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Friendo//Friendo App//EN',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@friendo.app`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(event.startDate)}`,
    `DTEND:${formatDate(event.endDate)}`,
    `SUMMARY:${event.title}`,
    event.location ? `LOCATION:${event.location}` : '',
    event.notes ? `DESCRIPTION:${event.notes}` : '',
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(line => line !== '').join('\r\n');

  return icsContent;
};

export const downloadICSFile = async (event: CalendarEvent, filename: string = 'meeting.ics'): Promise<boolean> => {
  try {
    const icsContent = generateICSFile(event);
    
    if (Platform.OS === 'web') {
      // For web, create a download link
      const blob = new Blob([icsContent], { type: 'text/calendar' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      Alert.alert('Success', 'Calendar file downloaded! Check your downloads folder.');
      return true;
    } else {
      // For mobile, save to file system and share
      const file = new File(Paths.cache, filename);
      
      await file.write(icsContent);
      
      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (isAvailable) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'text/calendar',
          dialogTitle: 'Save Calendar Event',
          UTI: 'public.calendar-event',
        });
        
        return true;
      } else {
        Alert.alert(
          'File Created',
          `Calendar file created. Please use a file manager to open this .ics file with your calendar app.`
        );
        return true;
      }
    }
  } catch (error) {
    console.error('Error creating ICS file:', error);
    Alert.alert('Error', 'Failed to create calendar file. Please try again.');
    return false;
  }
};

export const createAndDownloadMeetingICS = async (
  friend: Friend, 
  meetingDate: Date, 
  notes?: string,
  venue?: string
): Promise<boolean> => {
  const event: CalendarEvent = {
    title: `Meeting with ${friend.name}`,
    startDate: meetingDate,
    endDate: new Date(meetingDate.getTime() + 60 * 60 * 1000), // 1 hour duration
    location: venue || friend.city || '',
    notes: notes ? `${notes}\n\nFriendo meeting with ${friend.name} (${friend.friendType} friend)` : `Friendo meeting with ${friend.name} (${friend.friendType} friend)`,
  };

  const filename = `meeting-${friend.name.replace(/\s+/g, '-').toLowerCase()}-${meetingDate.toISOString().split('T')[0]}.ics`;
  return await downloadICSFile(event, filename);
};
