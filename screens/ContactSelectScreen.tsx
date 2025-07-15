import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Switch,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useBasic } from '@basictech/expo';
import { mockSyncedContacts } from '../utils/mockData';
import { SyncedContact } from '../types';

export default function ContactSelectScreen() {
  const [contacts, setContacts] = useState<SyncedContact[]>([]);
  const [selectedCount, setSelectedCount] = useState(0);
  const navigation = useNavigation();
  const route = useRoute();
  const { db } = useBasic();
  
  const source = (route.params as any)?.source || 'facebook';

  useEffect(() => {
    // Load contacts for the selected source
    const sourceContacts = mockSyncedContacts[source] || [];
    setContacts(sourceContacts);
  }, [source]);

  const toggleContact = (contactId: string) => {
    setContacts(prevContacts => 
      prevContacts.map(contact => {
        if (contact.id === contactId) {
          const newSelected = !contact.selected;
          setSelectedCount(prev => newSelected ? prev + 1 : prev - 1);
          return { ...contact, selected: newSelected };
        }
        return contact;
      })
    );
  };

  const handleContinue = async () => {
    const selectedContacts = contacts.filter(contact => contact.selected);
    
    if (db) {
      try {
        // Save selected friends to database
        for (const contact of selectedContacts) {
          await db.from('friends').add({
            name: contact.name,
            email: '',
            friendType: 'both',
            isOnline: true,
            isLocal: true,
            profilePicture: contact.profilePicture,
            city: contact.city,
            source: contact.source,
            notificationFrequency: 'weekly',
            notificationDays: 7,
            createdAt: Date.now(),
          });
        }
        navigation.navigate('Main' as never);
      } catch (error) {
        console.error('Error saving friends:', error);
      }
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
