import { supabase } from '@/integrations/supabase/client';
import type { Question, Tag, Answer } from '@/types';
import { incrementCounter } from './increment';

export const fetchQuestions = async (): Promise<Question[]> => {
  try {
    // Fetch questions from Supabase
    const { data: questionData, error: questionError } = await supabase
      .from('questions')
      .select('*');

    if (questionError) {
      console.error('Error fetching questions:', questionError);
      return [];
    }

    // Fetch all tags
    const { data: tagsData, error: tagsError } = await supabase
      .from('tags')
      .select('*');

    if (tagsError) {
      console.error('Error fetching tags:', tagsError);
      return [];
    }

    // Fetch question_tags relationships
    const { data: questionTagsData, error: questionTagsError } = await supabase
      .from('question_tags')
      .select('*');

    if (questionTagsError) {
      console.error('Error fetching question_tags:', questionTagsError);
      return [];
    }

    // Map database questions to our Question interface
    const questions: Question[] = questionData?.map(q => {
      // Find tags for this question
      const questionTagIds = questionTagsData
        ?.filter(qt => qt.question_id === q.id)
        ?.map(qt => qt.tag_id) || [];
      
      const questionTags = tagsData
        ?.filter(tag => questionTagIds.includes(tag.id))
        ?.map(tag => ({
          id: tag.id,
          name: tag.name,
          count: tag.count
        })) || [];

      return {
        id: q.id,
        title: q.title,
        content: q.content,
        votes: q.votes,
        answerCount: q.answer_count,
        views: q.views,
        hasBestAnswer: q.has_best_answer,
        createdAt: q.created_at,
        authorId: q.user_id,
        author: {
          id: q.user_id,
          name: 'User',  // Default name until we have profile data
          username: 'user', // Default username
          reputation: 1,
          avatar: null,
          role: 'user' as 'user',
          joinDate: new Date().toISOString()
        },
        tags: questionTags,
        answers: []
      };
    }) || [];

    return questions;
  } catch (e) {
    console.error("Error fetching questions:", e);
    return [];
  }
};

export const fetchQuestionById = async (id: string): Promise<Question | undefined> => {
  try {
    // Fetch the question with the given ID
    const { data: questionData, error: questionError } = await supabase
      .from('questions')
      .select('*')
      .eq('id', id)
      .single();

    if (questionError) {
      console.error('Error fetching question:', questionError);
      return undefined;
    }

    // Fetch tags for this question
    const { data: questionTagsData, error: questionTagsError } = await supabase
      .from('question_tags')
      .select('*')
      .eq('question_id', id);

    if (questionTagsError) {
      console.error('Error fetching question tags:', questionTagsError);
      return undefined;
    }

    // Fetch all tags
    const { data: tagsData, error: tagsError } = await supabase
      .from('tags')
      .select('*');

    if (tagsError) {
      console.error('Error fetching tags:', tagsError);
      return undefined;
    }

    // Fetch answers for this question
    const { data: answersData, error: answersError } = await supabase
      .from('answers')
      .select('*')
      .eq('question_id', id);

    if (answersError) {
      console.error('Error fetching answers:', answersError);
      // We'll continue and show the question without answers
    }

    if (!questionData) {
      return undefined;
    }

    // Find tags for this question
    const questionTagIds = questionTagsData
      ?.map(qt => qt.tag_id) || [];
    
    const questionTags = tagsData
      ?.filter(tag => questionTagIds.includes(tag.id))
      ?.map(tag => ({
        id: tag.id,
        name: tag.name,
        count: tag.count
      })) || [];

    // Process answers if we have any
    const answers: Answer[] = answersData?.map(answer => ({
      id: answer.id,
      content: answer.content,
      isBestAnswer: answer.is_best_answer,
      votes: answer.votes,
      createdAt: answer.created_at,
      questionId: answer.question_id,
      authorId: answer.user_id,
      author: {
        id: answer.user_id,
        name: 'User', // Default until we add user profiles
        username: 'user',
        reputation: 1,
        avatar: null,
        role: 'user' as 'user',
        joinDate: new Date().toISOString()
      }
    })) || [];

    // Map the database question to our Question interface
    const question: Question = {
      id: questionData.id,
      title: questionData.title,
      content: questionData.content,
      votes: questionData.votes,
      answerCount: questionData.answer_count || 0,
      views: questionData.views,
      hasBestAnswer: questionData.has_best_answer,
      createdAt: questionData.created_at,
      authorId: questionData.user_id,
      author: {
        id: questionData.user_id,
        name: 'User',  // Default name until we have profile data
        username: 'user', // Default username
        reputation: 1,
        avatar: null,
        role: 'user' as 'user',
        joinDate: new Date().toISOString()
      },
      tags: questionTags,
      answers: answers
    };

    return question;
  } catch (e) {
    console.error("Error fetching question by ID:", e);
    return undefined;
  }
};

