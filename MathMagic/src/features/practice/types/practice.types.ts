import { LockStatus, LearnQuestion } from '../../learn/types/learn.types';
import { MathCategory, MathDifficulty } from '../../../types';

export interface PracticeLevelItem {
  _id: string;
  exercise: string;
  number: number;
  title: string;
  description?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
  passingScore: number;
  timeLimit?: number;
  status: LockStatus;
  bestScore?: number;
  mastery?: number;
}

export interface PracticeExerciseItem {
  _id: string;
  topicId: string;
  topicTitle: string;
  topicColor?: string;
  exerciseTitle: string;
  exerciseDescription?: string;
  isLearnCompleted: boolean;
  levels: PracticeLevelItem[];
}

export interface DrillQuestionAnswer {
  questionId: string;
  userAnswer: any;
  timeSpentMs: number;
}

export interface DrillSubmissionPayload {
  answers: DrillQuestionAnswer[];
  totalTimeMs: number;
}

export interface DrillResultData {
  score: number;
  totalCorrect: number;
  totalQuestions: number;
  accuracy: number;
  totalTimeMs: number;
  mistakes?: string[];
  xpEarned: number;
  mastery?: number;
  bestScore?: number;
  passed: boolean;
  message?: string;
}

export interface PracticeFeedStats {
  accuracy: number;
  solvedCount: number;
  streak: number;
  totalXp: number;
}

// Legacy types for backward compatibility
export interface PracticeQuestion {
  text: string;
  answer: number;
}

export interface PracticeSessionState {
  activeTopic: MathCategory | null;
  difficulty: MathDifficulty;
  question: PracticeQuestion | null;
  userAnswer: string;
  feedback: 'correct' | 'incorrect' | null;
  solvedCount: number;
}
