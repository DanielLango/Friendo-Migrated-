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
  const [backgroundAnim] = useState(new Animated.Value(0));
  const [gifOpacity1] = useState(new Animated.Value(1)); // Forward GIF opacity
  const [gifOpacity2] = useState(new Animated.Value(0)); // Reverse GIF opacity
  const [dontShowAgain, setDontShowAgain] = useState(false);
  
  const navigation = useNavigation();

  // GIF sources
  const gifSources = [
    require('../assets/images/IMG_9429-ezgif.com-instagif.gif'), // Forward
    require('../assets/images/IMG_9429-ezgif.com-reverse.gif'),  // Reverse
  ];

  useEffect(() => {
    // Start background animation first
    Animated.timing(backgroundAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();

    // Then start content animation
    setTimeout(() => {
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
    }, 500);

    // Set up GIF crossfade animation (every 5 seconds)
    const gifInterval = setInterval(() => {
      // Crossfade between the two GIFs
      Animated.parallel([
        Animated.timing(gifOpacity1, {
          toValue: gifOpacity1._value === 1 ? 0 : 1,
          duration: 500, // 500ms smooth transition
          useNativeDriver: true,
        }),
        Animated.timing(gifOpacity2, {
          toValue: gifOpacity2._value === 0 ? 1 : 0,
          duration: 500, // 500ms smooth transition
          useNativeDriver: true,
        }),
      ]).start();
    }, 5000);

    // Cleanup interval on unmount
    return () => clearInterval(gifInterval);
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
      {/* Background with water animation and purple overlay */}
      <View style={styles.backgroundContainer}>
        <Animated.View 
          style={[
            styles.backgroundImageContainer,
            {
              opacity: backgroundAnim,
            },
          ]}
        >
          {/* Forward GIF */}
          <Animated.Image 
            source={gifSources[0]}
            style={[
              styles.backgroundImage,
              { opacity: gifOpacity1 }
            ]}
            resizeMode="cover"
          />
          {/* Reverse GIF */}
          <Animated.Image 
            source={gifSources[1]}
            style={[
              styles.backgroundImage,
              { opacity: gifOpacity2 }
            ]}
            resizeMode="cover"
          />
          {/* Purple overlay to create the deep purple effect */}
          <View style={styles.purpleOverlay} />
        </Animated.View>
      </View>
      
      {/* Content */}
      <SafeAreaView style={styles.safeArea}>
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
          <View style={styles.textContainer}>
            <Text style={styles.bodyText}>
              We invite you to take a quiet moment to think about the friends you'd like to stay connected with.
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
            <Text style={styles.readyButtonText}>I'm Ready</Text>
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
            <Text style={styles.checkboxLabel}>Don't display this page to me anymore</Text>
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
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: screenWidth,
    height: screenHeight,
  },
  backgroundImageContainer: {
    flex: 1,
    position: 'relative',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  purpleOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#2D0A4E',
    opacity: 0.85, // Strong purple overlay to create the deep purple effect
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
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
