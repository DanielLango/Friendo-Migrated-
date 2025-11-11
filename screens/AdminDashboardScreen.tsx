import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { isAdminAuthenticated, clearAdminSession } from '../utils/adminAuth';
import { getAllPartnerVenues, deletePartnerVenue, getVenueStats, PartnerVenue } from '../utils/adminVenueManager';
import { useTheme } from '../utils/themeContext';

export default function AdminDashboardScreen() {
  const [venues, setVenues] = useState<PartnerVenue[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const { colors } = useTheme();

  useEffect(() => {
    checkAuth();
    loadData();
  }, []);

  const checkAuth = async () => {
    const authenticated = await isAdminAuthenticated();
    if (!authenticated) {
      Alert.alert('Session Expired', 'Please login again');
      (navigation as any).replace('AdminLogin');
    }
  };

  const loadData = async () => {
    setLoading(true);
    const venuesResult = await getAllPartnerVenues();
    const statsResult = await getVenueStats();
    
    if (venuesResult.success) {
      setVenues(venuesResult.data || []);
    }
    
    if (statsResult.success) {
      setStats(statsResult.stats);
    }
    
    setLoading(false);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout from admin panel?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await clearAdminSession();
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleDeleteVenue = (venueId: string, venueName: string) => {
    Alert.alert(
      'Delete Venue',
      `Are you sure you want to delete "${venueName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deletePartnerVenue(venueId);
            if (result.success) {
              Alert.alert('Success', 'Venue deleted successfully');
              loadData();
            } else {
              Alert.alert('Error', 'Failed to delete venue');
            }
          },
        },
      ]
    );
  };

  const totalVenues = venues.filter(v => v.is_active).length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleLogout} style={styles.backButton}>
          <MaterialIcons name="logout" size={24} color={colors.red} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Admin Dashboard</Text>
        <TouchableOpacity onPress={loadData} style={styles.refreshButton}>
          <MaterialIcons name="refresh" size={24} color={colors.purple} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Stats Card */}
        <View style={[styles.statsCard, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.statsTitle, { color: colors.text }]}>Overview</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.purple }]}>{totalVenues}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Venues</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.green }]}>
                {Object.keys(stats).length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Cities</Text>
            </View>
          </View>
        </View>

        {/* Add New Venue Button */}
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.purple }]}
          onPress={() => (navigation as any).navigate('AdminAddVenue', { onSuccess: loadData })}
        >
          <MaterialIcons name="add-circle" size={24} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add New Partner Venue</Text>
        </TouchableOpacity>

        {/* Venues List */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Partner Venues</Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.purple} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading venues...</Text>
            </View>
          ) : venues.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No venues yet. Add your first partner venue!
            </Text>
          ) : (
            venues.map((venue) => (
              <View
                key={venue.id}
                style={[styles.venueCard, { 
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  opacity: venue.is_active ? 1 : 0.5
                }]}
              >
                <View style={styles.venueHeader}>
                  <View style={styles.venueInfo}>
                    <Text style={[styles.venueName, { color: colors.text }]}>
                      {venue.name}
                      {venue.is_featured && ' ⭐'}
                    </Text>
                    <Text style={[styles.venueDetails, { color: colors.textSecondary }]}>
                      {venue.city} • {venue.category}
                    </Text>
                    <View style={[styles.levelBadge, { backgroundColor: colors.purpleLight }]}>
                      <Text style={[styles.levelText, { color: colors.purple }]}>
                        {venue.partnership_level.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.venueActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: colors.purple }]}
                      onPress={() => (navigation as any).navigate('AdminEditVenue', { 
                        venue,
                        onSuccess: loadData 
                      })}
                    >
                      <MaterialIcons name="edit" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: colors.red }]}
                      onPress={() => handleDeleteVenue(venue.id, venue.name)}
                    >
                      <MaterialIcons name="delete" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 5,
  },
  refreshButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  statsCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    paddingVertical: 20,
  },
  venueCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  venueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  venueInfo: {
    flex: 1,
  },
  venueName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  venueDetails: {
    fontSize: 14,
    marginBottom: 8,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  venueActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});