import { apiClient } from '../../../api/client';
import { ENDPOINTS } from '../../../api/endpoints';
import {
  GameCardConfig,
  GameResultData,
  GameSubmissionPayload,
  GameType,
  GamePairItem,
} from '../types/game.types';
import { LearnQuestion } from '../../learn/types/learn.types';

export const gameService = {
  async fetchAvailableGames(): Promise<GameCardConfig[]> {
    const res = await apiClient.get(ENDPOINTS.GAMES.AVAILABLE);
    return res.data?.data || [];
  },

  async generateGameQuestions(
    gameType: GameType,
    questionCount: number = 10
  ): Promise<{
    gameType: GameType;
    questionCount: number;
    questions: LearnQuestion[];
    pairs?: GamePairItem[];
  }> {
    const res = await apiClient.post(ENDPOINTS.GAMES.GENERATE, {
      gameType,
      questionCount,
    });
    return (
      res.data?.data || {
        gameType,
        questionCount: 0,
        questions: [],
        pairs: [],
      }
    );
  },

  async submitGameSession(
    payload: GameSubmissionPayload
  ): Promise<GameResultData> {
    const res = await apiClient.post(ENDPOINTS.GAMES.SESSION, payload);
    return (
      res.data?.data || {
        gameType: payload.gameType,
        score: payload.score,
        accuracy: payload.accuracy,
        maxCombo: payload.maxCombo,
        totalTimeMs: payload.totalTimeMs,
        totalCorrect: 0,
        totalQuestions: 0,
        starsEarned: 1,
        xpEarned: 20,
        isHighScore: false,
      }
    );
  },
};
