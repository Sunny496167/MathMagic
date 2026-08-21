export interface UserProfile {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  avatar?: string;
  xp?: number;
  streak?: number;
  selectedGrade?: any;
  referralCode?: string;
  referredBy?: string;
  [key: string]: any;
}

export interface ProgressStats {
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
  overallAccuracy: number;
  exercisesCompleted: number;
  topicsCompleted: number;
  practiceLevelsCompleted: number;
  gamesPlayed: number;
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
}

export interface UserStats {
  xp: number;
  streak: number;
  highScore: number;
  completedLessons: string[];
  lastActiveDate: string | null;
}

export interface Grade {
  _id: string;
  number: number;
  name: string;
  description?: string;
  isEnabled: boolean;
  icon?: string;
  color?: string;
  order?: number;
}

export interface PracticeLevelProgressNode {
  _id: string;
  number: number;
  title: string;
  difficulty: string;
  questionCount: number;
  passingScore: number;
  status: 'locked' | 'unlocked' | 'in_progress' | 'completed';
  bestScore: number;
  mastery: number;
}

export interface ExerciseProgressNode {
  _id: string;
  title: string;
  description?: string;
  icon?: string;
  color?: string;
  order: number;
  status: 'locked' | 'unlocked' | 'in_progress' | 'completed';
  learnScore?: number;
  practiceLevels: PracticeLevelProgressNode[];
}

export interface TopicProgressNode {
  _id: string;
  title: string;
  description?: string;
  icon?: string;
  color?: string;
  order: number;
  status: 'locked' | 'unlocked' | 'in_progress' | 'completed';
  exercises: ExerciseProgressNode[];
}

export interface ProgressTreeData {
  grade: Grade | null;
  topics: TopicProgressNode[];
  stats: ProgressStats;
}

export interface Grade1Question {
  id?: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  xp: number;
}

export type MathDifficulty = 'Easy' | 'Medium' | 'Hard';
export type MathCategory = 'Addition' | 'Subtraction' | 'Multiplication' | 'Division' | 'Fractions';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  errors?: Array<{ field?: string; message: string }>;
}

