import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { statsStorage } from '../../../services/statsStorage';
import { useAuth } from '../../../context/AuthContext';
import { UserStats } from '../../../types';

export const useProfileData = () => {
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    xp: 0,
    streak: 0,
    highScore: 0,
    completedLessons: [],
    lastActiveDate: null,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const s = await statsStorage.getStats();
    setStats(s);
  };

  const handleResetProgress = () => {
    Alert.alert(
      'Reset Progress',
      'Are you sure you want to clear your stats, streak, and level progress? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            const resetData = await statsStorage.resetStats();
            setStats(resetData);
          },
        },
      ]
    );
  };

  const level = Math.floor(stats.xp / 100) + 1;
  const currentXpInLevel = stats.xp % 100;
  const xpProgressPercent = Math.min(Math.max(currentXpInLevel, 0), 100);

  return {
    user,
    stats,
    level,
    currentXpInLevel,
    xpProgressPercent,
    loadStats,
    handleResetProgress,
    signOut,
  };
};
