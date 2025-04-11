
import { supabase } from '@/integrations/supabase/client';

// Function to increment a counter in a table
export const incrementCounter = async (questionId: string): Promise<number> => {
  try {
    // Get the current value
    const { data: question, error: getError } = await supabase
      .from('questions')
      .select('answer_count')
      .eq('id', questionId)
      .single();
    
    if (getError) {
      console.error('Error getting question:', getError);
      return 0;
    }
    
    const currentCount = question?.answer_count || 0;
    const newCount = currentCount + 1;
    
    // Update the value
    const { error: updateError } = await supabase
      .from('questions')
      .update({ answer_count: newCount })
      .eq('id', questionId);
    
    if (updateError) {
      console.error('Error updating answer count:', updateError);
      return currentCount;
    }
    
    return newCount;
  } catch (e) {
    console.error("Error incrementing counter:", e);
    return 0;
  }
};
