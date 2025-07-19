// Core venue categories for the business model
export interface VenueCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface PartnerVenue {
  id: string;
  name: string;
  category: string;
  city: string;
  address?: string;
  phone?: string;
  website?: string;
  isPartner: boolean;
  isFeatured: boolean;
  partnershipLevel: 'basic' | 'premium' | 'featured';
  specialOffers?: string[];
  rating?: number;
  priceLevel?: number;
  addedDate: string;
}

// Main venue categories for user selection
export const venueCategories: VenueCategory[] = [
  {
    id: 'restaurant',
    name: 'Restaurant',
    icon: '🍽️',
    description: 'Dining and meals'
  },
  {
    id: 'bar',
    name: 'Bar/Pub',
    icon: '🍺',
    description: 'Drinks and nightlife'
  },
  {
    id: 'cafe',
    name: 'Café',
    icon: '☕',
    description: 'Coffee and light meals'
  },
  {
    id: 'park',
    name: 'Park',
    icon: '🌳',
    description: 'Outdoor activities'
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    icon: '🎬',
    description: 'Movies, shows, activities'
  },
  {
    id: 'shopping',
    name: 'Shopping',
    icon: '🛍️',
    description: 'Retail and markets'
  },
  {
    id: 'sports',
    name: 'Sports/Fitness',
    icon: '⚽',
    description: 'Gyms, sports venues'
  },
  {
    id: 'culture',
    name: 'Culture',
    icon: '🏛️',
    description: 'Museums, galleries, libraries'
  }
];

// Partnership-ready venue database
// This will be empty initially, but ready for partner venues
export const partnerVenues: { [cityId: string]: { [categoryId: string]: PartnerVenue[] } } = {
  // Example structure for when you add partners:
  // 'new-york-ny-usa': {
  //   'restaurant': [
  //     {
  //       id: 'joes-pizza-nyc',
  //       name: 'Joe\'s Pizza',
  //       category: 'restaurant',
  //       city: 'New York, NY, USA',
  //       address: '123 Main St, New York, NY',
  //       isPartner: true,
  //       isFeatured: true,
  //       partnershipLevel: 'premium',
  //       specialOffers: ['10% off for Friendo users', 'Free appetizer with main course'],
  //       rating: 4.5,
  //       priceLevel: 2,
  //       addedDate: '2024-01-15'
  //     }
  //   ]
  // }
};

// Helper function to get partner venues for a city and category
export const getPartnerVenues = (city: string, categoryId: string): PartnerVenue[] => {
  const cityKey = city.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const cityVenues = partnerVenues[cityKey];
  
  if (cityVenues && cityVenues[categoryId]) {
    return cityVenues[categoryId].sort((a, b) => {
      // Sort by partnership level and featured status
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      if (a.partnershipLevel === 'featured' && b.partnershipLevel !== 'featured') return -1;
      if (a.partnershipLevel !== 'featured' && b.partnershipLevel === 'featured') return 1;
      return 0;
    });
  }
  
  return [];
};

// Helper function to add a new partner venue (for future admin use)
export const addPartnerVenue = (venue: Omit<PartnerVenue, 'id' | 'addedDate'>): PartnerVenue => {
  const cityKey = venue.city.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const venueId = `${venue.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${cityKey}`;
  
  const newVenue: PartnerVenue = {
    ...venue,
    id: venueId,
    addedDate: new Date().toISOString()
  };
  
  // Initialize city and category if they don't exist
  if (!partnerVenues[cityKey]) {
    partnerVenues[cityKey] = {};
  }
  if (!partnerVenues[cityKey][venue.category]) {
    partnerVenues[cityKey][venue.category] = [];
  }
  
  partnerVenues[cityKey][venue.category].push(newVenue);
  return newVenue;
};

// Get venue category by ID
export const getVenueCategory = (categoryId: string): VenueCategory | undefined => {
  return venueCategories.find(category => category.id === categoryId);
};