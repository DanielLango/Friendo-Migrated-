import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import FriendoLogo from './components/FriendoLogo';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <FriendoLogo />
        <Text style={styles.title}>Friendo App</Text>
        <Text style={styles.subtitle}>App is loading successfully!</Text>
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
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333333',
  },
  subtitle: {
    fontSize: 18,
    color: '#666666',
  },
});