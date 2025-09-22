import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { getPartnerVenues, getVenueCategory } from '../utils/venueTypes';

interface PartnerVenueSelectorProps {
  selectedVenue: string;
  onVenueSelect: (venueName: string) => void;
  selectedCity: string;
  selectedCategory: string;
}

export default function PartnerVenueSelector({ 
  selectedVenue, 
  onVenueSelect,
  selectedCity,
  selectedCategory 
}: PartnerVenueSelectorProps) {
  
  const partnerVenues = getPartnerVenues(selectedCity, selectedCategory);
  const category = getVenueCategory(selectedCategory);

  if (partnerVenues.length === 0) {
    return (
      <View style={styles.noVenuesContainer}>
        <Text style={styles.noVenuesIcon}>🏪</Text>
        <Text style={styles.noVenuesTitle}>
          No partner venues yet in {selectedCity}
        </Text>
        <Text style={styles.noVenuesSubtext}>
          We&apos;re working on partnerships with local {(category?.name?.toLowerCase() || 'venue') + 's'} in your area!
        </Text>
        <View style={styles.genericOption}>
          <TouchableOpacity
            style={[
              styles.genericButton,
              selectedVenue === `Generic ${category?.name || 'Venue'}` && styles.genericButtonSelected
            ]}
            onPress={() => onVenueSelect(`Generic ${category?.name || 'Venue'}`)}
          >
            <Text style={[
              styles.genericButtonText,
              selectedVenue === `Generic ${category?.name || 'Venue'}` && styles.genericButtonTextSelected
            ]}>
              📍 Select &quot;{category?.name || 'Venue'}&quot; as meeting type
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>
        🤝 Highlighted Advertisement Partners - {category?.name || 'Venue'}s in {selectedCity}
      </Text>
      
      <ScrollView style={styles.venueList} nestedScrollEnabled>
        {partnerVenues.map((venue) => (
          <TouchableOpacity
            key={venue.id}
            style={[
              styles.venueOption,
              selectedVenue === venue.name && styles.venueOptionSelected,
              venue.isFeatured && styles.featuredVenueOption
            ]}
            onPress={() => onVenueSelect(venue.name)}
          >
            <View style={styles.venueHeader}>
              <View style={styles.venueNameContainer}>
                <Text style={[
                  styles.venueName,
                  selectedVenue === venue.name && styles.venueNameSelected
                ]}>
                  {venue.name}
                </Text>
                {venue.isFeatured && (
                  <Text style={[
                    styles.featuredBadge,
                    selectedVenue === venue.name && styles.featuredBadgeSelected
                  ]}>
                    ⭐ Featured
                  </Text>
                )}
              </View>
              <View style={styles.partnershipBadge}>
                <Text style={styles.partnershipBadgeText}>
                  {venue.partnershipLevel.toUpperCase()}
                </Text>
              </View>
            </View>
            
            {venue.address ? (
              <Text style={[
                styles.venueAddress,
                selectedVenue === venue.name && styles.venueAddressSelected
              ]}>
                📍 {venue.address}
              </Text>
            ) : null}
            
            <View style={styles.venueDetails}>
              {venue.rating ? (
                <Text style={[
                  styles.venueRating,
                  selectedVenue === venue.name && styles.venueDetailsSelected
                ]}>
                  ⭐ {venue.rating.toFixed(1)}
                </Text>
              ) : null}
              {venue.priceLevel ? (
                <Text style={[
                  styles.venuePriceLevel,
                  selectedVenue === venue.name && styles.venueDetailsSelected
                ]}>
                  {'💰'.repeat(venue.priceLevel)}
                </Text>
              ) : null}
            </View>
            
            {venue.specialOffers && venue.specialOffers.length > 0 ? (
              <View style={styles.offersContainer}>
                <Text style={[
                  styles.offersTitle,
                  selectedVenue === venue.name && styles.venueDetailsSelected
                ]}>
                  🎁 Special Offers:
                </Text>
                {venue.specialOffers.map((offer, index) => (
                  <Text key={index} style={[
                    styles.offerText,
                    selectedVenue === venue.name && styles.venueDetailsSelected
                  ]}>
                    • {offer}
                  </Text>
                ))}
              </View>
            ) : null}
          </TouchableOpacity>
        ))}
        
        {/* Generic option always available */}
        <TouchableOpacity
          style={[
            styles.genericVenueOption,
            selectedVenue === `Generic ${category?.name || 'Venue'}` && styles.genericVenueOptionSelected
          ]}
          onPress={() => onVenueSelect(`Generic ${category?.name || 'Venue'}`)}
        >
          <Text style={[
            styles.genericVenueText,
            selectedVenue === `Generic ${category?.name || 'Venue'}` && styles.genericVenueTextSelected
          ]}>
            📍 Other {category?.name || 'Venue'} (Generic)
          </Text>
          <Text style={[
            styles.genericVenueSubtext,
            selectedVenue === `Generic ${category?.name || 'Venue'}` && styles.genericVenueSubtextSelected
          ]}>
            Choose your own {category?.name?.toLowerCase() || 'venue'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: 400,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  venueList: {
    maxHeight: 350,
  },
  noVenuesContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  noVenuesIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  noVenuesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
  },
  noVenuesSubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  genericOption: {
    width: '100%',
  },
  genericButton: {
    backgroundColor: '#F0F8FF',
    borderWidth: 2,
    borderColor: '#8000FF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genericButtonSelected: {
    backgroundColor: '#8000FF',
  },
  genericButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8000FF',
    textAlign: 'center',
  },
  genericButtonTextSelected: {
    color: '#FFFFFF',
  },
  venueOption: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  venueOptionSelected: {
    backgroundColor: '#8000FF',
    borderColor: '#8000FF',
  },
  featuredVenueOption: {
    borderColor: '#FFD700',
    backgroundColor: '#FFFBF0',
  },
  venueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  venueNameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  venueName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginRight: 8,
  },
  venueNameSelected: {
    color: '#FFFFFF',
  },
  featuredBadge: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: 'normal',
  },
  featuredBadgeSelected: {
    color: '#FFD700',
  },
  partnershipBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  partnershipBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  venueAddress: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  venueAddressSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  venueDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  venueRating: {
    fontSize: 12,
    color: '#666666',
    marginRight: 12,
  },
  venuePriceLevel: {
    fontSize: 12,
    color: '#666666',
  },
  venueDetailsSelected: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  offersContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  offersTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  offerText: {
    fontSize: 11,
    color: '#4CAF50',
    marginBottom: 2,
  },
  genericVenueOption: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  genericVenueOptionSelected: {
    backgroundColor: '#8000FF',
    borderColor: '#8000FF',
    borderStyle: 'solid',
  },
  genericVenueText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666666',
    marginBottom: 4,
    textAlign: 'center',
  },
  genericVenueTextSelected: {
    color: '#FFFFFF',
  },
  genericVenueSubtext: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
  },
  genericVenueSubtextSelected: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
});
