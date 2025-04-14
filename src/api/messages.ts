
import { supabase } from '@/integrations/supabase/client';
import { MessageDB } from '@/types';

/**
 * Fetch messages between two users
 */
export const fetchMessages = async (senderId: string, receiverId: string): Promise<MessageDB[]> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
    
    return data as MessageDB[];
  } catch (e) {
    console.error("Error in fetchMessages:", e);
    return [];
  }
};

/**
 * Send a message to another user
 */
export const sendMessage = async (
  senderId: string,
  receiverId: string,
  content: string
): Promise<MessageDB | null> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        content
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error sending message:', error);
      return null;
    }
    
    return data as MessageDB;
  } catch (e) {
    console.error("Error in sendMessage:", e);
    return null;
  }
};

/**
 * Delete a message by ID (admin function)
 */
export const deleteMessage = async (messageId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);
    
    if (error) {
      console.error('Error deleting message:', error);
      return false;
    }
    
    return true;
  } catch (e) {
    console.error("Error in deleteMessage:", e);
    return false;
  }
};

/**
 * Get all messages (admin function)
 */
export const getAllMessages = async (): Promise<MessageDB[]> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching all messages:', error);
      return [];
    }
    
    return data as MessageDB[];
  } catch (e) {
    console.error("Error in getAllMessages:", e);
    return [];
  }
};
