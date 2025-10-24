import React from 'react';
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