export interface Question {
  id: string;
  type: "true-false" | "multiple-choice";
  text: string;
  choices: string[];
  correctAnswer: number;
  timeLimit: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  created_by: string;
  created_at: string;
  questions: Question[];
  shuffle_questions: boolean;
  shuffle_choices: boolean;
}

export interface Group {
  id: string;
  quiz_id: string;
  group_name: string;
  members: string[];
  joined_at: string;
  score: number;
  last_activity: string;
  saint_name?: string;
  saint_image?: string;
}

export interface GameState {
  quiz_id: string;
  current_question_index: number;
  is_active: boolean;
  started_at: string | null;
  question_start_time: string | null;
  show_results: boolean;
  show_question_only: boolean;
  current_question_time_limit?: number;
  shuffled_questions?: Question[];
}

export interface QuizResponse {
  id: string;
  quiz_id: string;
  group_id: string;
  question_index: number;
  choice_index: number;
  is_correct: boolean;
  time_taken: number;
  created_at: string;
}

export interface LeaderboardEntry {
  groupId: string;
  groupName: string;
  score: number;
  members: string[];
  saintName?: string;
  saintImage?: string;
}

export interface Saint {
  name: string;
  src: string;
}
