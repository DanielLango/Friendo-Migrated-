import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BasicProvider } from '@basictech/expo';
import { schema } from './basic.config';

<<<<<<< Updated upstream
import LoginScreen from './screens/LoginScreen';
import ReflectOnFriendsScreen from './screens/ReflectOnFriendsScreen';
=======
// Import screens
import LoginScreen from './screens/LoginScreen';
import ReflectOnFriendsScreen from './screens/ReflectOnFriendsScreen';
import AddFriendsScreen from './screens/AddFriendsScreen';
>>>>>>> Stashed changes
import OnboardingScreen from './screens/OnboardingScreen';
import SyncScreen from './screens/SyncScreen';
import ContactSelectScreen from './screens/ContactSelectScreen';
import ManualAddScreen from './screens/ManualAddScreen';
import MainScreen from './screens/MainScreen';
import StatsScreen from './screens/StatsScreen';
import MeetingCreateScreen from './screens/MeetingCreateScreen';
<<<<<<< Updated upstream
import AddFriendsScreen from './screens/AddFriendsScreen';
=======
>>>>>>> Stashed changes

export type RootStackParamList = {
  Login: undefined;
  ReflectOnFriends: undefined;
<<<<<<< Updated upstream
=======
  AddFriends: undefined;
>>>>>>> Stashed changes
  Onboarding: undefined;
  Sync: undefined;
  ContactSelect: undefined;
  ManualAdd: undefined;
  Main: undefined;
  Stats: undefined;
  MeetingCreate: undefined;
<<<<<<< Updated upstream
  AddFriends: undefined;
=======
>>>>>>> Stashed changes
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
<<<<<<< Updated upstream
    <BasicProvider project_id={schema.project_id} schema={schema}>
      <SafeAreaProvider>
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
      </SafeAreaProvider>
    </BasicProvider>
=======
    <SafeAreaProvider>
      <BasicProvider project_id={schema.project_id} schema={schema}>
        <NavigationContainer>
          <Stack.Navigator 
            id="RootStack"
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
>>>>>>> Stashed changes
  );
}
