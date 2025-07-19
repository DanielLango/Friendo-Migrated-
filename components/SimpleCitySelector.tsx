import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface SimpleCitySelectorProps {
  selectedCity: string;
  onCitySelect: (city: string, placeId: string) => void;
  placeholder?: string;
}

const popularCities = [
  'New York, NY',
  'Los Angeles, CA',
  'Chicago, IL',
  'Houston, TX',
  'Phoenix, AZ',
  'Philadelphia, PA',
  'San Antonio, TX',
  'San Diego, CA',
  'Dallas, TX',
  'San Jose, CA',
  'Austin, TX',
  'Jacksonville, FL',
  'Fort Worth, TX',
  'Columbus, OH',
  'Charlotte, NC',
  'San Francisco, CA',
  'Indianapolis, IN',
  'Seattle, WA',
  'Denver, CO',
  'Washington, DC',
  'Boston, MA',
  'El Paso, TX',
  'Nashville, TN',
  'Detroit, MI',
  'Oklahoma City, OK',
  'Portland, OR',
  'Las Vegas, NV',
  'Memphis, TN',
  'Louisville, KY',
  'Baltimore, MD',
  'Milwaukee, WI',
  'Albuquerque, NM',
  'Tucson, AZ',
  'Fresno, CA',
  'Mesa, AZ',
  'Sacramento, CA',
  'Atlanta, GA',
  'Kansas City, MO',
  'Colorado Springs, CO',
  'Miami, FL',
  'Raleigh, NC',
  'Omaha, NE',
  'Long Beach, CA',
  'Virginia Beach, VA',
  'Oakland, CA',
  'Minneapolis, MN',
  'Tulsa, OK',
  'Arlington, TX',
  'Tampa, FL',
  'New Orleans, LA'
];

export default function SimpleCitySelector({ 
  selectedCity, 
  onCitySelect, 
  placeholder = "Select city..." 
}: SimpleCitySelectorProps) {
  const [showSelector, setShowSelector] = useState(false);

  const handleCitySelect = (city: string) => {
    onCitySelect(city, city); // Use city name as placeId for simplicity
    setShowSelector(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.citySelector}
        onPress={() => setShowSelector(!showSelector)}
      >
        <Text style={[
          styles.citySelectorText,
          !selectedCity && styles.placeholderText
        ]}>
          {selectedCity || placeholder}
        </Text>
        <Text style={styles.dropdownIcon}>{showSelector ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {showSelector && (
        <View style={styles.cityListContainer}>
          <ScrollView style={styles.cityList} nestedScrollEnabled>
            {popularCities.map((city) => (
              <TouchableOpacity
                key={city}
                style={[
                  styles.cityOption,
                  selectedCity === city && styles.cityOptionSelected
                ]}
                onPress={() => handleCitySelect(city)}
              >
                <Text style={[
                  styles.cityOptionText,
                  selectedCity === city && styles.cityOptionTextSelected
                ]}>
                  {city}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {selectedCity && (
        <View style={styles.selectedCityDisplay}>
          <Text style={styles.selectedCityIcon}>📍</Text>
          <Text style={styles.selectedCityText}>{selectedCity}</Text>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => onCitySelect('', '')}
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  citySelector: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  citySelectorText: {
    fontSize: 16,
    color: '#333333',
  },
  placeholderText: {
    color: '#999999',
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#666666',
  },
  cityListContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    maxHeight: 200,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  cityList: {
    maxHeight: 200,
  },
  cityOption: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cityOptionSelected: {
    backgroundColor: '#8000FF',
  },
  cityOptionText: {
    fontSize: 16,
    color: '#333333',
  },
  cityOptionTextSelected: {
    color: '#FFFFFF',
  },
  selectedCityDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#8000FF',
  },
  selectedCityIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  selectedCityText: {
    flex: 1,
    fontSize: 14,
    color: '#8000FF',
    fontWeight: '500',
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 12,
    color: '#999999',
  },
});