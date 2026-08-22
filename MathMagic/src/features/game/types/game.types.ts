import { LearnQuestion } from '../../learn/types/learn.types';

export type GameType =
  | 'quick_math'
  | 'number_match'
  | 'memory_math'
  | 'math_catch'
  | 'shape_hunt'
  | 'clock_challenge'
  | 'money_market'
  | 'mixed_recall';

export interface GameCardConfig {
  gameType: GameType;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  gradient: string[];
  isUnlocked: boolean;
  highScore: number;
  stars: number;
  requiredTopics: number;
  defaultQuestionCount: number;
}

export interface GamePairItem {
  id: string;
  left: string;
  right: string;
}

export interface GameAnswerRecord {
  questionId?: string;
  userAnswer: any;
  isCorrect: boolean;
  timeSpentMs: number;
}

export interface GameSubmissionPayload {
  gameType: GameType;
  score: number;
  accuracy: number;
  maxCombo: number;
  totalTimeMs: number;
  answers: GameAnswerRecord[];
}

export interface GameResultData {
  sessionId?: string;
  gameType: GameType;
  score: number;
  accuracy: number;
  maxCombo: number;
  totalTimeMs: number;
  totalCorrect: number;
  totalQuestions: number;
  starsEarned: number;
  xpEarned: number;
  isHighScore: boolean;
  newTotalXp?: number;
  message?: string;
}

export interface GameHUDState {
  score: number;
  combo: number;
  lives: number;
  elapsedSeconds: number;
  timeRemaining?: number;
}

// Legacy types for backward compatibility
export type GameState = 'idle' | 'playing' | 'gameover';

export interface GameQuestion {
  text: string;
  options: number[];
  answer: number;
}

export interface GameSessionState {
  state: GameState;
  score: number;
  highScore: number;
  streak: number;
  bestStreak: number;
  timeLeft: number;
  question: GameQuestion | null;
  selectedAnswer: number | null;
  isCorrect: boolean | null;
}
