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
  TextInput,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { isAdminAuthenticated, clearAdminSession } from '../utils/adminAuth';
import { getAllPartnerVenues, deletePartnerVenue, getVenueStats, PartnerVenue } from '../utils/adminVenueManager';
import { 
  setPaywallTrigger, 
  disablePaywallTrigger, 
  getPaywallTriggerConfig,
  PaywallTriggerConfig 
} from '../utils/adminPaywallControl';
import { useTheme } from '../utils/themeContext';

export default function AdminDashboardScreen() {
  const [venues, setVenues] = useState<PartnerVenue[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [paywallConfig, setPaywallConfig] = useState<PaywallTriggerConfig | null>(null);
  const [paywallEnabled, setPaywallEnabled] = useState(false);
  const [friendsUntilPaywall, setFriendsUntilPaywall] = useState('5');
  const navigation = useNavigation();
  const { colors } = useTheme();

  useEffect(() => {
    checkAuth();
    loadData();
    loadPaywallConfig();
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

  const loadPaywallConfig = async () => {
    const config = await getPaywallTriggerConfig();
    setPaywallConfig(config);
    setPaywallEnabled(config?.enabled || false);
    if (config?.friendsUntilPaywall) {
      setFriendsUntilPaywall(config.friendsUntilPaywall.toString());
    }
  };

  const handleTogglePaywallTrigger = async (enabled: boolean) => {
    if (enabled) {
      const n = parseInt(friendsUntilPaywall, 10);
      if (isNaN(n) || n < 1) {
        Alert.alert('Invalid Input', 'Please enter a valid number (1 or more)');
        return;
      }
      
      const success = await setPaywallTrigger(n);
      if (success) {
        setPaywallEnabled(true);
        Alert.alert(
          'Paywall Trigger Activated',
          `Free users will see the paywall after adding ${n} more friend${n > 1 ? 's' : ''}.`
        );
        await loadPaywallConfig();
      }
    } else {
      Alert.alert(
        'Disable Paywall Trigger',
        'This will revert to the default 50-friend limit for free users. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: async () => {
              const success = await disablePaywallTrigger();
              if (success) {
                setPaywallEnabled(false);
                Alert.alert('Success', 'Paywall trigger disabled. Default limit restored.');
                await loadPaywallConfig();
              }
            }
          }
        ]
      );
    }
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

        {/* Dynamic Paywall Control */}
        <View style={[styles.paywallCard, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.paywallHeader}>
            <Text style={[styles.paywallTitle, { color: colors.text }]}>💰 Dynamic Paywall Trigger</Text>
            <Switch
              value={paywallEnabled}
              onValueChange={handleTogglePaywallTrigger}
              trackColor={{ false: colors.border, true: colors.orange }}
              thumbColor={colors.white}
            />
          </View>
          
          <Text style={[styles.paywallDescription, { color: colors.textSecondary }]}>
            {paywallEnabled 
              ? 'Active: Free users will hit paywall after N more friends'
              : 'Inactive: Default 50-friend limit for free users'}
          </Text>
          
          <View style={styles.paywallInputRow}>
            <Text style={[styles.paywallInputLabel, { color: colors.text }]}>
              Friends until paywall:
            </Text>
            <TextInput
              style={[styles.paywallInput, { 
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text
              }]}
              value={friendsUntilPaywall}
              onChangeText={setFriendsUntilPaywall}
              keyboardType="number-pad"
              editable={!paywallEnabled}
              placeholder="5"
              placeholderTextColor={colors.textTertiary}
            />
          </View>
          
          {paywallEnabled && paywallConfig && (
            <View style={[styles.paywallStatus, { backgroundColor: colors.orangeLight }]}>
              <Text style={[styles.paywallStatusText, { color: colors.orange }]}>
                ⚡ Active: Users will see paywall after {paywallConfig.friendsUntilPaywall} more friend{paywallConfig.friendsUntilPaywall > 1 ? 's' : ''}
              </Text>
            </View>
          )}
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
  paywallCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
  },
  paywallHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paywallTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  paywallDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  paywallInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  paywallInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 12,
    flex: 1,
  },
  paywallInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    width: 80,
    textAlign: 'center',
  },
  paywallStatus: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  paywallStatusText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
