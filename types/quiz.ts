export interface Question {
  id: string;
  type: "true-false" | "multiple-choice";
  text: string;
  choices: string[];
  correctAnswer: number;
  timeLimit: number; // مؤقت مخصص لكل سؤال
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  questions: Question[];
  isActive: boolean;
  shuffleQuestions: boolean; // خلط الأسئلة
  shuffleChoices: boolean; // خلط الاختيارات
}

export interface Group {
  id: string;
  groupName: string;
  members: string[];
  joinedAt: Date;
  score: number;
  lastActivity: Date; // آخر نشاط للمجموعة
}

export interface GameState {
  quizId: string;
  currentQuestionIndex: number;
  isActive: boolean;
  startedAt: Date | null;
  questionStartTime: Date | null;
  showResults: boolean;
  currentQuestionTimeLimit: number; // مؤقت السؤال الحالي
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
}
