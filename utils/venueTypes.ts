import { fetchPartnerVenues as fetchFromSupabase } from './adminVenueManager';

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

// Cache for partner venues to avoid repeated API calls
let venueCache: { [key: string]: { data: PartnerVenue[], timestamp: number } } = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to get partner venues for a city and category
export const getPartnerVenues = async (city: string, categoryId: string): Promise<PartnerVenue[]> => {
  const cacheKey = `${city}-${categoryId}`;
  const now = Date.now();
  
  // Check cache first
  if (venueCache[cacheKey] && (now - venueCache[cacheKey].timestamp) < CACHE_DURATION) {
    return venueCache[cacheKey].data;
  }
  
  try {
    // Fetch from Supabase
    const supabaseVenues = await fetchFromSupabase(city, categoryId);
    
    // Transform to match PartnerVenue interface
    const venues: PartnerVenue[] = supabaseVenues.map(v => ({
      id: v.id,
      name: v.name,
      category: v.category,
      city: v.city,
      address: v.address,
      phone: v.phone,
      website: v.website,
      isPartner: v.is_partner,
      isFeatured: v.is_featured,
      partnershipLevel: v.partnership_level,
      specialOffers: v.special_offers || undefined,
      rating: v.rating || undefined,
      priceLevel: v.price_level || undefined,
      addedDate: v.created_at,
    }));
    
    // Update cache
    venueCache[cacheKey] = { data: venues, timestamp: now };
    
    return venues;
  } catch (error) {
    console.error('Error fetching partner venues:', error);
    return [];
  }
};

// Clear cache (useful for admin updates)
export const clearVenueCache = () => {
  venueCache = {};
};

// Get venue category by ID
export const getVenueCategory = (categoryId: string): VenueCategory | undefined => {
  return venueCategories.find(category => category.id === categoryId);
};