
import { questions as mockQuestions } from '@/data/mockData';
import type { Question } from '@/types';

export const fetchQuestions = async (): Promise<Question[]> => {
  // In a real app, this would make an API call to your backend
  // For now, we'll return mock data
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      resolve(mockQuestions);
    }, 500);
  });
};

export const fetchQuestionById = async (id: string): Promise<Question | undefined> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const question = mockQuestions.find(q => q.id === id);
      resolve(question);
    }, 500);
  });
};
