import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { STORAGE_KEYS } from '../constants';
import { UserStats } from '../types';

const defaultStats: UserStats = {
  xp: 0,
  streak: 0,
  highScore: 0,
  completedLessons: [],
  lastActiveDate: null,
};

export const statsStorage = {
  async saveStats(stats: UserStats) {
    const dataStr = JSON.stringify(stats);
    if (Platform.OS === 'web') {
      localStorage.setItem(STORAGE_KEYS.STATS, dataStr);
      return;
    }
    await SecureStore.setItemAsync(STORAGE_KEYS.STATS, dataStr);
  },

  async getStats(): Promise<UserStats> {
    try {
      let dataStr: string | null = null;
      if (Platform.OS === 'web') {
        dataStr = localStorage.getItem(STORAGE_KEYS.STATS);
      } else {
        dataStr = await SecureStore.getItemAsync(STORAGE_KEYS.STATS);
      }
      if (dataStr) {
        return JSON.parse(dataStr);
      }
      return defaultStats;
    } catch {
      return defaultStats;
    }
  },

  async addXp(amount: number): Promise<UserStats> {
    const current = await this.getStats();
    const updated: UserStats = {
      ...current,
      xp: current.xp + amount,
    };
    await this.saveStats(updated);
    return updated;
  },

  async updateStreak(): Promise<UserStats> {
    const current = await this.getStats();
    const today = new Date().toISOString().split('T')[0];

    if (!current.lastActiveDate) {
      const updated = { ...current, streak: 1, lastActiveDate: today };
      await this.saveStats(updated);
      return updated;
    }

    const last = new Date(current.lastActiveDate);
    const now = new Date(today);
    const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 3600 * 24));

    let newStreak = current.streak;
    if (diffDays === 1) {
      newStreak += 1;
    } else if (diffDays > 1) {
      newStreak = 1;
    }

    const updated = {
      ...current,
      streak: newStreak,
      lastActiveDate: today,
    };
    await this.saveStats(updated);
    return updated;
  },

  async updateHighScore(score: number): Promise<UserStats> {
    const current = await this.getStats();
    if (score > current.highScore) {
      const updated = { ...current, highScore: score };
      await this.saveStats(updated);
      return updated;
    }
    return current;
  },

  async markLessonComplete(lessonId: string): Promise<UserStats> {
    const current = await this.getStats();
    if (!current.completedLessons.includes(lessonId)) {
      const updated = {
        ...current,
        completedLessons: [...current.completedLessons, lessonId],
        xp: current.xp + 50,
      };
      await this.saveStats(updated);
      return updated;
    }
    return current;
  },

  async resetStats(): Promise<UserStats> {
    await this.saveStats(defaultStats);
    return defaultStats;
  },
};
