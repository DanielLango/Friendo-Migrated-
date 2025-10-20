import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BasicProvider } from '@basictech/expo';
import { schema } from './basic.config';
<<<<<<< Updated upstream
import { LogBox } from 'react-native';

// Suppress specific warnings that are expected during development
LogBox.ignoreLogs([
  'Failed to refresh token',
  'Token refresh error',
  'Token refresh failed',
  'Error in fetchToken',
  'Token expired, attempting refresh',
  'failed_to_get_token',
]);

// Suppress console errors for known BasicTech token refresh issues
const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args.join(' ');
  if (
    message.includes('Token refresh failed') ||
    message.includes('failed_to_get_token') ||
    message.includes('Error in fetchToken') ||
    message.includes('InternalBytecode.js')
  ) {
    // Silently ignore these expected errors
    return;
  }
  originalConsoleError(...args);
};
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
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <BasicProvider project_id={schema.project_id} schema={schema}>
        <NavigationContainer>
          <Stack.Navigator 
<<<<<<< Updated upstream
            id={undefined}
=======
            id="RootStack"
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
          </Stack.Navigator>
        </NavigationContainer>
      </BasicProvider>
    </SafeAreaProvider>
  );
}
