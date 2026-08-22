import { LockStatus } from '../../learn/types/learn.types';

export interface StudentProgressStats {
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
  overallAccuracy: number;
  exercisesCompleted: number;
  topicsCompleted: number;
  practiceLevelsCompleted: number;
  gamesPlayed?: number;
  totalXp: number;
  currentStreak: number;
  longestStreak?: number;
  lastActiveDate?: string | null;
}

export interface StudentListItem {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  isActive: boolean;
  selectedGrade?: {
    _id: string;
    number: number;
    name: string;
    description?: string;
    icon?: string;
    color?: string;
  } | null;
  xp: number;
  streak: number;
  stats: StudentProgressStats;
  createdAt: string;
  lastLoginAt?: string | null;
}

export interface StudentDetailPracticeLevel {
  _id: string;
  number: number;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
  passingScore: number;
  status: LockStatus;
  bestScore: number;
  mastery: number;
  attemptsCount: number;
  completed: boolean;
  completedAt?: string | null;
}

export interface StudentDetailExercise {
  _id: string;
  title: string;
  subtopicNumber?: number;
  status: LockStatus;
  contentRead: boolean;
  score: number;
  answersCount: number;
  completedAt?: string | null;
  practiceLevels: StudentDetailPracticeLevel[];
}

export interface StudentDetailTopic {
  _id: string;
  title: string;
  icon?: string;
  color?: string;
  order: number;
  status: LockStatus;
  exercises: StudentDetailExercise[];
}

export interface StudentDetailProgress {
  student: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    selectedGrade?: any;
    xp: number;
    streak: number;
    createdAt: string;
    lastLoginAt?: string | null;
  };
  grade: {
    _id: string;
    number: number;
    name: string;
    description?: string;
  } | null;
  stats: StudentProgressStats;
  topics: StudentDetailTopic[];
}
