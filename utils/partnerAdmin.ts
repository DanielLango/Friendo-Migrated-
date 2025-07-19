// Admin utilities for managing partner venues
// This file will help you easily add partner venues when you get partnerships

import { addPartnerVenue, PartnerVenue } from './venueTypes';

// Helper function to add a new partner venue with validation
export const addNewPartner = (venueData: {
  name: string;
  category: string;
  city: string;
  address?: string;
  phone?: string;
  website?: string;
  partnershipLevel: 'basic' | 'premium' | 'featured';
  specialOffers?: string[];
  rating?: number;
  priceLevel?: number;
  isFeatured?: boolean;
}): PartnerVenue => {
  
  // Validation
  if (!venueData.name || !venueData.category || !venueData.city) {
    throw new Error('Name, category, and city are required');
  }

  const newVenue = addPartnerVenue({
    ...venueData,
    isPartner: true,
    isFeatured: venueData.isFeatured || venueData.partnershipLevel === 'featured',
  });

  console.log(`✅ Added partner venue: ${newVenue.name} in ${newVenue.city}`);
  return newVenue;
};

// Example usage for when you get your first partners:
export const addExamplePartners = () => {
  // Example: Adding Joe's Pizza in New York
  const joesPizza = addNewPartner({
    name: "Joe's Pizza",
    category: 'restaurant',
    city: 'New York, NY, USA',
    address: '123 Broadway, New York, NY 10001',
    phone: '(212) 555-0123',
    website: 'https://joespizza.com',
    partnershipLevel: 'premium',
    specialOffers: [
      '10% off for Friendo users',
      'Free drink with large pizza'
    ],
    rating: 4.5,
    priceLevel: 2,
    isFeatured: true
  });

  // Example: Adding The Local Pub in New York
  const localPub = addNewPartner({
    name: "The Local Pub",
    category: 'bar',
    city: 'New York, NY, USA',
    address: '456 Main St, New York, NY 10002',
    partnershipLevel: 'basic',
    specialOffers: ['Happy hour 4-6 PM for Friendo users'],
    rating: 4.2,
    priceLevel: 2
  });

  return [joesPizza, localPub];
};

// Batch add partners from a list (useful for CSV imports later)
export const batchAddPartners = (partnerList: Array<{
  name: string;
  category: string;
  city: string;
  address?: string;
  phone?: string;
  website?: string;
  partnershipLevel: 'basic' | 'premium' | 'featured';
  specialOffers?: string[];
  rating?: number;
  priceLevel?: number;
  isFeatured?: boolean;
}>) => {
  const addedVenues: PartnerVenue[] = [];
  
  partnerList.forEach(venueData => {
    try {
      const venue = addNewPartner(venueData);
      addedVenues.push(venue);
    } catch (error) {
      console.error(`❌ Failed to add ${venueData.name}:`, error);
    }
  });

  console.log(`✅ Successfully added ${addedVenues.length} partner venues`);
  return addedVenues;
};

// Get partnership statistics
export const getPartnershipStats = () => {
  // This would analyze the partnerVenues data structure
  // For now, just a placeholder
  return {
    totalPartners: 0,
    citiesWithPartners: 0,
    categoriesWithPartners: 0,
    featuredPartners: 0,
    premiumPartners: 0,
    basicPartners: 0
  };
};