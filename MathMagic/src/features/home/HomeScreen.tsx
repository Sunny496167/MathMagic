import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import SafeScreen from '../../components/common/SafeScreen';
import { HomeDashboardData } from './types/home.types';
import { homeService } from './services/homeService';
import HomeHeader from './components/HomeHeader';
import ContinueLearningCard from './components/ContinueLearningCard';
import DailyMissionsCard from './components/DailyMissionsCard';
import QuickShortcutsGrid from './components/QuickShortcutsGrid';
import WeeklyActivityCard from './components/WeeklyActivityCard';
import MathFactCard from './components/MathFactCard';
import { useAuth } from '../../context/AuthContext';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';

export const HomeScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { triggerSuccess, triggerLight } = useHapticFeedback();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<HomeDashboardData | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await homeService.fetchHomeDashboard();
      setData(res);
    } catch (err: any) {
      console.warn('Failed to load dashboard:', err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    React.useCallback(() => {
      loadDashboard();
    }, [loadDashboard])
  );

  const handleClaimDailyReward = async () => {
    try {
      triggerSuccess();
      const res = await homeService.claimDailyMissionReward();
      Alert.alert('🎉 Bonus Claimed!', `You received +${res.bonusXp} XP for completing your daily missions!`);
      loadDashboard();
    } catch (err: any) {
      Alert.alert('Notice', err.response?.data?.message || err.message);
    }
  };

  const handleNavigateTab = (tab: 'learn' | 'practice' | 'game' | 'profile') => {
    triggerLight();
    if (tab === 'learn') {
      router.push('/(tabs)/learn');
    } else if (tab === 'practice') {
      router.push('/(tabs)/practice');
    } else if (tab === 'game') {
      router.push('/(tabs)/game');
    } else if (tab === 'profile') {
      router.push('/(tabs)/profile');
    }
  };

  return (
    <SafeScreen>
      <View className="flex-1 bg-background">
        {/* Personalized Header */}
        <HomeHeader
          userName={data?.user?.name || user?.name}
          gradeName={data?.grade?.name || 'Grade 1'}
          streak={data?.user?.streak || user?.streak || 1}
          xp={data?.user?.xp || user?.xp || 0}
          onRefresh={loadDashboard}
        />

        <ScrollView
          className="flex-1 px-6 py-5"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 90 }}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={loadDashboard}
              tintColor="#8B5CF6"
            />
          }
        >
          {loading && !data ? (
            <View className="py-16 items-center justify-center">
              <ActivityIndicator size="large" color="#8B5CF6" />
            </View>
          ) : (
            <>
              {/* 1. Continue Learning Hero Card */}
              <ContinueLearningCard
                lesson={data?.continueLesson || null}
                onPressResume={() => handleNavigateTab('learn')}
              />

              {/* 2. Daily Missions Checklist */}
              {data?.dailyMissions && (
                <DailyMissionsCard
                  missions={data.dailyMissions.missions}
                  allCompleted={data.dailyMissions.allCompleted}
                  rewardClaimed={data.dailyMissions.rewardClaimed}
                  bonusXp={data.dailyMissions.bonusXp}
                  onClaimReward={handleClaimDailyReward}
                  onNavigateTab={handleNavigateTab}
                />
              )}

              {/* 3. Quick Jump Shortcuts */}
              <QuickShortcutsGrid onNavigate={handleNavigateTab} />

              {/* 4. 7-Day Activity & Streak */}
              {data?.weeklyActivity && (
                <WeeklyActivityCard
                  activity={data.weeklyActivity}
                  currentStreak={data.user.streak}
                />
              )}

              {/* 5. Educational Math Fact */}
              <MathFactCard fact={data?.dailyMathFact || null} />
            </>
          )}
        </ScrollView>
      </View>
    </SafeScreen>
  );
};

export default HomeScreen;
