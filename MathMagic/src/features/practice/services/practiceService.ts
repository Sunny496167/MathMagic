import { apiClient } from '../../../api/client';
import { ENDPOINTS } from '../../../api/endpoints';
import {
  DrillSubmissionPayload,
  DrillResultData,
  PracticeLevelItem,
} from '../types/practice.types';
import { LearnQuestion } from '../../learn/types/learn.types';

export const practiceService = {
  async fetchProgressTree(gradeId?: string): Promise<any> {
    const url = gradeId ? `${ENDPOINTS.PROGRESS.TREE}?gradeId=${gradeId}` : ENDPOINTS.PROGRESS.TREE;
    const res = await apiClient.get(url);
    return res.data?.data || null;
  },

  async fetchPracticeLevelsForExercise(exerciseId: string): Promise<{
    exercise: any;
    levels: PracticeLevelItem[];
  }> {
    const res = await apiClient.get(ENDPOINTS.CURRICULUM.PRACTICE_LEVELS(exerciseId));
    return res.data?.data || { exercise: {}, levels: [] };
  },

  async fetchPracticeLevelQuestions(practiceLevelId: string): Promise<{
    practiceLevel: PracticeLevelItem;
    questions: LearnQuestion[];
  }> {
    const res = await apiClient.get(ENDPOINTS.CURRICULUM.PRACTICE_QUESTIONS(practiceLevelId));
    return res.data?.data || { practiceLevel: {} as PracticeLevelItem, questions: [] };
  },

  async submitPracticeDrill(
    practiceLevelId: string,
    payload: DrillSubmissionPayload
  ): Promise<DrillResultData> {
    const res = await apiClient.post(
      ENDPOINTS.PROGRESS.SUBMIT_PRACTICE(practiceLevelId),
      payload
    );
    return res.data?.data || {
      score: 0,
      totalCorrect: 0,
      totalQuestions: 0,
      accuracy: 0,
      totalTimeMs: 0,
      xpEarned: 0,
      passed: false,
    };
  },
};
