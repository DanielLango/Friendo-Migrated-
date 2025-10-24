import React from 'react';
<<<<<<< Updated upstream
<<<<<<< Updated upstream
import { View, Text, StyleSheet } from 'react-native';
=======
=======
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes

export default function App() {
  console.log('App component rendering...');
  
  return (
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    <View style={styles.container}>
      <Text style={styles.title}>Hello Friendo!</Text>
      <Text style={styles.subtitle}>App is loading successfully</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333333',
  },
  subtitle: {
    fontSize: 18,
    color: '#666666',
    marginTop: 10,
  },
});
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
  );
}
>>>>>>> Stashed changes
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
  );
}
>>>>>>> Stashed changes
