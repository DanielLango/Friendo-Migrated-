import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ReflectOnFriendsScreen() {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [waveAnim1] = useState(new Animated.Value(0));
  const [waveAnim2] = useState(new Animated.Value(0));
  const [waveAnim3] = useState(new Animated.Value(0));
  const [dontShowAgain, setDontShowAgain] = useState(false);
  
  const navigation = useNavigation();

  useEffect(() => {
    // Start content animation
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

    // Create continuous wave animations with different speeds and delays
    const createWaveAnimation = (animValue: Animated.Value, delay: number, duration: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: duration,
            useNativeDriver: true,
          }),
        ]),
        { iterations: -1 }
      );
    };

    // Start multiple wave animations with different timings
    setTimeout(() => createWaveAnimation(waveAnim1, 0, 3000).start(), 0);
    setTimeout(() => createWaveAnimation(waveAnim2, 1000, 4000).start(), 1000);
    setTimeout(() => createWaveAnimation(waveAnim3, 2000, 5000).start(), 2000);
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
    <View style={styles.container}>
      {/* Animated wave background layers */}
      <Animated.View style={[
        styles.waveLayer,
        {
          opacity: waveAnim1.interpolate({
            inputRange: [0, 1],
            outputRange: [0.2, 0.4],
          }),
          transform: [{
            translateY: waveAnim1.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -20],
            }),
          }],
        },
      ]}>
        <LinearGradient
          colors={['#4A0E4E', '#2D0A4E', '#1A0A2E']}
          style={styles.gradientWave}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      <Animated.View style={[
        styles.waveLayer,
        {
          opacity: waveAnim2.interpolate({
            inputRange: [0, 1],
            outputRange: [0.1, 0.3],
          }),
          transform: [{
            translateY: waveAnim2.interpolate({
              inputRange: [0, 1],
              outputRange: [10, -10],
            }),
          }, {
            translateX: waveAnim2.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 15],
            }),
          }],
        },
      ]}>
        <LinearGradient
          colors={['#6A1B9A', '#4A0E4E', '#2D0A4E']}
          style={styles.gradientWave}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </Animated.View>

      <Animated.View style={[
        styles.waveLayer,
        {
          opacity: waveAnim3.interpolate({
            inputRange: [0, 1],
            outputRange: [0.15, 0.35],
          }),
          transform: [{
            translateY: waveAnim3.interpolate({
              inputRange: [0, 1],
              outputRange: [-5, 15],
            }),
          }, {
            translateX: waveAnim3.interpolate({
              inputRange: [0, 1],
              outputRange: [-10, 5],
            }),
          }],
        },
      ]}>
        <LinearGradient
          colors={['#8E24AA', '#6A1B9A', '#4A0E4E']}
          style={styles.gradientWave}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>
      
      {/* Content overlay */}
      <View style={styles.overlay} />
      
      {/* Content */}
      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}>
          {/* Title */}
          <Text style={styles.title}>Before we start…</Text>

          {/* Body Text with better readability */}
          <View style={styles.textContainer}>
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
          </View>

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
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2D0A4E',
  },
  waveLayer: {
    position: 'absolute',
    top: -100,
    left: -100,
    right: -100,
    bottom: -100,
    width: screenWidth + 200,
    height: screenHeight + 200,
  },
  gradientWave: {
    flex: 1,
    borderRadius: screenWidth,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(45, 10, 78, 0.4)',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 400,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  textContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 12,
    padding: 18,
    marginBottom: 24,
  },
  bodyText: {
    color: '#FFFFFF',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  readyButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 12,
  },
  readyButtonText: {
    color: '#5D1A94',
    fontSize: 17,
    fontWeight: 'bold',
  },
  subtext: {
    color: '#FFFFFF',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 8,
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
    color: '#FFFFFF',
    fontSize: 14,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});
