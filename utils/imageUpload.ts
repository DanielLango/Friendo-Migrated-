import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

/**
 * Upload an image to Supabase Storage
 * @param uri - Local file URI from ImagePicker
 * @param userId - User ID for organizing files
 * @returns Public URL of the uploaded image, or null if failed
 */
export const uploadProfilePicture = async (
  uri: string,
  userId: string
): Promise<string | null> => {
  try {
    console.log('Starting image upload...', uri);

    // Generate a unique filename
    const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${userId}_${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Read the file as base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Convert base64 to ArrayBuffer
    const arrayBuffer = decode(base64);

    // Determine content type
    const contentType = fileExt === 'png' ? 'image/png' : 'image/jpeg';

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('profile-pictures')
      .upload(filePath, arrayBuffer, {
        contentType,
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    console.log('Upload successful:', data);

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(filePath);

    console.log('Public URL:', urlData.publicUrl);
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};

/**
 * Delete a profile picture from Supabase Storage
 * @param url - Public URL of the image to delete
 * @returns true if successful, false otherwise
 */
export const deleteProfilePicture = async (url: string): Promise<boolean> => {
  try {
    // Extract the file path from the URL
    const urlParts = url.split('/profile-pictures/');
    if (urlParts.length < 2) {
      console.error('Invalid URL format');
      return false;
    }

    const filePath = urlParts[1];

    const { error } = await supabase.storage
      .from('profile-pictures')
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    console.log('Image deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};