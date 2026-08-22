export type LockStatus = 'locked' | 'unlocked' | 'in_progress' | 'completed';

export interface ContentBlock {
  type: 'text' | 'heading' | 'example' | 'tip' | 'formula' | 'note' | 'image';
  content: string;
  order?: number;
}

export interface LearningContent {
  blocks: ContentBlock[];
}

export interface CompletionRequirement {
  minScore: number;
  mustAnswerAll: boolean;
}

export interface TopicItem {
  _id: string;
  grade: string;
  title: string;
  description: string;
  icon?: string;
  color?: string;
  order: number;
  status: LockStatus;
  totalExercises: number;
  completedExercises: number;
}

export interface ExerciseItem {
  _id: string;
  topic: string;
  grade: string;
  title: string;
  description?: string;
  icon?: string;
  color?: string;
  order: number;
  status: LockStatus;
  completionRequirement?: CompletionRequirement;
  learningContent?: LearningContent;
}

export interface LearnQuestion {
  _id: string;
  exercise: string;
  context: 'learn' | 'practice';
  type: 'mcq' | 'numeric' | 'fill_blank' | 'true_false' | 'matching' | 'ordering' | 'image_mcq';
  text: string;
  options?: string[];
  correctAnswer: any;
  acceptableAnswers?: string[];
  imageUrl?: string;
  explanation?: string;
  hint?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  xpReward?: number;
  order?: number;
}

export interface ExerciseDetailResponse {
  exercise: ExerciseItem;
  questions: LearnQuestion[];
}

export interface AnswerSubmissionResult {
  isCorrect: boolean;
  correctAnswer: any;
  explanation?: string;
  xpEarned: number;
}

export interface ExerciseCompletionResult {
  success: boolean;
  score: number;
  requiredScore?: number;
  reason?: string;
  passed?: boolean;
  xpEarned?: number;
}

// Legacy types for backward compatibility
export interface Lesson {
  id: string;
  title: string;
  category: string;
  formula: string;
  description: string;
  exampleProblem: string;
  exampleStep: string;
  quizQuestion: string;
  quizAnswer: string;
}

export type LessonCategoryFilter = 'All' | 'Basics' | 'Algebra' | 'Fractions' | 'Geometry';
