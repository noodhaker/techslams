
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
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  github: string | null;
  reputation: number | null;
  created_at: string | null;
  updated_at: string | null;
}
