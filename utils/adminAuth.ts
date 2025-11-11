import AsyncStorage from '@react-native-async-storage/async-storage';

const ADMIN_PASSWORD = 'Fr!3nd0#Mgmt$2025@Pr0T3ct'; // Strong secure password
const ADMIN_SESSION_KEY = '@admin_session';
const SESSION_DURATION = 3600000; // 1 hour in milliseconds

export interface AdminSession {
  authenticated: boolean;
  timestamp: number;
}

// Check if admin password is correct
export const verifyAdminPassword = (password: string): boolean => {
  return password === ADMIN_PASSWORD;
};

// Create admin session
export const createAdminSession = async (): Promise<void> => {
  const session: AdminSession = {
    authenticated: true,
    timestamp: Date.now(),
  };
  await AsyncStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
};

// Check if admin session is valid
export const isAdminAuthenticated = async (): Promise<boolean> => {
  try {
    const sessionData = await AsyncStorage.getItem(ADMIN_SESSION_KEY);
    if (!sessionData) return false;

    const session: AdminSession = JSON.parse(sessionData);
    const now = Date.now();
    const sessionAge = now - session.timestamp;

    // Session expires after 1 hour
    if (sessionAge > SESSION_DURATION) {
      await clearAdminSession();
      return false;
    }

    return session.authenticated;
  } catch (error) {
    console.error('Error checking admin session:', error);
    return false;
  }
};

// Clear admin session
export const clearAdminSession = async (): Promise<void> => {
  await AsyncStorage.removeItem(ADMIN_SESSION_KEY);
};