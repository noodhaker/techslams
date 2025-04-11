// Re-export types from mockData to have them centralized
import type { 
  User,
  Tag,
  Answer,
  Question
} from '@/data/mockData';

export type { 
  User,
  Tag,
  Answer,
  Question
};

// Additional export for Answer and Vote types for database
export interface AnswerDB {
  id: string;
  content: string;
  votes: number;
  is_best_answer: boolean;
  created_at: string;
  question_id: string;
  user_id: string;
}

export interface VoteDB {
  id: string;
  user_id: string;
  question_id?: string;
  answer_id?: string;
  vote_type: number;
  created_at: string;
}

// Profile type for database
export interface ProfileDB {
  id: string;
  updated_at?: string;
  username?: string;
  full_name?: string;
  avatar_url?: string | null;
  bio?: string | null;
  location?: string | null;
  website?: string | null;
  github?: string | null;
  reputation?: number;
  created_at?: string;
  answer_count?: number;
  best_answer_count?: number;
}
