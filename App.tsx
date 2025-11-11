import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initializeRevenueCat } from './utils/revenueCatConfig';
import { ThemeProvider } from './utils/themeContext';

// Import screens
import LoginScreen from './screens/LoginScreen';
import ReflectOnFriendsScreen from './screens/ReflectOnFriendsScreen';
import AddFriendsScreen from './screens/AddFriendsScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import SyncScreen from './screens/SyncScreen';
import ContactSelectScreen from './screens/ContactSelectScreen';
import ManualAddScreen from './screens/ManualAddScreen';
import MainScreen from './screens/MainScreen';
import StatsScreen from './screens/StatsScreen';
import MeetingCreateScreen from './screens/MeetingCreateScreen';
import ProfileScreen from './screens/ProfileScreen';
import BatchNotificationsScreen from './screens/BatchNotificationsScreen';
import AdminLoginScreen from './screens/AdminLoginScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import AdminAddVenueScreen from './screens/AdminAddVenueScreen';
import AdminEditVenueScreen from './screens/AdminEditVenueScreen';
import TermsOfServiceScreen from './screens/TermsOfServiceScreen';

export type RootStackParamList = {
  Login: undefined;
  ReflectOnFriends: undefined;
  AddFriends: undefined;
  Onboarding: undefined;
  Sync: undefined;
  ContactSelect: undefined;
  ManualAdd: undefined;
  Main: undefined;
  Stats: undefined;
  MeetingCreate: undefined;
  Profile: undefined;
  BatchNotifications: undefined;
  AdminLogin: undefined;
  AdminDashboard: undefined;
  AdminAddVenue: { onSuccess?: () => void };
  AdminEditVenue: { venue: any; onSuccess?: () => void };
  TermsOfService: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  console.log('App component rendering...');
  
  useEffect(() => {
    // Initialize RevenueCat when app starts
    initializeRevenueCat().catch(err => {
      console.log('RevenueCat initialization skipped:', err.message);
    });
  }, []);
  
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator 
            id={undefined}
            initialRouteName="Login"
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="ReflectOnFriends" component={ReflectOnFriendsScreen} />
            <Stack.Screen name="AddFriends" component={AddFriendsScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Sync" component={SyncScreen} />
            <Stack.Screen name="ContactSelect" component={ContactSelectScreen} />
            <Stack.Screen name="ManualAdd" component={ManualAddScreen} />
            <Stack.Screen name="Main" component={MainScreen} />
            <Stack.Screen name="Stats" component={StatsScreen} />
            <Stack.Screen name="MeetingCreate" component={MeetingCreateScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="BatchNotifications" component={BatchNotificationsScreen} />
            <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
            <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
            <Stack.Screen name="AdminAddVenue" component={AdminAddVenueScreen} />
            <Stack.Screen name="AdminEditVenue" component={AdminEditVenueScreen} />
            <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
