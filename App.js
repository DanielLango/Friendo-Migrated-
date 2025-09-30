import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  console.log('App component is rendering...');
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Friendo App is Loading!</Text>
      <Text style={styles.subtext}>Basic setup working</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtext: {
    fontSize: 16,
    color: '#666',
  },
});