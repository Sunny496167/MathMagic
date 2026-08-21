import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { profileService } from '../services/profileService';
import { Grade, ProgressStats, ProgressTreeData, TopicProgressNode } from '../../../types';

export const useProfileData = () => {
  const { user, signOut, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [enabledGrades, setEnabledGrades] = useState<Grade[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [topics, setTopics] = useState<TopicProgressNode[]>([]);
  const [stats, setStats] = useState<ProgressStats | null>(null);

  const [gradeModalVisible, setGradeModalVisible] = useState(false);
  const [adminModalVisible, setAdminModalVisible] = useState(false);

  const loadAllProfileData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch enabled grades
      const grades = await profileService.fetchEnabledGrades();
      setEnabledGrades(grades);

      // 2. Fetch full progress tree
      const treeData: ProgressTreeData = await profileService.fetchProgressTree();
      setSelectedGrade(treeData.grade);
      setTopics(treeData.topics || []);
      setStats(treeData.stats || null);
    } catch (err: any) {
      console.warn('Failed to load profile curriculum data:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllProfileData();
  }, [loadAllProfileData]);

  const handleSelectGrade = async (gradeId: string) => {
    try {
      setLoading(true);
      const updatedUser = await profileService.selectGrade(gradeId);
      if (setUser) setUser(updatedUser);
      setGradeModalVisible(false);
      await loadAllProfileData();
      Alert.alert('Grade Updated', 'Your active grade curriculum has been updated!');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update grade');
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    enabledGrades,
    selectedGrade,
    topics,
    stats,
    gradeModalVisible,
    setGradeModalVisible,
    adminModalVisible,
    setAdminModalVisible,
    loadAllProfileData,
    handleSelectGrade,
    signOut,
  };
};
