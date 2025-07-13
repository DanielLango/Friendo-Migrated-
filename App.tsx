import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BasicProvider } from '@basictech/expo';
import { schema } from './basic.config';

// Screens
import LoginScreen from './screens/LoginScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import SyncScreen from './screens/SyncScreen';
import ContactSelectScreen from './screens/ContactSelectScreen';
import ManualAddScreen from './screens/ManualAddScreen';
import MainScreen from './screens/MainScreen';
import StatsScreen from './screens/StatsScreen';
import MeetingCreateScreen from './screens/MeetingCreateScreen';

const Stack = createStackNavigator();

function AppContent() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
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
      <BasicProvider project_id={schema.project_id} schema={schema}>
        <AppContent />
      </BasicProvider>
    </SafeAreaProvider>
  );
}