
import { supabase } from '@/integrations/supabase/client';
import type { Question, Tag } from '@/types';

export const fetchQuestions = async (): Promise<Question[]> => {
  try {
    // Fetch questions from Supabase
    const { data: questionData, error: questionError } = await supabase
      .from('questions')
      .select(`
        *,
        question_tags(
          tag_id
        )
      `)
      .order('created_at', { ascending: false });

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

    // Get user profiles for the authors
    const userIds = [...new Set(questionData.map(q => q.user_id))];
    
    // For now, we'll use default user info since we don't have a profiles table
    // In a real app, you would fetch user profiles from a profiles table
    
    // Map database questions to our Question interface
    const questions: Question[] = questionData.map(q => {
      // Find tags for this question
      const questionTagIds = q.question_tags.map((qt: any) => qt.tag_id);
      const questionTags = tagsData
        .filter((tag: any) => questionTagIds.includes(tag.id))
        .map((tag: any) => ({
          id: tag.id,
          name: tag.name,
          count: tag.count
        }));

      return {
        id: q.id,
        title: q.title,
        content: q.content,
        votes: q.votes,
        answerCount: q.answer_count,
        views: q.views,
        hasBestAnswer: q.has_best_answer,
        createdAt: q.created_at,
        author: {
          id: q.user_id,
          name: 'User',  // Default name until we have profile data
          username: 'user', // Default username
          reputation: 1,
          avatar: null
        },
        tags: questionTags,
        answers: [] // We'll load answers separately when needed
      };
    });

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
      .select(`
        *,
        question_tags(
          tag_id
        )
      `)
      .eq('id', id)
      .single();

    if (questionError) {
      console.error('Error fetching question:', questionError);
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

    // Find tags for this question
    const questionTagIds = questionData.question_tags.map((qt: any) => qt.tag_id);
    const questionTags = tagsData
      .filter((tag: any) => questionTagIds.includes(tag.id))
      .map((tag: any) => ({
        id: tag.id,
        name: tag.name,
        count: tag.count
      }));

    // Map the database question to our Question interface
    const question: Question = {
      id: questionData.id,
      title: questionData.title,
      content: questionData.content,
      votes: questionData.votes,
      answerCount: questionData.answer_count,
      views: questionData.views,
      hasBestAnswer: questionData.has_best_answer,
      createdAt: questionData.created_at,
      author: {
        id: questionData.user_id,
        name: 'User',  // Default name until we have profile data
        username: 'user', // Default username
        reputation: 1,
        avatar: null
      },
      tags: questionTags,
      answers: [] // We'll load answers separately if needed
    };

    return question;
  } catch (e) {
    console.error("Error fetching question by ID:", e);
    return undefined;
  }
};

export const saveQuestion = async (question: Omit<Question, 'id'>): Promise<Question | null> => {
  try {
    const { user } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("User not authenticated");
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
    const validTags = savedTags.filter(tag => tag !== null) as any[];

    // 2. Save the question
    const { data: savedQuestion, error: questionError } = await supabase
      .from('questions')
      .insert({
        title: question.title,
        content: question.content,
        user_id: user.id
      })
      .select()
      .single();

    if (questionError) {
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
    return {
      id: savedQuestion.id,
      title: savedQuestion.title,
      content: savedQuestion.content,
      votes: savedQuestion.votes,
      answerCount: savedQuestion.answer_count,
      views: savedQuestion.views,
      hasBestAnswer: savedQuestion.has_best_answer,
      createdAt: savedQuestion.created_at,
      author: {
        id: user.id,
        name: user.user_metadata?.username || 'Anonymous',
        username: user.user_metadata?.username || 'anonymous',
        reputation: 1,
        avatar: null
      },
      tags: question.tags,
      answers: []
    };
  } catch (e) {
    console.error("Error saving question:", e);
    return null;
  }
};
