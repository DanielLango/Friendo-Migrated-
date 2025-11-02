import { supabase } from './supabase';

/**
 * Clean up orphaned meetings (meetings without matching friends)
 */
export const cleanupOrphanedMeetings = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No user logged in');
      return { success: false, message: 'No user logged in' };
    }

    // Get all friends
    const { data: friends, error: friendsError } = await supabase
      .from('friends')
      .select('id')
      .eq('user_id', user.id);

    if (friendsError) {
      console.error('Error fetching friends:', friendsError);
      return { success: false, message: 'Failed to fetch friends' };
    }

    const friendIds = (friends || []).map(f => f.id);
    console.log('Valid friend IDs:', friendIds);

    // Get all meetings
    const { data: meetings, error: meetingsError } = await supabase
      .from('meetings')
      .select('*')
      .eq('user_id', user.id);

    if (meetingsError) {
      console.error('Error fetching meetings:', meetingsError);
      return { success: false, message: 'Failed to fetch meetings' };
    }

    console.log('Total meetings:', meetings?.length || 0);

    // Find orphaned meetings
    const orphanedMeetings = (meetings || []).filter(
      meeting => !friendIds.includes(meeting.friend_id)
    );

    console.log('Orphaned meetings:', orphanedMeetings.length);

    if (orphanedMeetings.length === 0) {
      return { 
        success: true, 
        message: 'No orphaned meetings found',
        orphanedCount: 0
      };
    }

    // Delete orphaned meetings
    const orphanedIds = orphanedMeetings.map(m => m.id);
    const { error: deleteError } = await supabase
      .from('meetings')
      .delete()
      .in('id', orphanedIds);

    if (deleteError) {
      console.error('Error deleting orphaned meetings:', deleteError);
      return { success: false, message: 'Failed to delete orphaned meetings' };
    }

    return {
      success: true,
      message: `Cleaned up ${orphanedMeetings.length} orphaned meetings`,
      orphanedCount: orphanedMeetings.length
    };
  } catch (error) {
    console.error('Error in cleanup:', error);
    return { success: false, message: 'Cleanup failed' };
  }
};

/**
 * Get diagnostic information about the database
 */
export const getDatabaseDiagnostics = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: 'No user logged in' };
    }

    // Get friends
    const { data: friends, error: friendsError } = await supabase
      .from('friends')
      .select('*')
      .eq('user_id', user.id);

    // Get meetings
    const { data: meetings, error: meetingsError } = await supabase
      .from('meetings')
      .select('*')
      .eq('user_id', user.id);

    const friendIds = (friends || []).map(f => f.id);
    const orphanedMeetings = (meetings || []).filter(
      m => !friendIds.includes(m.friend_id)
    );

    return {
      userId: user.id,
      friendsCount: friends?.length || 0,
      meetingsCount: meetings?.length || 0,
      orphanedMeetingsCount: orphanedMeetings.length,
      friends: friends || [],
      meetings: meetings || [],
      orphanedMeetings,
    };
  } catch (error) {
    console.error('Error getting diagnostics:', error);
    return { error: 'Failed to get diagnostics' };
  }
};