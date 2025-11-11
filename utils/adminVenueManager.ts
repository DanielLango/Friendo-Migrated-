import { supabase } from './supabase';

export interface VenueFormData {
  name: string;
  category: string;
  city: string;
  address?: string;
  phone?: string;
  website?: string;
  partnershipLevel: 'basic' | 'premium' | 'featured';
  specialOffers: string[];
  rating?: number;
  priceLevel?: number;
  isFeatured: boolean;
  displayOrder: number;
}

export interface PartnerVenue {
  id: string;
  name: string;
  category: string;
  city: string;
  address?: string;
  phone?: string;
  website?: string;
  is_partner: boolean;
  is_featured: boolean;
  partnership_level: 'basic' | 'premium' | 'featured';
  special_offers?: string[];
  rating?: number;
  price_level?: number;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Add a new partner venue
export const addPartnerVenue = async (venueData: VenueFormData) => {
  try {
    const { data, error } = await supabase
      .from('partner_venues')
      .insert([{
        name: venueData.name,
        category: venueData.category,
        city: venueData.city,
        address: venueData.address || null,
        phone: venueData.phone || null,
        website: venueData.website || null,
        partnership_level: venueData.partnershipLevel,
        special_offers: venueData.specialOffers.length > 0 ? venueData.specialOffers : null,
        rating: venueData.rating || null,
        price_level: venueData.priceLevel || null,
        is_featured: venueData.isFeatured,
        display_order: venueData.displayOrder,
        is_partner: true,
        is_active: true,
      }])
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Successfully added venue:', data.name);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error adding venue:', error);
    return { success: false, error };
  }
};

// Get all partner venues (for admin view)
export const getAllPartnerVenues = async () => {
  try {
    const { data, error } = await supabase
      .from('partner_venues')
      .select('*')
      .order('city', { ascending: true })
      .order('category', { ascending: true })
      .order('display_order', { ascending: true });

    if (error) throw error;

    return { success: true, data: data as PartnerVenue[] };
  } catch (error) {
    console.error('❌ Error fetching venues:', error);
    return { success: false, error, data: [] };
  }
};

// Update a venue
export const updatePartnerVenue = async (venueId: string, updates: Partial<VenueFormData>) => {
  try {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (updates.name) updateData.name = updates.name;
    if (updates.category) updateData.category = updates.category;
    if (updates.city) updateData.city = updates.city;
    if (updates.address !== undefined) updateData.address = updates.address || null;
    if (updates.phone !== undefined) updateData.phone = updates.phone || null;
    if (updates.website !== undefined) updateData.website = updates.website || null;
    if (updates.partnershipLevel) updateData.partnership_level = updates.partnershipLevel;
    if (updates.specialOffers !== undefined) updateData.special_offers = updates.specialOffers.length > 0 ? updates.specialOffers : null;
    if (updates.rating !== undefined) updateData.rating = updates.rating || null;
    if (updates.priceLevel !== undefined) updateData.price_level = updates.priceLevel || null;
    if (updates.isFeatured !== undefined) updateData.is_featured = updates.isFeatured;
    if (updates.displayOrder !== undefined) updateData.display_order = updates.displayOrder;

    const { data, error } = await supabase
      .from('partner_venues')
      .update(updateData)
      .eq('id', venueId)
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Successfully updated venue:', data.name);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error updating venue:', error);
    return { success: false, error };
  }
};

// Delete a venue (soft delete)
export const deletePartnerVenue = async (venueId: string) => {
  try {
    const { error } = await supabase
      .from('partner_venues')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', venueId);

    if (error) throw error;

    console.log('✅ Successfully deleted venue');
    return { success: true };
  } catch (error) {
    console.error('❌ Error deleting venue:', error);
    return { success: false, error };
  }
};

// Get venue count by city and category
export const getVenueStats = async () => {
  try {
    const { data, error } = await supabase
      .from('partner_venues')
      .select('city, category')
      .eq('is_active', true);

    if (error) throw error;

    const stats: { [key: string]: { [key: string]: number } } = {};
    
    data.forEach(venue => {
      if (!stats[venue.city]) {
        stats[venue.city] = {};
      }
      if (!stats[venue.city][venue.category]) {
        stats[venue.city][venue.category] = 0;
      }
      stats[venue.city][venue.category]++;
    });

    return { success: true, stats };
  } catch (error) {
    console.error('❌ Error getting stats:', error);
    return { success: false, stats: {} };
  }
};

// Fetch partner venues for a specific city and category (for users)
export const fetchPartnerVenues = async (
  city: string, 
  categoryId: string
): Promise<PartnerVenue[]> => {
  try {
    const { data, error } = await supabase
      .from('partner_venues')
      .select('*')
      .eq('city', city)
      .eq('category', categoryId)
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('display_order', { ascending: true })
      .limit(3); // Only get top 3 venues

    if (error) throw error;

    return data as PartnerVenue[];
  } catch (error) {
    console.error('Error fetching partner venues:', error);
    return [];
  }
};