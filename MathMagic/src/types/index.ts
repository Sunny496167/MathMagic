export interface UserProfile {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  avatar?: string;
  xp?: number;
  streak?: number;
  referralCode?: string;
  referredBy?: string;
  [key: string]: any;
}

export interface UserStats {
  xp: number;
  streak: number;
  highScore: number;
  completedLessons: string[];
  lastActiveDate: string | null;
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
