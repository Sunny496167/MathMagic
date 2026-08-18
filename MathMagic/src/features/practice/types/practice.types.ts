import { MathCategory, MathDifficulty } from '../../../types';

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