export const saveQuestion = async (question: Omit<Question, 'id'>): Promise<Question | null> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authData.user) {
      console.error("User not authenticated", authError);
      return null;
    }

    // 1. First, save the tags if they don't exist
    const tagInsertPromises = question.tags.map(async (tag) => {
      // Use upsert to insert if not exists or update the count if it does
      const { data, error } = await supabase
        .from('tags')
        .upsert(
          { name: tag.name, count: 1 },
          { onConflict: 'name', ignoreDuplicates: false }
        )
        .select();

      if (error) {
        console.error('Error upserting tag:', error);
        return null;
      }
      
      return data?.[0] || null;
    });

    const savedTags = await Promise.all(tagInsertPromises);
    const validTags = savedTags.filter(tag => tag !== null);

    // 2. Save the question
    const { data: savedQuestion, error: questionError } = await supabase
      .from('questions')
      .insert({
        title: question.title,
        content: question.content,
        user_id: authData.user.id
      })
      .select()
      .single();

    if (questionError || !savedQuestion) {
      console.error('Error saving question:', questionError);
      return null;
    }

    // 3. Create the question_tags relationships
    if (validTags.length > 0) {
      const questionTagsToInsert = validTags.map(tag => ({
        question_id: savedQuestion.id,
        tag_id: tag.id
      }));

      const { error: relationshipError } = await supabase
        .from('question_tags')
        .insert(questionTagsToInsert);

      if (relationshipError) {
        console.error('Error saving question_tags relationships:', relationshipError);
      }
    }

    // 4. Return the complete question object 
    const newQuestion: Question = {
      id: savedQuestion.id,
      title: savedQuestion.title,
      content: savedQuestion.content,
      votes: savedQuestion.votes || 0,
      answerCount: savedQuestion.answer_count || 0,
      views: savedQuestion.views || 0,
      hasBestAnswer: savedQuestion.has_best_answer || false,
      createdAt: savedQuestion.created_at,
      authorId: authData.user.id,
      author: {
        id: authData.user.id,
        name: authData.user.user_metadata?.username || 'Anonymous',
        username: authData.user.user_metadata?.username || 'anonymous',
        reputation: 1,
        avatar: null,
        role: 'user' as 'user',
        joinDate: new Date().toISOString()
      },
      tags: question.tags,
      answers: []
    };

    return newQuestion;
  } catch (e) {
    console.error("Error saving question:", e);
    return null;
  }
};

export const updateQuestion = async (id: string, updates: Partial<Question>): Promise<Question | null> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authData.user) {
      console.error("User not authenticated", authError);
      return null;
    }

    // 1. Update the question
    const { data: updatedQuestion, error: questionError } = await supabase
      .from('questions')
      .update({
        title: updates.title,
        content: updates.content,
      })
      .eq('id', id)
      .eq('user_id', authData.user.id) // Make sure the user owns the question
      .select()
      .single();

    if (questionError || !updatedQuestion) {
      console.error('Error updating question:', questionError);
      return null;
    }

    // 2. If tags are being updated, handle that
    if (updates.tags) {
      // First, get existing tags for the question
      const { data: existingQuestionTags, error: getTagsError } = await supabase
        .from('question_tags')
        .select('*')
        .eq('question_id', id);

      if (getTagsError) {
        console.error('Error getting existing question tags:', getTagsError);
      } else {
        // Delete existing relationships
        const { error: deleteError } = await supabase
          .from('question_tags')
          .delete()
          .eq('question_id', id);

        if (deleteError) {
          console.error('Error deleting existing question tags:', deleteError);
        }

        // Save new tags
        const tagInsertPromises = updates.tags.map(async (tag) => {
          const { data, error } = await supabase
            .from('tags')
            .upsert(
              { name: tag.name, count: 1 },
              { onConflict: 'name', ignoreDuplicates: false }
            )
            .select();

          if (error) {
            console.error('Error upserting tag during update:', error);
            return null;
          }
          
          return data?.[0] || null;
        });

        const savedTags = await Promise.all(tagInsertPromises);
        const validTags = savedTags.filter(tag => tag !== null);

        // Create new tag relationships
        if (validTags.length > 0) {
          const questionTagsToInsert = validTags.map(tag => ({
            question_id: id,
            tag_id: tag.id
          }));

          const { error: relationshipError } = await supabase
            .from('question_tags')
            .insert(questionTagsToInsert);

          if (relationshipError) {
            console.error('Error saving updated question_tags relationships:', relationshipError);
          }
        }
      }
    }

    // 3. Get the full updated question with tags
    return fetchQuestionById(id) || null;
  } catch (e) {
    console.error("Error updating question:", e);
    return null;
  }
};

