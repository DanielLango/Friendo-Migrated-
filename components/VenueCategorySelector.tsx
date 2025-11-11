import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { venueCategories, getPartnerVenues } from '../utils/venueTypes';
import { useTheme } from '../utils/themeContext';

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
  const { colors } = useTheme();
  const [partnerCounts, setPartnerCounts] = useState<{ [key: string]: number }>({});
  
  useEffect(() => {
    if (selectedCity) {
      loadPartnerCounts();
    }
  }, [selectedCity]);

  const loadPartnerCounts = async () => {
    const counts: { [key: string]: number } = {};
    
    for (const category of venueCategories) {
      const venues = await getPartnerVenues(selectedCity, category.id);
      counts[category.id] = venues.length;
    }
    
    setPartnerCounts(counts);
  };

  const handleCategorySelect = (categoryId: string) => {
    onCategorySelect(categoryId);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.categoryList} nestedScrollEnabled>
        {venueCategories.map((category) => {
          const partnerCount = partnerCounts[category.id] || 0;
          
          return (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryOption,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.border
                },
                selectedCategory === category.id && {
                  backgroundColor: colors.purple,
                  borderColor: colors.purple
                }
              ]}
              onPress={() => handleCategorySelect(category.id)}
            >
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <View style={styles.categoryInfo}>
                  <Text style={[
                    styles.categoryName,
                    { color: colors.text },
                    selectedCategory === category.id && styles.categoryNameSelected
                  ]}>
                    {category.name}
                  </Text>
                  <Text style={[
                    styles.categoryDescription,
                    { color: colors.textSecondary },
                    selectedCategory === category.id && styles.categoryDescriptionSelected
                  ]}>
                    {category.description}
                  </Text>
                </View>
                {partnerCount > 0 ? (
                  <View style={[styles.partnerBadge, { backgroundColor: colors.green }]}>
                    <Text style={styles.partnerBadgeText}>
                      {partnerCount} partner{partnerCount !== 1 ? 's' : ''}
                    </Text>
                  </View>
                ) : null}
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    marginBottom: 2,
  },
  categoryNameSelected: {
    color: '#FFFFFF',
  },
  categoryDescription: {
    fontSize: 14,
  },
  categoryDescriptionSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  partnerBadge: {
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