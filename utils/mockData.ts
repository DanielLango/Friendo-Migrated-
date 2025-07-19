import { ContactSource, SyncedContact, ActivityType } from '../types';

export const contactSources: ContactSource[] = [
  { id: 'facebook', name: 'Facebook', icon: '📘', color: '#1877F2' },
  { id: 'instagram', name: 'Instagram', icon: '📷', color: '#E4405F' },
  { id: 'snapchat', name: 'Snapchat', icon: '👻', color: '#FFFC00' },
  { id: 'whatsapp', name: 'WhatsApp', icon: '💬', color: '#25D366' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: '#0077B5' },
  { id: 'telegram', name: 'Telegram', icon: '✈️', color: '#0088CC' },
  { id: 'viber', name: 'Viber', icon: '📞', color: '#665CAC' },
  { id: 'signal', name: 'Signal', icon: '🔒', color: '#3A76F0' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', color: '#000000' },
  { id: 'pinterest', name: 'Pinterest', icon: '📌', color: '#BD081C' },
  { id: 'messenger', name: 'Messenger', icon: '💬', color: '#006AFF' },
  { id: 'apple', name: 'Apple Contacts', icon: '📱', color: '#007AFF' },
  { id: 'google', name: 'Google Contacts', icon: '📧', color: '#4285F4' },
];

export const mockSyncedContacts: { [key: string]: SyncedContact[] } = {
  facebook: [
    { id: '1', name: 'John Doe', profilePicture: '👤', city: 'New York', source: 'facebook', selected: false },
    { id: '2', name: 'Jane Smith', profilePicture: '👤', city: 'Los Angeles', source: 'facebook', selected: false },
    { id: '3', name: 'Mike Johnson', profilePicture: '👤', city: 'Chicago', source: 'facebook', selected: false },
    { id: '4', name: 'Sarah Wilson', profilePicture: '👤', city: 'Miami', source: 'facebook', selected: false },
    { id: '5', name: 'David Brown', profilePicture: '👤', city: 'Seattle', source: 'facebook', selected: false },
  ],
  instagram: [
    { id: '6', name: 'Emma Davis', profilePicture: '👤', city: 'San Francisco', source: 'instagram', selected: false },
    { id: '7', name: 'Alex Miller', profilePicture: '👤', city: 'Austin', source: 'instagram', selected: false },
    { id: '8', name: 'Lisa Garcia', profilePicture: '👤', city: 'Denver', source: 'instagram', selected: false },
  ],
  whatsapp: [
    { id: '9', name: 'Tom Anderson', profilePicture: '👤', city: 'Boston', source: 'whatsapp', selected: false },
    { id: '10', name: 'Amy Taylor', profilePicture: '👤', city: 'Portland', source: 'whatsapp', selected: false },
  ],
};

export const activityTypes: ActivityType[] = [
  {
    id: 'coffee',
    name: 'Coffee',
    venues: [
      { id: '5', name: 'Blue Bottle Coffee', popularity: 15 },
      { id: '6', name: 'Stumptown Coffee', popularity: 12 },
      { id: '7', name: 'Intelligentsia', popularity: 10 },
    ]
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    venues: [
      { id: '1', name: 'Damindra', popularity: 10 },
      { id: '2', name: 'Noma', popularity: 10 },
      { id: '3', name: 'The French Laundry', popularity: 8 },
      { id: '4', name: 'Eleven Madison Park', popularity: 7 },
    ]
  },
  {
    id: 'lunch',
    name: 'Lunch',
    venues: [
      { id: '14', name: 'Local Bistro', popularity: 12 },
      { id: '15', name: 'Sandwich Shop', popularity: 15 },
      { id: '16', name: 'Healthy Bowl', popularity: 10 },
    ]
  },
  {
    id: 'dinner',
    name: 'Dinner',
    venues: [
      { id: '17', name: 'Fine Dining', popularity: 8 },
      { id: '18', name: 'Steakhouse', popularity: 10 },
      { id: '19', name: 'Italian Restaurant', popularity: 12 },
    ]
  },
  {
    id: 'breakfast',
    name: 'Breakfast',
    venues: [
      { id: '20', name: 'Morning Cafe', popularity: 14 },
      { id: '21', name: 'Pancake House', popularity: 16 },
      { id: '22', name: 'Bagel Shop', popularity: 12 },
    ]
  },
  {
    id: 'bar',
    name: 'Bar',
    venues: [
      { id: '8', name: 'Warpigs', popularity: 5 },
      { id: '9', name: 'The Dead Rabbit', popularity: 8 },
      { id: '10', name: 'Attaboy', popularity: 6 },
    ]
  },
  {
    id: 'drinks',
    name: 'Drinks',
    venues: [
      { id: '23', name: 'Cocktail Lounge', popularity: 9 },
      { id: '24', name: 'Wine Bar', popularity: 7 },
      { id: '25', name: 'Rooftop Bar', popularity: 11 },
    ]
  },
  {
    id: 'movie',
    name: 'Movie',
    venues: [
      { id: '11', name: 'AMC Theaters', popularity: 20 },
      { id: '12', name: 'Regal Cinemas', popularity: 18 },
      { id: '13', name: 'Alamo Drafthouse', popularity: 12 },
    ]
  },
  {
    id: 'walk',
    name: 'Walk',
    venues: [
      { id: '26', name: 'Central Park', popularity: 25 },
      { id: '27', name: 'Riverside Trail', popularity: 18 },
      { id: '28', name: 'Downtown Walk', popularity: 15 },
    ]
  },
  {
    id: 'sports',
    name: 'Sports',
    venues: [
      { id: '29', name: 'Local Gym', popularity: 20 },
      { id: '30', name: 'Tennis Court', popularity: 12 },
      { id: '31', name: 'Basketball Court', popularity: 15 },
    ]
  },
];
