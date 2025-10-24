import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getFriends, addFriend } from '../utils/storage';

export default function ManualAddScreen() {
  const [fullName, setFullName] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [isLocal, setIsLocal] = useState(false);
  const [currentFriendCount, setCurrentFriendCount] = useState(0);
  
  const navigation = useNavigation();

  useEffect(() => {
    loadFriendCount();
  }, []);

  const loadFriendCount = async () => {
    const friends = await getFriends();
    setCurrentFriendCount(friends.length);
  };

  const handleAdd = async () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter a friend\'s name');
      return;
    }

    if (!isOnline && !isLocal) {
      Alert.alert('Error', 'Please select at least one friend type');
      return;
    }

    try {
      // Check friend limit
      const friends = await getFriends();
      if (friends.length >= 50) {
        Alert.alert(
          'Friend Limit Reached',
          'You can only add up to 50 friends. Please remove some friends before adding new ones.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      await addFriend({
        name: fullName.trim(),
        email: '',
        friendType: isOnline && isLocal ? 'both' : isOnline ? 'online' : 'local',
        isOnline,
        isLocal,
        profilePicture: '👤',
        city: '',
        source: 'manual',
      });

      Alert.alert('Success', 'Friend added successfully!', [
        { 
          text: 'Add Another', 
          style: 'default',
          onPress: () => {
            setFullName('');
            setIsOnline(false);
            setIsLocal(false);
            loadFriendCount();
          }
        },
        { 
          text: 'Done', 
          style: 'default',
          onPress: () => (navigation as any).navigate('AddFriends') 
        }
      ]);
    } catch (error) {
      console.error('Error adding friend:', error);
      Alert.alert('Error', 'Failed to add friend. Please try again.');
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add Friend Manually</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nickname of your friend</Text>
          <Text style={styles.sublabel}>How you like to call the person</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Alex, Johnny, Sarah..."
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Friend Type:</Text>
          
          <TouchableOpacity 
            style={styles.checkboxContainer}
            onPress={() => setIsOnline(!isOnline)}
          >
            <View style={[styles.checkbox, isOnline && styles.checkboxChecked]}>
              {isOnline && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>Online friend</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.checkboxContainer}
            onPress={() => setIsLocal(!isLocal)}
          >
            <View style={[styles.checkbox, isLocal && styles.checkboxChecked]}>
              {isLocal && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>Local friend</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={handleAdd}
          >
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        {/* Privacy Disclaimer */}
        <View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimerText}>
            This app is for your personal use only. Please avoid entering sensitive or real personal data about others unless you have their permission.
          </Text>
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
  placeholder: {
    width: 50,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  inputGroup: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  sectionContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#8000FF',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#8000FF',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333333',
  },
  sublabel: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666666',
  },
  addButton: {
    flex: 1,
    backgroundColor: '#8000FF',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginLeft: 10,
  },
  addButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  disclaimerContainer: {
    marginTop: 30,
    paddingHorizontal: 10,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 16,
    fontStyle: 'italic',
  },
});