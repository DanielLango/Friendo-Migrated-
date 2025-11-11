import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { addPartnerVenue } from '../utils/adminVenueManager';
import SimpleCitySelector from '../components/SimpleCitySelector';
import VenueCategorySelector from '../components/VenueCategorySelector';
import { useTheme } from '../utils/themeContext';

export default function AdminAddVenueScreen() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [partnershipLevel, setPartnershipLevel] = useState<'basic' | 'premium' | 'featured'>('basic');
  const [specialOffer1, setSpecialOffer1] = useState('');
  const [specialOffer2, setSpecialOffer2] = useState('');
  const [rating, setRating] = useState('');
  const [priceLevel, setPriceLevel] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [displayOrder, setDisplayOrder] = useState('0');
  const [saving, setSaving] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();
  const onSuccess = (route.params as any)?.onSuccess;

  const handleSave = async () => {
    // Validation
    if (!name || !category || !city) {
      Alert.alert('Error', 'Please fill in all required fields (Name, Category, City)');
      return;
    }

    setSaving(true);

    const specialOffers = [specialOffer1, specialOffer2].filter(offer => offer.trim() !== '');

    const venueData = {
      name,
      category,
      city,
      address: address || undefined,
      phone: phone || undefined,
      website: website || undefined,
      partnershipLevel,
      specialOffers,
      rating: rating ? parseFloat(rating) : undefined,
      priceLevel: priceLevel ? parseInt(priceLevel) : undefined,
      isFeatured,
      displayOrder: parseInt(displayOrder) || 0,
    };

    const result = await addPartnerVenue(venueData);

    setSaving(false);

    if (result.success) {
      Alert.alert('Success', 'Partner venue added successfully!', [
        {
          text: 'OK',
          onPress: () => {
            if (onSuccess) onSuccess();
            navigation.goBack();
          },
        },
      ]);
    } else {
      Alert.alert('Error', 'Failed to add venue. Please try again.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.purple} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Add Partner Venue</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Required Fields */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Required Information</Text>
          
          <Text style={[styles.label, { color: colors.textSecondary }]}>Venue Name *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
            placeholder="e.g., Joe's Pizza"
            placeholderTextColor={colors.textTertiary}
            value={name}
            onChangeText={setName}
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>City *</Text>
          <SimpleCitySelector
            selectedCity={city}
            onCitySelect={(selectedCity) => setCity(selectedCity)}
            placeholder="Select a city..."
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>Category *</Text>
          <VenueCategorySelector
            selectedCategory={category}
            onCategorySelect={setCategory}
            selectedCity={city || 'New York, NY, USA'}
          />
        </View>

        {/* Optional Fields */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Optional Information</Text>
          
          <Text style={[styles.label, { color: colors.textSecondary }]}>Address</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
            placeholder="123 Main St, City, State ZIP"
            placeholderTextColor={colors.textTertiary}
            value={address}
            onChangeText={setAddress}
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>Phone</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
            placeholder="(555) 123-4567"
            placeholderTextColor={colors.textTertiary}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>Website</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
            placeholder="https://example.com"
            placeholderTextColor={colors.textTertiary}
            value={website}
            onChangeText={setWebsite}
            keyboardType="url"
            autoCapitalize="none"
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>Rating (1-5)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
            placeholder="4.5"
            placeholderTextColor={colors.textTertiary}
            value={rating}
            onChangeText={setRating}
            keyboardType="decimal-pad"
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>Price Level (1-4)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
            placeholder="2"
            placeholderTextColor={colors.textTertiary}
            value={priceLevel}
            onChangeText={setPriceLevel}
            keyboardType="number-pad"
          />
        </View>

        {/* Partnership Details */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Partnership Details</Text>
          
          <Text style={[styles.label, { color: colors.textSecondary }]}>Partnership Level</Text>
          <View style={styles.levelButtons}>
            {(['basic', 'premium', 'featured'] as const).map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.levelButton,
                  { borderColor: colors.border },
                  partnershipLevel === level && { backgroundColor: colors.purple, borderColor: colors.purple }
                ]}
                onPress={() => setPartnershipLevel(level)}
              >
                <Text style={[
                  styles.levelButtonText,
                  { color: colors.text },
                  partnershipLevel === level && { color: '#FFFFFF' }
                ]}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.switchRow}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Featured Venue</Text>
            <Switch
              value={isFeatured}
              onValueChange={setIsFeatured}
              trackColor={{ false: colors.border, true: colors.purple }}
              thumbColor={colors.white}
            />
          </View>

          <Text style={[styles.label, { color: colors.textSecondary }]}>Display Order</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
            placeholder="0 (lower numbers appear first)"
            placeholderTextColor={colors.textTertiary}
            value={displayOrder}
            onChangeText={setDisplayOrder}
            keyboardType="number-pad"
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>Special Offer 1</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
            placeholder="e.g., 10% off for Friendo users"
            placeholderTextColor={colors.textTertiary}
            value={specialOffer1}
            onChangeText={setSpecialOffer1}
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>Special Offer 2</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
            placeholder="e.g., Free drink with meal"
            placeholderTextColor={colors.textTertiary}
            value={specialOffer2}
            onChangeText={setSpecialOffer2}
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.green }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Add Partner Venue'}
          </Text>
        </TouchableOpacity>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 20,
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  levelButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  levelButton: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  levelButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 10,
  },
  saveButton: {
    marginHorizontal: 20,
    marginVertical: 30,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});