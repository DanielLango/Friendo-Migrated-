import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ReflectOnFriendsScreen() {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [gifKey, setGifKey] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
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

    // Force GIF to restart every 9 seconds to ensure continuous looping
    const gifRestartInterval = setInterval(() => {
      setGifKey(prev => prev + 1);
    }, 9000);

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
      {/* Debug info */}
      <View style={styles.debugInfo}>
        <Text style={styles.debugText}>
          Image loaded: {imageLoaded ? 'Yes' : 'No'} | Error: {imageError ? 'Yes' : 'No'}
        </Text>
      </View>

      {/* Wave animation background - simplified */}
      <View style={styles.waveContainer}>
        <Image
          key={gifKey}
          source={require('../assets/images/IMG_9429-ezgif.com-cut.gif')}
          style={styles.waveBackground}
          resizeMode="cover"
          onLoad={() => {
            console.log('GIF loaded successfully');
            setImageLoaded(true);
          }}
          onError={(error) => {
            console.log('Image loading error:', error);
            setImageError(true);
          }}
        />
      </View>
      
      {/* Much lighter overlay for debugging */}
      <View style={styles.lightOverlay} />
      
      {/* Content */}
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Text style={styles.title}>Before we start…</Text>

          <View style={styles.textContainer}>
            <Text style={styles.bodyText}>
              We invite you to take a quiet moment to think about the friends you'd like to stay connected with.
              {'\n\n'}
              Take your time to reflect on your favorite memories and connections.
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.readyButton}
            onPress={handleReady}
          >
            <Text style={styles.readyButtonText}>I'm Ready</Text>
          </TouchableOpacity>

          <Text style={styles.subtext}>
            You can always change your selection later.
          </Text>

          <TouchableOpacity 
            style={styles.checkboxContainer}
            onPress={() => setDontShowAgain(!dontShowAgain)}
          >
            <View style={[styles.checkbox, dontShowAgain && styles.checkboxChecked]}>
              {dontShowAgain && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>Don't display this page to me anymore</Text>
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
  debugInfo: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    zIndex: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    borderRadius: 5,
  },
  debugText: {
    color: '#000',
    fontSize: 12,
  },
  waveContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  waveBackground: {
    width: '100%',
    height: '100%',
  },
  lightOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(45, 10, 78, 0.3)', // Much lighter overlay for debugging
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
