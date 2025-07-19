import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { venueCategories, getPartnerVenues } from '../utils/venueTypes';

interface VenueCategorySelectorProps {
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
  selectedCity: string;
}

export default function VenueCategorySelector({ 
  selectedCategory, 
  onCategorySelect,
  selectedCity 
}: VenueCategorySelectorProps) {
  
  const handleCategorySelect = (categoryId: string) => {
    onCategorySelect(categoryId);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.categoryList} nestedScrollEnabled>
        {venueCategories.map((category) => {
          const partnerCount = selectedCity ? getPartnerVenues(selectedCity, category.id).length : 0;
          
          return (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryOption,
                selectedCategory === category.id && styles.categoryOptionSelected
              ]}
              onPress={() => handleCategorySelect(category.id)}
            >
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <View style={styles.categoryInfo}>
                  <Text style={[
                    styles.categoryName,
                    selectedCategory === category.id && styles.categoryNameSelected
                  ]}>
                    {category.name}
                  </Text>
                  <Text style={[
                    styles.categoryDescription,
                    selectedCategory === category.id && styles.categoryDescriptionSelected
                  ]}>
                    {category.description}
                  </Text>
                </View>
                {partnerCount > 0 && (
                  <View style={styles.partnerBadge}>
                    <Text style={styles.partnerBadgeText}>
                      {partnerCount} partner{partnerCount !== 1 ? 's' : ''}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: 400,
  },
  categoryList: {
    maxHeight: 400,
  },
  categoryOption: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  categoryOptionSelected: {
    backgroundColor: '#8000FF',
    borderColor: '#8000FF',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 2,
  },
  categoryNameSelected: {
    color: '#FFFFFF',
  },
  categoryDescription: {
    fontSize: 14,
    color: '#666666',
  },
  categoryDescriptionSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  partnerBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  partnerBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});