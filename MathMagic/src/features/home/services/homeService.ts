import { apiClient } from '../../../api/client';
import { ENDPOINTS } from '../../../api/endpoints';
import { HomeDashboardData } from '../types/home.types';

export const homeService = {
  async fetchHomeDashboard(): Promise<HomeDashboardData> {
    const res = await apiClient.get(ENDPOINTS.PROGRESS.HOME_DASHBOARD);
    return res.data?.data;
  },

  async claimDailyMissionReward(): Promise<{
    bonusXp: number;
    newTotalXp: number;
    message: string;
  }> {
    const res = await apiClient.post(ENDPOINTS.PROGRESS.CLAIM_DAILY_MISSION);
    return res.data?.data;
  },
};
