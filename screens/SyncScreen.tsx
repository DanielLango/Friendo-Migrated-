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

export default function SyncScreen() {
  const [selectedFriends, setSelectedFriends] = useState(0);
  const navigation = useNavigation();

  const handleSourcePress = (source: any) => {
    if (['facebook', 'instagram', 'whatsapp'].includes(source.id)) {
      // Simulate OAuth flow
      Alert.alert(
        'Permissions',
        `You will receive: your name and profile picture, friends list and email address.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: `Continue as User`, 
            onPress: () => {
              (navigation as any).navigate('ContactSelect', { source: source.id });
            }
          }
        ]
      );
    } else {
      Alert.alert('Coming Soon', `${source.name} sync will be available soon!`);
    }
  };

  const handleManualAdd = () => {
    (navigation as any).navigate('ManualAdd');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.instructionText}>
          Click the logos below to sync-in your contact lists so that you can just select them from there.
        </Text>

        <View style={styles.iconsGrid}>
          {contactSources.map((source) => (
            <TouchableOpacity
              key={source.id}
              style={[styles.iconButton, { borderColor: source.color }]}
              onPress={() => handleSourcePress(source)}
            >
              <Text style={styles.iconEmoji}>{source.icon}</Text>
              <Text style={styles.iconLabel}>{source.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.manualButton}
          onPress={handleManualAdd}
        >
          <Text style={styles.manualButtonText}>Add more friends manually</Text>
        </TouchableOpacity>

        <Text style={styles.counterText}>
          Number of Friends Selected so far: {selectedFriends}/50
        </Text>
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  instructionText: {
    fontSize: 16,
    color: '#333333',
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
    backgroundColor: '#FAFAFA',
  },
  iconEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  iconLabel: {
    fontSize: 10,
    color: '#333333',
    textAlign: 'center',
    fontWeight: '500',
  },
  manualButton: {
    backgroundColor: '#8000FF',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 30,
  },
  manualButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  counterText: {
    fontSize: 16,
    color: '#A94EFF',
    textAlign: 'center',
    fontWeight: '500',
  },
});
