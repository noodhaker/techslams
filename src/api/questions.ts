
import { questions as mockQuestions } from '@/data/mockData';
import type { Question } from '@/types';

export const fetchQuestions = async (): Promise<Question[]> => {
  // In a real app, this would make an API call to your backend
  // For now, we'll return mock data from local storage or fall back to mock data
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      // Try to get questions from localStorage first
      const storedQuestions = localStorage.getItem('questions');
      if (storedQuestions) {
        try {
          resolve(JSON.parse(storedQuestions));
          return;
        } catch (e) {
          console.error("Error parsing stored questions:", e);
          // Fall back to mock data
        }
      }
      
      resolve(mockQuestions);
    }, 500);
  });
};

export const fetchQuestionById = async (id: string): Promise<Question | undefined> => {
  // Try to get questions from local storage or fall back to mock data
  const questionsToSearch = await fetchQuestions();
  
  // Find question by ID
  return new Promise((resolve) => {
    setTimeout(() => {
      const question = questionsToSearch.find(q => q.id === id);
      resolve(question);
    }, 500);
  });
};

export const saveQuestion = async (question: Question): Promise<Question> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Get existing questions
      const existingQuestionsJson = localStorage.getItem('questions');
      const existingQuestions = existingQuestionsJson 
        ? JSON.parse(existingQuestionsJson) 
        : mockQuestions;
      
      // Add new question to the beginning
      const updatedQuestions = [question, ...existingQuestions];
      
      // Save back to localStorage
      localStorage.setItem('questions', JSON.stringify(updatedQuestions));
      
      resolve(question);
    }, 500);
  });
};
