import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';

interface Venue {
  id: string;
  name: string;
  address: string;
  rating?: number;
  priceLevel?: number;
  isManual?: boolean;
}

interface VenueSelectorProps {
  selectedVenue: string;
  onVenueSelect: (venue: string) => void;
  activityType: string;
  cityPlaceId: string;
  manualVenues?: Venue[]; // For future manual top 5 venues
}

export default function VenueSelector({ 
  selectedVenue, 
  onVenueSelect, 
  activityType, 
  cityPlaceId,
  manualVenues = []
}: VenueSelectorProps) {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Map activity types to Google Places types
  const getPlaceType = (activity: string): string => {
    const typeMap: { [key: string]: string } = {
      'coffee': 'cafe',
      'restaurant': 'restaurant',
      'bar': 'bar',
      'drinks': 'bar',
      'lunch': 'restaurant',
      'dinner': 'restaurant',
      'breakfast': 'cafe',
      'movie': 'movie_theater',
      'shopping': 'shopping_mall',
      'park': 'park',
      'museum': 'museum',
      'gym': 'gym',
      'sports': 'stadium'
    };
    return typeMap[activity.toLowerCase()] || 'establishment';
  };

  const fetchVenues = async () => {
    if (!cityPlaceId || !activityType) return;

    setLoading(true);
    setError(null);

    try {
      const placeType = getPlaceType(activityType);
      
      // This is a mock implementation - in a real app, you'd call Google Places API
      // For now, we'll generate some mock venues based on the activity type
      const mockVenues: Venue[] = [
        {
          id: '1',
          name: `Best ${activityType} Spot`,
          address: 'Downtown Area',
          rating: 4.5,
          priceLevel: 2,
        },
        {
          id: '2',
          name: `Popular ${activityType} Place`,
          address: 'City Center',
          rating: 4.2,
          priceLevel: 3,
        },
        {
          id: '3',
          name: `Local ${activityType} Favorite`,
          address: 'Main Street',
          rating: 4.7,
          priceLevel: 2,
        },
        {
          id: '4',
          name: `Trendy ${activityType} Venue`,
          address: 'Arts District',
          rating: 4.3,
          priceLevel: 3,
        },
        {
          id: '5',
          name: `Classic ${activityType} Spot`,
          address: 'Historic Quarter',
          rating: 4.1,
          priceLevel: 1,
        },
      ];

      // Combine manual venues (priority) with API venues
      const combinedVenues = [...manualVenues, ...mockVenues];
      setVenues(combinedVenues);
    } catch (err) {
      setError('Failed to load venues');
      console.error('Error fetching venues:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, [cityPlaceId, activityType]);

  const renderPriceLevel = (level?: number) => {
    if (!level) return '';
    return '💰'.repeat(level);
  };

  const renderRating = (rating?: number) => {
    if (!rating) return '';
    return `⭐ ${rating.toFixed(1)}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#8000FF" />
        <Text style={styles.loadingText}>Finding venues...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchVenues}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.venueList} nestedScrollEnabled>
        {venues.map((venue) => (
          <TouchableOpacity
            key={venue.id}
            style={[
              styles.venueOption,
              selectedVenue === venue.name && styles.venueOptionSelected,
              venue.isManual && styles.manualVenueOption
            ]}
            onPress={() => onVenueSelect(venue.name)}
          >
            <View style={styles.venueHeader}>
              <Text style={[
                styles.venueName,
                selectedVenue === venue.name && styles.venueNameSelected
              ]}>
                {venue.name}
                {venue.isManual && <Text style={styles.manualBadge}> ⭐ Top Pick</Text>}
              </Text>
            </View>
            <Text style={[
              styles.venueAddress,
              selectedVenue === venue.name && styles.venueAddressSelected
            ]}>
              {venue.address}
            </Text>
            <View style={styles.venueDetails}>
              {venue.rating && (
                <Text style={[
                  styles.venueRating,
                  selectedVenue === venue.name && styles.venueDetailsSelected
                ]}>
                  {renderRating(venue.rating)}
                </Text>
              )}
              {venue.priceLevel && (
                <Text style={[
                  styles.venuePriceLevel,
                  selectedVenue === venue.name && styles.venueDetailsSelected
                ]}>
                  {renderPriceLevel(venue.priceLevel)}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: 300,
  },
  venueList: {
    maxHeight: 300,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666666',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#FF6B6B',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#8000FF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  venueOption: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  venueOptionSelected: {
    backgroundColor: '#8000FF',
    borderColor: '#8000FF',
  },
  manualVenueOption: {
    borderColor: '#FFD700',
    backgroundColor: '#FFFBF0',
  },
  venueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  venueName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
  },
  venueNameSelected: {
    color: '#FFFFFF',
  },
  manualBadge: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: 'normal',
  },
  venueAddress: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 6,
  },
  venueAddressSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  venueDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  venueRating: {
    fontSize: 12,
    color: '#666666',
    marginRight: 10,
  },
  venuePriceLevel: {
    fontSize: 12,
    color: '#666666',
  },
  venueDetailsSelected: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
});