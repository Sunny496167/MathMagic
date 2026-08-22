import { apiClient } from '../../../api/client';
import { ENDPOINTS } from '../../../api/endpoints';
import {
  TopicItem,
  ExerciseItem,
  ExerciseDetailResponse,
  AnswerSubmissionResult,
  ExerciseCompletionResult,
} from '../types/learn.types';

export const learnService = {
  async fetchTopicsForGrade(gradeId: string): Promise<TopicItem[]> {
    const res = await apiClient.get(ENDPOINTS.CURRICULUM.TOPICS(gradeId));
    return res.data?.data || [];
  },

  async fetchExercisesForTopic(topicId: string): Promise<ExerciseItem[]> {
    const res = await apiClient.get(ENDPOINTS.CURRICULUM.EXERCISES(topicId));
    return res.data?.data || [];
  },

  async fetchExerciseDetail(exerciseId: string): Promise<ExerciseDetailResponse> {
    const res = await apiClient.get(ENDPOINTS.CURRICULUM.EXERCISE_DETAIL(exerciseId));
    return res.data?.data || { exercise: {} as ExerciseItem, questions: [] };
  },

  async submitLearnAnswer(
    exerciseId: string,
    questionId: string,
    userAnswer: any,
    timeSpentMs: number = 0
  ): Promise<AnswerSubmissionResult> {
    const res = await apiClient.post(ENDPOINTS.PROGRESS.ANSWER_LEARN(exerciseId), {
      questionId,
      userAnswer,
      timeSpentMs,
    });
    return res.data?.data || { isCorrect: false, correctAnswer: '', xpEarned: 0 };
  },

  async completeLearnExercise(exerciseId: string): Promise<ExerciseCompletionResult> {
    const res = await apiClient.post(ENDPOINTS.PROGRESS.COMPLETE_LEARN(exerciseId));
    return res.data?.data || { success: res.data?.success || false, score: 0 };
  },
};
