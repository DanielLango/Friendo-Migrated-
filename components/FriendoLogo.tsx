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
          <View style={styles.bodyLeft} />
        </View>
        {/* Right Person */}
        <View style={styles.person}>
          <View style={styles.head} />
          <View style={styles.bodyRight} />
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
    marginHorizontal: 0.5,
  },
  head: {
    width: 10,
    height: 10,
    backgroundColor: '#000000',
    borderRadius: 5,
    marginBottom: 1,
  },
  bodyLeft: {
    width: 12,
    height: 16,
    backgroundColor: '#000000',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  bodyRight: {
    width: 12,
    height: 16,
    backgroundColor: '#000000',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 2,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  wordmark: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
});
