import { supabase } from './supabase';

export const testSupabaseConnection = async () => {
  console.log('=== TESTING SUPABASE CONNECTION ===');
  
  try {
    // Test 1: Check if we can connect
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('Current user:', user?.id);
    
    if (userError) {
      console.error('User error:', userError);
      return;
    }
    
    if (!user) {
      console.error('No user logged in!');
      return;
    }
    
    // Test 2: Try to fetch friends
    console.log('Fetching friends...');
    const { data: friends, error: friendsError } = await supabase
      .from('friends')
      .select('*')
      .eq('user_id', user.id);
    
    if (friendsError) {
      console.error('Friends fetch error:', friendsError);
    } else {
      console.log('Friends found:', friends?.length || 0);
      console.log('Friends data:', JSON.stringify(friends, null, 2));
    }
    
    // Test 3: Try to fetch meetings
    console.log('Fetching meetings...');
    const { data: meetings, error: meetingsError } = await supabase
      .from('meetings')
      .select('*')
      .eq('user_id', user.id);
    
    if (meetingsError) {
      console.error('Meetings fetch error:', meetingsError);
    } else {
      console.log('Meetings found:', meetings?.length || 0);
      console.log('Meetings data:', JSON.stringify(meetings, null, 2));
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
  
  console.log('=== TEST COMPLETE ===');
};
