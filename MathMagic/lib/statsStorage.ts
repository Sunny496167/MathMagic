import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const STATS_KEY = "user_math_stats";

export interface UserStats {
  xp: number;
  streak: number;
  highScore: number;
  completedLessons: string[];
  lastActiveDate: string | null;
}

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
    if (Platform.OS === "web") {
      localStorage.setItem(STATS_KEY, dataStr);
      return;
    }
    await SecureStore.setItemAsync(STATS_KEY, dataStr);
  },

  async getStats(): Promise<UserStats> {
    try {
      let dataStr: string | null = null;
      if (Platform.OS === "web") {
        dataStr = localStorage.getItem(STATS_KEY);
      } else {
        dataStr = await SecureStore.getItemAsync(STATS_KEY);
      }
      if (dataStr) {
        return JSON.parse(dataStr) as UserStats;
      }
    } catch (e) {
      console.warn("Failed to read user stats", e);
    }
    return defaultStats;
  },

  async addXp(amount: number): Promise<UserStats> {
    const stats = await this.getStats();
    stats.xp += amount;
    
    // Manage streak logic
    const today = new Date().toDateString();
    if (stats.lastActiveDate !== today) {
      if (stats.lastActiveDate) {
        const lastDate = new Date(stats.lastActiveDate);
        const diffTime = Math.abs(new Date(today).getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          stats.streak += 1;
        } else if (diffDays > 1) {
          stats.streak = 1;
        }
      } else {
        stats.streak = 1;
      }
      stats.lastActiveDate = today;
    }
    
    await this.saveStats(stats);
    return stats;
  },

  async updateHighScore(score: number): Promise<UserStats> {
    const stats = await this.getStats();
    if (score > stats.highScore) {
      stats.highScore = score;
      await this.saveStats(stats);
    }
    return stats;
  },

  async completeLesson(lessonId: string): Promise<UserStats> {
    const stats = await this.getStats();
    if (!stats.completedLessons.includes(lessonId)) {
      stats.completedLessons.push(lessonId);
      stats.xp += 30; // +30 XP for completing a lesson!
      await this.saveStats(stats);
    }
    return stats;
  },

  async resetStats(): Promise<UserStats> {
    await this.saveStats(defaultStats);
    return defaultStats;
  }
};
