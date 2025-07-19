import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

interface CitySelectorProps {
  selectedCity: string;
  onCitySelect: (city: string, placeId: string) => void;
  placeholder?: string;
}

export default function CitySelector({ 
  selectedCity, 
  onCitySelect, 
  placeholder = "Select city..." 
}: CitySelectorProps) {
  const [showSelector, setShowSelector] = useState(false);

  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;

  // If no API key is configured, show a setup message
  if (!apiKey || apiKey === 'YOUR_API_KEY') {
    return (
      <View style={styles.container}>
        <View style={styles.setupMessage}>
          <Text style={styles.setupTitle}>🗺️ Google Places Setup Required</Text>
          <Text style={styles.setupText}>
            To use city search, please set up Google Places API key in your .env.local file.
            {'\n\n'}
            See docs/GOOGLE_PLACES_SETUP.md for instructions.
          </Text>
        </View>
      </View>
    );
  }

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
        <View style={styles.autocompleteContainer}>
          <GooglePlacesAutocomplete
            placeholder="Search for a city..."
            onPress={(data, details = null) => {
              const cityName = data.description.split(',')[0]; // Get city name
              onCitySelect(cityName, data.place_id);
              setShowSelector(false);
            }}
            query={{
              key: apiKey,
              language: 'en',
              types: '(cities)',
            }}
            styles={{
              textInputContainer: styles.textInputContainer,
              textInput: styles.textInput,
              listView: styles.listView,
              row: styles.row,
              description: styles.description,
            }}
            fetchDetails={true}
            enablePoweredByContainer={false}
            debounce={300}
            minLength={2}
            requestUrl={{
              useOnPlatform: 'web', // Use CORS proxy on web
            }}
          />
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
  setupMessage: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEAA7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
  },
  setupTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  setupText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
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
  autocompleteContainer: {
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
  textInputContainer: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  textInput: {
    backgroundColor: '#F8F8F8',
    borderRadius: 6,
    paddingHorizontal: 10,
    fontSize: 16,
    height: 40,
  },
  listView: {
    backgroundColor: '#FFFFFF',
    maxHeight: 150,
  },
  row: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  description: {
    fontSize: 14,
    color: '#333333',
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
