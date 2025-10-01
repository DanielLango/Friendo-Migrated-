import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BasicProvider } from '@basictech/expo';
import { schema } from './basic.config';
import { Alert } from 'react-native';

// Import all screens
import LoginScreen from './screens/LoginScreen';
import ReflectOnFriendsScreen from './screens/ReflectOnFriendsScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import SyncScreen from './screens/SyncScreen';
import ContactSelectScreen from './screens/ContactSelectScreen';
import ManualAddScreen from './screens/ManualAddScreen';
import MainScreen from './screens/MainScreen';
import StatsScreen from './screens/StatsScreen';
import MeetingCreateScreen from './screens/MeetingCreateScreen';
import AddFriendsScreen from './screens/AddFriendsScreen';

// Define navigation types
export type RootStackParamList = {
  Login: undefined;
  ReflectOnFriends: undefined;
  Onboarding: undefined;
  Sync: undefined;
  ContactSelect: undefined;
  ManualAdd: undefined;
  Main: undefined;
  Stats: undefined;
  MeetingCreate: undefined;
  AddFriends: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error Boundary caught error:', error);
    console.error('Error Info:', errorInfo);
    
    // Check if it's a BasicTech authentication error
    if (error?.message?.includes('Failed to refresh token') ||
        error?.message?.includes('failed_to_get_token') ||
        error?.message?.includes('Bad Request')) {
      Alert.alert(
        'Authentication Error',
        'Your session has expired. Please restart the app and clear your authentication data using the troubleshooting option on the login screen.',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'App Error',
        'Something went wrong. Please restart the app or clear your authentication data if the problem persists.',
        [{ text: 'OK' }]
      );
    }
  }

  render() {
    if (this.state.hasError) {
      return null; // You could return a fallback UI here
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <BasicProvider 
          project_id={schema.project_id} 
          schema={schema}
        >
          <NavigationContainer>
            <Stack.Navigator 
              initialRouteName="Login"
              screenOptions={{
                headerShown: false,
                gestureEnabled: true,
              }}
            >
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="ReflectOnFriends" component={ReflectOnFriendsScreen} />
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
              <Stack.Screen name="Sync" component={SyncScreen} />
              <Stack.Screen name="ContactSelect" component={ContactSelectScreen} />
              <Stack.Screen name="ManualAdd" component={ManualAddScreen} />
              <Stack.Screen name="Main" component={MainScreen} />
              <Stack.Screen name="Stats" component={StatsScreen} />
              <Stack.Screen name="MeetingCreate" component={MeetingCreateScreen} />
              <Stack.Screen name="AddFriends" component={AddFriendsScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </BasicProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}