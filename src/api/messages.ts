
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
      .or(`sender_id.eq.${senderId},receiver_id.eq.${receiverId},sender_id.eq.${receiverId},receiver_id.eq.${senderId}`)
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
