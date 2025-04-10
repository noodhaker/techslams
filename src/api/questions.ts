
import { supabase } from '@/integrations/supabase/client';
import type { Question, Tag } from '@/types';

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
        author: {
          id: q.user_id,
          name: 'User',  // Default name until we have profile data
          username: 'user', // Default username
          reputation: 1,
          avatar: null,
          // Add missing required fields
          role: 'User',
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
        avatar: null,
        // Add missing required fields
        role: 'User',
        joinDate: new Date().toISOString()
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
      author: {
        id: authData.user.id,
        name: authData.user.user_metadata?.username || 'Anonymous',
        username: authData.user.user_metadata?.username || 'anonymous',
        reputation: 1,
        avatar: null,
        // Add missing required fields
        role: 'User',
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
