import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { contactSources } from '../utils/mockData';
import { 
  syncPhoneContacts, 
  syncFacebookContacts, 
  syncInstagramContacts, 
  syncWhatsAppContacts, 
  syncLinkedInContacts 
} from '../utils/contactSyncUtils';
import { useTheme } from '../utils/themeContext';

export default function SyncScreen() {
  const [selectedFriends, setSelectedFriends] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { colors } = useTheme();
  const navigation = useNavigation();

  const handleSourcePress = async (source: any) => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      let syncResult;

      switch (source.id) {
        case 'phone':
          syncResult = await syncPhoneContacts();
          break;
        case 'facebook':
          syncResult = await syncFacebookContacts();
          break;
        case 'instagram':
          syncResult = await syncInstagramContacts();
          break;
        case 'whatsapp':
          syncResult = await syncWhatsAppContacts();
          break;
        case 'linkedin':
          syncResult = await syncLinkedInContacts();
          break;
        default:
          Alert.alert('Coming Soon', `${source.name} sync will be available soon!`);
          setIsLoading(false);
          return;
      }

      if (syncResult.success) {
        (navigation as any).navigate('ContactSelect', { 
          source: source.id, 
          contacts: syncResult.contacts 
        });
      } else {
        Alert.alert('Sync Failed', syncResult.error || 'Failed to sync contacts');
      }
    } catch (error) {
      console.error('Error syncing contacts:', error);
      Alert.alert('Error', 'An unexpected error occurred while syncing contacts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualAdd = () => {
    (navigation as any).navigate('ManualAdd');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content}>
        <Text style={[styles.instructionText, { color: colors.text }]}>
          Click the logos below to sync-in your contact lists so that you can just select them from there.
        </Text>

        <View style={styles.iconsGrid}>
          {contactSources.map((source) => (
            <TouchableOpacity
              key={source.id}
              style={[
                styles.iconButton, 
                { 
                  borderColor: source.color,
                  backgroundColor: colors.cardBackground
                },
                isLoading && styles.iconButtonDisabled
              ]}
              onPress={() => handleSourcePress(source)}
              disabled={isLoading}
            >
              <Text style={styles.iconEmoji}>{source.icon}</Text>
              <Text style={[styles.iconLabel, { color: colors.text }]}>{source.name}</Text>
              {isLoading && (
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>...</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.manualButton, { backgroundColor: colors.purple }]}
          onPress={handleManualAdd}
        >
          <Text style={styles.manualButtonText}>Add more friends manually</Text>
        </TouchableOpacity>

        <Text style={[styles.counterText, { color: colors.purple }]}>
          Number of Friends Selected so far: {selectedFriends}/50
        </Text>

        <View style={[styles.infoContainer, {
          backgroundColor: colors.isDarkMode ? 'rgba(128, 0, 255, 0.1)' : '#F8F4FF',
          borderColor: colors.isDarkMode ? 'rgba(128, 0, 255, 0.3)' : '#E0D4FF'
        }]}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>🔒 Privacy & Security</Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            • We only access basic profile information{'\n'}
            • Your contacts are stored securely{'\n'}
            • You can remove synced data anytime{'\n'}
            • We never post on your behalf
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  instructionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  iconsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  iconButton: {
    width: '22%',
    aspectRatio: 1,
    borderWidth: 2,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  iconButtonDisabled: {
    opacity: 0.6,
  },
  iconEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  iconLabel: {
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingText: {
    fontSize: 12,
    marginTop: 2,
  },
  manualButton: {
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 30,
  },
  manualButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  counterText: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 30,
  },
  infoContainer: {
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});