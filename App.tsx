import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BasicProvider } from '@basictech/expo';
import { schema } from './basic.config';
import ErrorBoundary from './components/ErrorBoundary';

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

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <BasicProvider project_id={schema.project_id} schema={schema}>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="Login">
              <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
              <Stack.Screen name="ReflectOnFriends" component={ReflectOnFriendsScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Sync" component={SyncScreen} options={{ headerShown: false }} />
              <Stack.Screen name="ContactSelect" component={ContactSelectScreen} options={{ headerShown: false }} />
              <Stack.Screen name="ManualAdd" component={ManualAddScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Main" component={MainScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Stats" component={StatsScreen} options={{ headerShown: false }} />
              <Stack.Screen name="MeetingCreate" component={MeetingCreateScreen} options={{ headerShown: false }} />
              <Stack.Screen name="AddFriends" component={AddFriendsScreen} options={{ headerShown: false }} />
            </Stack.Navigator>
          </NavigationContainer>
        </BasicProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
