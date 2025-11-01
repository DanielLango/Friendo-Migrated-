import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';

interface CancellationModalProps {
  visible: boolean;
  friendName: string;
  onSelectUser: () => void;
  onSelectFriend: () => void;
  onCancel: () => void;
}

export default function CancellationModal({
  visible,
  friendName,
  onSelectUser,
  onSelectFriend,
  onCancel,
}: CancellationModalProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Who cancelled?</Text>
          <Text style={styles.subtitle}>
            Was it you who cancelled or your friend {friendName}?
          </Text>
          <Text style={styles.note}>
            If it is you then it is pink, if it is your friend then it is red.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.userButton]}
              onPress={onSelectUser}
            >
              <Text style={styles.buttonText}>I cancelled</Text>
              <View style={[styles.tokenPreview, styles.pinkToken]}>
                <Text style={styles.tokenText}>Cancelled</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.friendButton]}
              onPress={onSelectFriend}
            >
              <Text style={styles.buttonText}>{friendName} cancelled</Text>
              <View style={[styles.tokenPreview, styles.redToken]}>
                <Text style={styles.tokenText}>Cancelled</Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  note: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 24,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 16,
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
  },
  userButton: {
    backgroundColor: '#FFE6F0',
    borderColor: '#FF69B4',
  },
  friendButton: {
    backgroundColor: '#FFE6E6',
    borderColor: '#FF4444',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  tokenPreview: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pinkToken: {
    backgroundColor: '#FF69B4',
  },
  redToken: {
    backgroundColor: '#FF4444',
  },
  tokenText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#8000FF',
    fontWeight: '600',
  },
});