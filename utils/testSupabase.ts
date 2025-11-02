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
    
    // Test 2: Try to fetch meetings
    console.log('Fetching meetings...');
    const { data: meetings, error: fetchError } = await supabase
      .from('meetings')
      .select('*')
      .eq('user_id', user.id);
    
    if (fetchError) {
      console.error('Fetch error:', fetchError);
    } else {
      console.log('Meetings found:', meetings?.length || 0);
      console.log('Meetings data:', meetings);
    }
    
    // Test 3: Try to insert a test meeting
    console.log('Inserting test meeting...');
    const testMeeting = {
      user_id: user.id,
      friend_id: 'test-friend-id',
      date: new Date().toISOString(),
      activity: 'test',
      venue: 'test venue',
      city: 'test city',
      notes: 'test notes',
      status: 'scheduled',
      created_at: Date.now(),
    };
    
    console.log('Test meeting data:', testMeeting);
    
    const { data: insertedMeeting, error: insertError } = await supabase
      .from('meetings')
      .insert([testMeeting])
      .select()
      .single();
    
    if (insertError) {
      console.error('Insert error:', insertError);
      console.error('Error details:', JSON.stringify(insertError, null, 2));
    } else {
      console.log('Meeting inserted successfully!');
      console.log('Inserted meeting:', insertedMeeting);
      
      // Clean up - delete the test meeting
      await supabase
        .from('meetings')
        .delete()
        .eq('id', insertedMeeting.id);
      console.log('Test meeting deleted');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
  
  console.log('=== TEST COMPLETE ===');
};