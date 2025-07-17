
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function FriendoLogo() {
  return (
    <View style={styles.container}>
      {/* Icon */}
      <View style={styles.iconContainer}>
        {/* Left Person */}
        <View style={styles.person}>
          <View style={styles.head} />
          <View style={styles.body} />
        </View>
        {/* Right Person */}
        <View style={styles.person}>
          <View style={styles.head} />
          <View style={styles.body} />
        </View>
      </View>

      {/* Wordmark */}
      <Text style={styles.wordmark}>Friendo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  person: {
    alignItems: 'center',
    marginHorizontal: 1,
  },
  head: {
    width: 10,
    height: 10,
    backgroundColor: '#000000',
    borderRadius: 5,
    marginBottom: 2,
  },
  body: {
    width: 12,
    height: 16,
    backgroundColor: '#000000',
    borderRadius: 2,
  },
  wordmark: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
});
