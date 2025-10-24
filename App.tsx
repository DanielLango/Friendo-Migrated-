import React from 'react';
<<<<<<< Updated upstream
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🟢 App Loaded Successfully</Text>
        <Text style={styles.subtitle}>
          The bundler is working. The issue is with BasicProvider initialization.
        </Text>
        <Text style={styles.info}>
          Project ID: fe8af65a-bcdf-49c1-9e22-3624e0506558
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  info: {
    fontSize: 12,
    color: '#999999',
    fontFamily: 'monospace',
  },
});
=======
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BasicProvider } from '@basictech/expo';
import { schema } from './basic.config';

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
  );
}
>>>>>>> Stashed changes
