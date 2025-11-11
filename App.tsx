<<<<<<< Updated upstream
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initializeRevenueCat } from './utils/revenueCatConfig';
import { ThemeProvider } from './utils/themeContext';
=======
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BasicProvider } from '@basictech/expo';
import { schema } from './basic.config';
<<<<<<< Updated upstream
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
import ProfileScreen from './screens/ProfileScreen';
import BatchNotificationsScreen from './screens/BatchNotificationsScreen';
import AdminLoginScreen from './screens/AdminLoginScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import AdminAddVenueScreen from './screens/AdminAddVenueScreen';
import AdminEditVenueScreen from './screens/AdminEditVenueScreen';
import TermsOfServiceScreen from './screens/TermsOfServiceScreen';
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
  Profile: undefined;
  BatchNotifications: undefined;
  AdminLogin: undefined;
  AdminDashboard: undefined;
  AdminAddVenue: { onSuccess?: () => void };
  AdminEditVenue: { venue: any; onSuccess?: () => void };
  TermsOfService: undefined;
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    <ThemeProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator 
            id={undefined}
=======
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    <SafeAreaProvider>
      <BasicProvider project_id={schema.project_id} schema={schema}>
        <NavigationContainer>
          <Stack.Navigator 
            id="RootStack"
<<<<<<< Updated upstream
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
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
=======
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
          </Stack.Navigator>
        </NavigationContainer>
      </BasicProvider>
    </SafeAreaProvider>
<<<<<<< Updated upstream
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
  );
}
