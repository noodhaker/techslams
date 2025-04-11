
import { supabase } from '@/integrations/supabase/client';

// Vote on a question
export const voteOnQuestion = async (questionId: string, voteType: number): Promise<boolean> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authData.user) {
      console.error("User not authenticated", authError);
      return false;
    }

    // Check if the user has already voted
    const { data: existingVote, error: voteCheckError } = await supabase
      .from('votes')
      .select('*')
      .eq('question_id', questionId)
      .eq('user_id', authData.user.id)
      .maybeSingle();

    if (voteCheckError) {
      console.error('Error checking existing vote:', voteCheckError);
      return false;
    }

    if (existingVote) {
      // If the vote is the same, remove it (toggle off)
      if (existingVote.vote_type === voteType) {
        const { error: deleteError } = await supabase
          .from('votes')
          .delete()
          .eq('id', existingVote.id);
        
        if (deleteError) {
          console.error('Error removing vote:', deleteError);
          return false;
        }
        
        return true;
      }
      
      // If the vote is different, update it
      const { error: updateError } = await supabase
        .from('votes')
        .update({ vote_type: voteType })
        .eq('id', existingVote.id);
      
      if (updateError) {
        console.error('Error updating vote:', updateError);
        return false;
      }
      
      return true;
    }
    
    // Create a new vote
    const { error: insertError } = await supabase
      .from('votes')
      .insert({
        question_id: questionId,
        user_id: authData.user.id,
        vote_type: voteType
      });
    
    if (insertError) {
      console.error('Error adding vote:', insertError);
      return false;
    }
    
    return true;
  } catch (e) {
    console.error("Error voting on question:", e);
    return false;
  }
};

// Vote on an answer
export const voteOnAnswer = async (answerId: string, voteType: number): Promise<boolean> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authData.user) {
      console.error("User not authenticated", authError);
      return false;
    }

    // Check if the user has already voted
    const { data: existingVote, error: voteCheckError } = await supabase
      .from('votes')
      .select('*')
      .eq('answer_id', answerId)
      .eq('user_id', authData.user.id)
      .maybeSingle();

    if (voteCheckError) {
      console.error('Error checking existing vote:', voteCheckError);
      return false;
    }

    if (existingVote) {
      // If the vote is the same, remove it (toggle off)
      if (existingVote.vote_type === voteType) {
        const { error: deleteError } = await supabase
          .from('votes')
          .delete()
          .eq('id', existingVote.id);
        
        if (deleteError) {
          console.error('Error removing vote:', deleteError);
          return false;
        }
        
        return true;
      }
      
      // If the vote is different, update it
      const { error: updateError } = await supabase
        .from('votes')
        .update({ vote_type: voteType })
        .eq('id', existingVote.id);
      
      if (updateError) {
        console.error('Error updating vote:', updateError);
        return false;
      }
      
      return true;
    }
    
    // Create a new vote
    const { error: insertError } = await supabase
      .from('votes')
      .insert({
        answer_id: answerId,
        user_id: authData.user.id,
        vote_type: voteType
      });
    
    if (insertError) {
      console.error('Error adding vote:', insertError);
      return false;
    }
    
    return true;
  } catch (e) {
    console.error("Error voting on answer:", e);
    return false;
  }
};

// Get user's vote on a question
export const getUserQuestionVote = async (questionId: string): Promise<number> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authData.user) {
      return 0; // No vote if not logged in
    }

    const { data, error } = await supabase
      .from('votes')
      .select('vote_type')
      .eq('question_id', questionId)
      .eq('user_id', authData.user.id)
      .maybeSingle();

    if (error) {
      console.error('Error checking user vote:', error);
      return 0;
    }

    return data?.vote_type || 0;
  } catch (e) {
    console.error("Error getting user vote:", e);
    return 0;
  }
};

// Get user's vote on an answer
export const getUserAnswerVote = async (answerId: string): Promise<number> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authData.user) {
      return 0; // No vote if not logged in
    }

    const { data, error } = await supabase
      .from('votes')
      .select('vote_type')
      .eq('answer_id', answerId)
      .eq('user_id', authData.user.id)
      .maybeSingle();

    if (error) {
      console.error('Error checking user vote:', error);
      return 0;
    }

    return data?.vote_type || 0;
  } catch (e) {
    console.error("Error getting user vote:", e);
    return 0;
  }
};
