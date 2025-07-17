import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ReflectOnFriendsScreen() {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [dontShowAgain, setDontShowAgain] = useState(false);
  
  const navigation = useNavigation();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleReady = async () => {
    if (dontShowAgain) {
      try {
        await AsyncStorage.setItem('skipReflectionScreen', 'true');
      } catch (error) {
        console.error('Error saving preference:', error);
      }
    }
    (navigation as any).navigate('AddFriends');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#3B0B63', '#5D1A94']}
        style={styles.gradient}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Title */}
            <Text style={styles.title}>Before we start…</Text>

            {/* Body Text */}
            <Text style={styles.bodyText}>
              We invite you to take a quiet moment to think about the friends you&apos;d like to stay connected with.
              {'\n\n'}
              It can help to pause and reflect on your favorite memories — who comes to mind right away?
              {'\n\n'}
              Maybe scroll through your photo albums or contacts, or open some of your favorite messaging apps.
              {'\n\n'}
              You might think of friends you often talk to on Instagram, WhatsApp, Snapchat, Facebook, or Messenger. Or perhaps your closest connections are on X, LinkedIn, TikTok, Signal, Telegram, Pinterest, or Viber.
              {'\n\n'}
              Whatever the case, take your time. Maybe even grab a pen and paper — and think it through.
            </Text>

            {/* Primary Button */}
            <TouchableOpacity 
              style={styles.readyButton}
              onPress={handleReady}
            >
              <Text style={styles.readyButtonText}>I&apos;m Ready</Text>
            </TouchableOpacity>

            {/* Subtext */}
            <Text style={styles.subtext}>
              You can always change your selection later.
            </Text>

            {/* Don't show again checkbox */}
            <TouchableOpacity 
              style={styles.checkboxContainer}
              onPress={() => setDontShowAgain(!dontShowAgain)}
            >
              <View style={[styles.checkbox, dontShowAgain && styles.checkboxChecked]}>
                {dontShowAgain && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Don&apos;t display this page to me anymore</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  bodyText: {
    color: '#D8B4FE',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  readyButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  readyButtonText: {
    color: '#5D1A94',
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtext: {
    color: '#C4B5FD',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    justifyContent: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#FFFFFF',
  },
  checkmark: {
    color: '#5D1A94',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    color: '#C4B5FD',
    fontSize: 14,
  },
});
