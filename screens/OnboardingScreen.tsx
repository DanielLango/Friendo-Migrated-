import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function OnboardingScreen() {
  const navigation = useNavigation();

  const handleContinueWithSyncing = () => {
    (navigation as any).navigate('Sync');
  };

  const handleContinueWithoutSyncing = () => {
    (navigation as any).navigate('ManualAdd');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.welcomeText}>
          Welcome to the Friendo App… Please try to think of your top 3–50 friends that you would like to be better at keeping in touch with.
        </Text>
        
        <Text style={styles.instructionText}>
          Go through your Contacts to find them.
        </Text>
        
        <Text style={styles.platformText}>
          Facebook, Instagram, Snapchat, Whatsapp, LinkedIn, Telegram, Viber, Signal or your Phonebook...
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.syncButton}
            onPress={handleContinueWithSyncing}
          >
            <Text style={styles.syncButtonText}>Continue With Syncing</Text>
          </TouchableOpacity>
          
          <Text style={styles.noteText}>
            (If you choose this option, you can still also add friends manually)
          </Text>

          <Text style={styles.explanationText}>
            Click the 'Continue without syncing' to just add them without going through your messenger and social media apps.
          </Text>

          <TouchableOpacity 
            style={styles.noSyncButton}
            onPress={handleContinueWithoutSyncing}
          >
            <Text style={styles.noSyncButtonText}>Continue Without Syncing</Text>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 30,
    paddingVertical: 40,
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: 18,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 26,
  },
  instructionText: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: '500',
  },
  platformText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 20,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  syncButton: {
    backgroundColor: '#8000FF',
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 30,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  syncButtonText: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
  },
  noteText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 30,
    fontStyle: 'italic',
  },
  explanationText: {
    fontSize: 14,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  noSyncButton: {
    backgroundColor: '#8000FF',
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 30,
    width: '100%',
    alignItems: 'center',
  },
  noSyncButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
