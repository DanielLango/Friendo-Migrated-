import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BasicProvider } from '@basictech/expo';
import { schema } from './basic.config';
import { notificationService } from './utils/notificationService';
import * as Notifications from 'expo-notifications';

// Screens
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

export type RootStackParamList = {
  Login: undefined;
  ReflectOnFriends: undefined;
  AddFriends: undefined;
  Onboarding: undefined;
  Sync: undefined;
  ContactSelect: { source: string };
  ManualAdd: undefined;
  Main: undefined;
  Stats: undefined;
  MeetingCreate: { friend: any };
};

const Stack = createStackNavigator();

function AppContent() {
  useEffect(() => {
    // Initialize notification service
    notificationService.initialize();

    // Handle notification responses (when user taps on notification)
    const responseSubscription = notificationService.addNotificationResponseListener(
      (response) => {
        const data = response.notification.request.content.data;
        if (data?.type === 'friend-reminder') {
          console.log(`User tapped notification for friend: ${data.friendName}`);
          // You could navigate to the friend's profile or main screen here
        }
      }
    );

    // Handle notifications received while app is in foreground
    const receivedSubscription = notificationService.addNotificationReceivedListener(
      (notification) => {
        const data = notification.request.content.data;
        if (data?.type === 'friend-reminder') {
          console.log(`Received notification for friend: ${data.friendName}`);
        }
      }
    );

    return () => {
      responseSubscription.remove();
      receivedSubscription.remove();
    };
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
        }}
        {...({} as any)}
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <BasicProvider project_id={schema.project_id} schema={schema as any}>
        <AppContent />
      </BasicProvider>
    </SafeAreaProvider>
  );
}
