import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  console.log('App component rendering...');
  
  return (
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