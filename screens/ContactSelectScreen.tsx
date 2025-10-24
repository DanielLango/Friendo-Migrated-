import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Switch,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { mockSyncedContacts } from '../utils/mockData';
import { SyncedContact } from '../types';
import { getFriends, addFriend } from '../utils/storage';

export default function ContactSelectScreen() {
  const [contacts, setContacts] = useState<SyncedContact[]>([]);
  const [selectedCount, setSelectedCount] = useState(0);
  const [currentFriendCount, setCurrentFriendCount] = useState(0);
  const navigation = useNavigation();
  const route = useRoute();
  
  const source = (route.params as any)?.source || 'facebook';

  useEffect(() => {
    // Load contacts for the selected source
    const sourceContacts = mockSyncedContacts[source] || [];
    setContacts(sourceContacts);
  }, [source]);

  useEffect(() => {
    // Get current friend count
    const fetchFriendCount = async () => {
      try {
        const friends = await getFriends();
        setCurrentFriendCount(friends.length);
      } catch (error) {
        console.error('Error fetching friend count:', error);
      }
    };
    fetchFriendCount();
  }, []);

  const toggleContact = (contactId: string) => {
    setContacts(prevContacts => 
      prevContacts.map(contact => {
        if (contact.id === contactId) {
          const newSelected = !contact.selected;
          
          // Check if adding this contact would exceed the limit
          if (newSelected && (currentFriendCount + selectedCount + 1) > 50) {
            Alert.alert(
              'Friend Limit Reached',
              'You can only add up to 50 friends. Please deselect some contacts or remove existing friends first.',
              [{ text: 'OK' }]
            );
            return contact;
          }
          
          setSelectedCount(prev => newSelected ? prev + 1 : prev - 1);
          return { ...contact, selected: newSelected };
        }
        return contact;
      })
    );
  };

  const handleContinue = async () => {
    const selectedContacts = contacts.filter(contact => contact.selected);
    
    try {
      // Double-check the limit before saving
      const friends = await getFriends();
      const totalCount = friends.length + selectedContacts.length;
      
      if (totalCount > 50) {
        Alert.alert(
          'Friend Limit Exceeded',
          `You can only have up to 50 friends. You currently have ${friends.length} friends and are trying to add ${selectedContacts.length} more.`,
          [{ text: 'OK' }]
        );
        return;
      }
      
      // Save selected friends to storage
      for (const contact of selectedContacts) {
        await addFriend({
          name: contact.name,
          email: '',
          friendType: 'both',
          isOnline: true,
          isLocal: true,
          profilePicture: contact.profilePicture,
          city: contact.city,
          source: source as 'facebook' | 'instagram' | 'snapchat' | 'whatsapp' | 'linkedin' | 'telegram' | 'viber' | 'signal' | 'tiktok' | 'pinterest' | 'messenger' | 'apple' | 'google' | 'manual' | 'phone-contacts',
          notificationFrequency: 'weekly',
          notificationDays: 7,
        });
      }
      navigation.navigate('AddFriends' as never);
    } catch (error) {
      console.error('Error saving friends:', error);
    }
  };

  const renderContact = ({ item }: { item: SyncedContact }) => (
    <View style={styles.contactItem}>
      <Text style={styles.profilePicture}>{item.profilePicture}</Text>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.contactCity}>{item.city}</Text>
      </View>
      <Switch
        value={item.selected}
        onValueChange={() => toggleContact(item.id)}
        trackColor={{ false: '#E0E0E0', true: '#8000FF' }}
        thumbColor={item.selected ? '#FFFFFF' : '#FFFFFF'}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Select Friends</Text>
        <TouchableOpacity onPress={handleContinue}>
          <Text style={styles.continueButton}>Continue</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.counterText}>
        Selected: {selectedCount}/50
      </Text>

      <FlatList
        data={contacts}
        renderItem={renderContact}
        keyExtractor={(item) => item.id}
        style={styles.contactsList}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    fontSize: 16,
    color: '#8000FF',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  continueButton: {
    fontSize: 16,
    color: '#8000FF',
    fontWeight: 'bold',
  },
  counterText: {
    fontSize: 16,
    color: '#A94EFF',
    textAlign: 'center',
    paddingVertical: 15,
    fontWeight: '500',
  },
  contactsList: {
    flex: 1,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  profilePicture: {
    fontSize: 40,
    marginRight: 15,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 2,
  },
  contactCity: {
    fontSize: 14,
    color: '#666666',
  },
});