export const deleteQuestion = async (id: string): Promise<boolean> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authData.user) {
      console.error("User not authenticated", authError);
      return false;
    }

    // Delete the question - related tags and answers will be cascade deleted
    const { error: deleteError } = await supabase
      .from('questions')
      .delete()
      .eq('id', id)
      .eq('user_id', authData.user.id); // Make sure the user owns the question

    if (deleteError) {
      console.error('Error deleting question:', deleteError);
      return false;
    }

    return true;
  } catch (e) {
    console.error("Error deleting question:", e);
    return false;
  }
};

export const addAnswer = async (questionId: string, content: string): Promise<Answer | null> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authData.user) {
      console.error("User not authenticated", authError);
      return null;
    }

    // 1. Save the answer
    const { data: savedAnswer, error: answerError } = await supabase
      .from('answers')
      .insert({
        content: content,
        question_id: questionId,
        user_id: authData.user.id
      })
      .select()
      .single();

    if (answerError || !savedAnswer) {
      console.error('Error saving answer:', answerError);
      return null;
    }

    // 2. Update the answer count on the question
    await incrementCounter(questionId);

    // 3. Return the answer object
    const answer: Answer = {
      id: savedAnswer.id,
      content: savedAnswer.content,
      isBestAnswer: savedAnswer.is_best_answer || false,
      votes: savedAnswer.votes || 0,
      createdAt: savedAnswer.created_at,
      questionId: savedAnswer.question_id,
      authorId: authData.user.id,
      author: {
        id: authData.user.id,
        name: authData.user.user_metadata?.username || 'Anonymous',
        username: authData.user.user_metadata?.username || 'anonymous',
        reputation: 1,
        avatar: null,
        role: 'user' as 'user',
        joinDate: new Date().toISOString()
      }
    };

    return answer;
  } catch (e) {
    console.error("Error adding answer:", e);
    return null;
  }
};

export const markBestAnswer = async (questionId: string, answerId: string): Promise<boolean> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authData.user) {
      console.error("User not authenticated", authError);
      return false;
    }

    // 1. First verify the user owns the question
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select('user_id')
      .eq('id', questionId)
      .single();

    if (questionError || !question) {
      console.error('Error fetching question:', questionError);
      return false;
    }

    if (question.user_id !== authData.user.id) {
      console.error('User does not own this question');
      return false;
    }

    // 2. Mark the question as having a best answer
    const { error: questionUpdateError } = await supabase
      .from('questions')
      .update({ has_best_answer: true })
      .eq('id', questionId);

    if (questionUpdateError) {
      console.error('Error updating question has_best_answer:', questionUpdateError);
      return false;
    }

    // 3. Reset all answers for this question to not be best
    const { error: resetError } = await supabase
      .from('answers')
      .update({ is_best_answer: false })
      .eq('question_id', questionId);

    if (resetError) {
      console.error('Error resetting best answers:', resetError);
      return false;
    }

    // 4. Mark the selected answer as best
    const { error: answerUpdateError } = await supabase
      .from('answers')
      .update({ is_best_answer: true })
      .eq('id', answerId)
      .eq('question_id', questionId);

    if (answerUpdateError) {
      console.error('Error marking best answer:', answerUpdateError);
      return false;
    }

    return true;
  } catch (e) {
    console.error("Error marking best answer:", e);
    return false;
  }
};
