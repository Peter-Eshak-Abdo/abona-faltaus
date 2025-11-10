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
  createdBy: string;
  createdAt: Date;
  questions: Question[];
  isActive: boolean;
  shuffleQuestions: boolean;
  shuffleChoices: boolean;
}

export interface Group {
  id: string;
  groupName: string;
  members: string[];
  joinedAt: Date;
  score: number;
  lastActivity: Date;
  saintName?: string;
  saintImage?: string;
}

export interface GameState {
  quizId: string;
  currentQuestionIndex: number;
  isActive: boolean;
  startedAt: Date | null;
  questionStartTime: Date | null;
  showResults: boolean;
  showQuestionOnly: boolean;
  currentQuestionTimeLimit: number;
  shuffledQuestions?: Question[];
}

export interface QuizResponse {
  id: string;
  groupId: string;
  questionIndex: number;
  answer: number;
  timestamp: Date;
  isCorrect: boolean;
  responseTime: number;
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
