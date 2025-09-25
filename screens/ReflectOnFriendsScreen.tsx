import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ReflectOnFriendsScreen() {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [waveOpacity] = useState(new Animated.Value(0.3));
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [gifKey, setGifKey] = useState(0);
  
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

    // Continuous wave animation with proper looping
    const animateWave = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveOpacity, {
            toValue: 0.6,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(waveOpacity, {
            toValue: 0.3,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
        { iterations: -1 } // -1 means infinite loop
      ).start();
    };

    animateWave();

    // Force GIF to restart every 5 seconds to ensure continuous looping
    const gifRestartInterval = setInterval(() => {
      setGifKey(prev => prev + 1);
    }, 5000);

    return () => {
      clearInterval(gifRestartInterval);
    };
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
      {/* Wave animation background - positioned to cover entire screen */}
      <Animated.View style={[styles.waveContainer, { opacity: waveOpacity }]}>
        <Image
          key={gifKey} // Force re-render to restart GIF
          source={require('../assets/images/IMG_9429-ezgif.com-cut.gif')}
          style={styles.waveBackground}
          resizeMode="cover"
        />
      </Animated.View>
      
      {/* Strong purple overlay for text readability */}
      <View style={styles.overlay} />
      
      {/* Content */}
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.title}>Before we start…</Text>

          {/* Body Text with better readability */}
          <View style={styles.textContainer}>
            <Text style={styles.bodyText}>
              We invite you to take a quiet moment to think about the friends you&apos;d like to stay connected with.
              {'\\n\\n'}
              It can help to pause and reflect on your favorite memories — who comes to mind right away?
              {'\\n\\n'}
              Maybe scroll through your photo albums or contacts, or open some of your favorite messaging apps.
              {'\\n\\n'}
              You might think of friends you often talk to on Instagram, WhatsApp, Snapchat, Facebook, or Messenger. Or perhaps your closest connections are on X, LinkedIn, TikTok, Signal, Telegram, Pinterest, or Viber.
              {'\\n\\n'}
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
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2D0A4E', // Deep purple fallback
  },
  waveContainer: {
    position: 'absolute',
    top: -50, // Extend beyond screen edges
    left: -50,
    right: -50,
    bottom: -50,
    width: screenWidth + 100, // Ensure full coverage
    height: screenHeight + 100,
  },
  waveBackground: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(45, 10, 78, 0.75)', // Stronger purple overlay for text readability
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
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  textContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 18,
    marginBottom: 24,
  },
  bodyText: {
    color: '#FFFFFF',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
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
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  emptyRow: {
    height: 20,
  },
});
