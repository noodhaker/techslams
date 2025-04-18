
import { supabase } from '@/integrations/supabase/client';
import { ProfileDB } from '@/types';

/**
 * Fetch a profile by ID
 */
export const fetchProfileById = async (userId: string): Promise<ProfileDB | null> => {
  try {
    // Execute a raw SQL query to get profile data
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching profile by ID:', error);
      return null;
    }
    
    return data as ProfileDB;
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
    // Execute a raw SQL query to get profile data
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error) {
      console.error('Error fetching profile by username:', error);
      return null;
    }
    
    return data as ProfileDB;
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
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('reputation', { ascending: false });
    
    if (error) {
      console.error('Error fetching all profiles:', error);
      return [];
    }
    
    return data as ProfileDB[];
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
    // Execute a raw SQL query to get top profiles
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('reputation', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching top profiles:', error);
      return [];
    }
    
    return data as ProfileDB[];
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

/**
 * Make a user an admin
 */
export const makeUserAdmin = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: true })
      .eq('id', userId);
    
    if (error) {
      console.error('Error making user admin:', error);
      return false;
    }
    
    return true;
  } catch (e) {
    console.error("Error in makeUserAdmin:", e);
    return false;
  }
};
