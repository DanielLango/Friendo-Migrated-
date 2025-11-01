import { createClient } from '@supabase/supabase-js';

// Fallback to hardcoded values if environment variables aren't available
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://cgchcwqtevbybjxibamz.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnY2hjd3F0ZXZieWJqeGliYW16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMzY4ODksImV4cCI6MjA3NjgxMjg4OX0.2s1i2-cWPsjdnxcK0eijKJESp-AY08MNSWRIQSeLwKs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    },
  },
  db: {
    schema: 'public',
  },
});
