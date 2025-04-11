import { supabase } from '@/integrations/supabase/client';
import { ProfileDB } from '@/types';

/**
 * Fetch a profile by ID
 */
export const fetchProfileById = async (userId: string): Promise<ProfileDB | null> => {
  try {
    // Execute a query to get profile data with answer counts
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        answer_count:answers!profiles_id_fkey(count),
        best_answer_count:answers!profiles_id_fkey(count)
      `)
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching profile by ID:', error);
      
      // If the error was due to the count query, try a simpler query without counts
      const { data: simpleData, error: simpleError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (simpleError) {
        console.error('Error in simple profile fetch:', simpleError);
        return null;
      }
      
      return simpleData as ProfileDB;
    }
    
    // Get the answer count separately to avoid RLS issues
    const { count: answerCount } = await supabase
      .from('answers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
      
    // Get the best answer count separately
    const { count: bestAnswerCount } = await supabase
      .from('answers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_best_answer', true);
    
    return {
      ...data,
      answer_count: answerCount || 0,
      best_answer_count: bestAnswerCount || 0
    } as ProfileDB;
  } catch (e) {
    console.error("Error in fetchProfileById:", e);
    return null;
  }
};

/**
 * Fetch a profile by username
 */
export const fetchProfileByUsername = async (username: string): Promise<ProfileDB | null> => {
  try {
    // Execute a query to get profile data
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error) {
      console.error('Error fetching profile by username:', error);
      return null;
    }
    
    // Get the answer count separately
    const { count: answerCount } = await supabase
      .from('answers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', data.id);
      
    // Get the best answer count separately
    const { count: bestAnswerCount } = await supabase
      .from('answers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', data.id)
      .eq('is_best_answer', true);
    
    return {
      ...data,
      answer_count: answerCount || 0,
      best_answer_count: bestAnswerCount || 0
    } as ProfileDB;
  } catch (e) {
    console.error("Error in fetchProfileByUsername:", e);
    return null;
  }
};

/**
 * Fetch all profiles
 */
export const fetchAllProfiles = async (): Promise<ProfileDB[]> => {
  try {
    // Execute a query to get all profiles
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('reputation', { ascending: false });
    
    if (error) {
      console.error('Error fetching all profiles:', error);
      return [];
    }
    
    // For each profile, get the answer and best answer counts
    const profilesWithCounts = await Promise.all(
      data.map(async (profile) => {
        const { count: answerCount } = await supabase
          .from('answers')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile.id);
          
        const { count: bestAnswerCount } = await supabase
          .from('answers')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile.id)
          .eq('is_best_answer', true);
        
        return {
          ...profile,
          answer_count: answerCount || 0,
          best_answer_count: bestAnswerCount || 0
        };
      })
    );
    
    return profilesWithCounts as ProfileDB[];
  } catch (e) {
    console.error("Error in fetchAllProfiles:", e);
    return [];
  }
};

/**
 * Fetch top profiles by reputation
 */
export const fetchTopProfiles = async (limit: number = 5): Promise<ProfileDB[]> => {
  try {
    // Execute a query to get top profiles
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('reputation', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching top profiles:', error);
      return [];
    }
    
    // For each profile, get the answer and best answer counts
    const profilesWithCounts = await Promise.all(
      data.map(async (profile) => {
        const { count: answerCount } = await supabase
          .from('answers')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile.id);
          
        const { count: bestAnswerCount } = await supabase
          .from('answers')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile.id)
          .eq('is_best_answer', true);
        
        return {
          ...profile,
          answer_count: answerCount || 0,
          best_answer_count: bestAnswerCount || 0
        };
      })
    );
    
    return profilesWithCounts as ProfileDB[];
  } catch (e) {
    console.error("Error in fetchTopProfiles:", e);
    return [];
  }
};

/**
 * Update a profile
 */
export const updateProfile = async (
  userId: string, 
  updates: Partial<ProfileDB>
): Promise<ProfileDB | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating profile:', error);
      return null;
    }
    
    return data as ProfileDB;
  } catch (e) {
    console.error("Error in updateProfile:", e);
    return null;
  }
};
