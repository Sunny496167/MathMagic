import { apiClient } from '../../../api/client';
import { ENDPOINTS } from '../../../api/endpoints';
import { Grade, ProgressTreeData, UserProfile } from '../../../types';

export const profileService = {
  async fetchProfile(): Promise<UserProfile> {
    const res = await apiClient.get(ENDPOINTS.AUTH.ME);
    return res.data?.data?.user || res.data?.user;
  },

  async fetchEnabledGrades(): Promise<Grade[]> {
    const res = await apiClient.get(ENDPOINTS.CURRICULUM.GRADES);
    return res.data?.data || [];
  },

  async selectGrade(gradeId: string): Promise<UserProfile> {
    const res = await apiClient.patch(ENDPOINTS.USERS.SELECT_GRADE, { gradeId });
    return res.data?.data?.user || res.data?.user;
  },

  async fetchProgressTree(gradeId?: string): Promise<ProgressTreeData> {
    const url = gradeId
      ? `${ENDPOINTS.PROGRESS.TREE}?gradeId=${gradeId}`
      : ENDPOINTS.PROGRESS.TREE;
    const res = await apiClient.get(url);
    return res.data?.data || { grade: null, topics: [], stats: {} as any };
  },
};
