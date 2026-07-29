export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  institution: string | null;
  major: string | null;
  year: string | null;
  study_streak: number;
  total_study_minutes: number;
  productivity_score: number;
  preferences: ProfilePreferences;
  created_at: string;
  updated_at: string;
}

export interface ProfilePreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  weeklyGoal: number;
  emailUpdates: boolean;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  subject: string | null;
  source_filename: string | null;
  content: string | null;
  summary: string | null;
  key_points: string[] | null;
  status: 'draft' | 'processing' | 'summarized' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  user_id: string;
  title: string;
  subject: string | null;
  description: string | null;
  questions: QuizQuestion[];
  difficulty: 'easy' | 'medium' | 'hard';
  status: string;
  score: number | null;
  total_questions: number;
  created_at: string;
  updated_at: string;
}

export interface PlannerTask {
  id: string;
  user_id: string;
  title: string;
  subject: string | null;
  description: string | null;
  scheduled_date: string;
  start_time: string | null;
  duration_minutes: number;
  priority: 'low' | 'medium' | 'high';
  status: 'planned' | 'in-progress' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface ChatConversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface StudyLog {
  id: string;
  user_id: string;
  log_date: string;
  subject: string;
  minutes: number;
  created_at: string;
}

export interface Activity {
  id: string;
  user_id: string;
  type: string;
  title: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Exam {
  id: string;
  user_id: string;
  title: string;
  subject: string;
  exam_date: string;
  notes: string | null;
  created_at: string;
}
