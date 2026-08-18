import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import SafeScreen from '../../components/common/SafeScreen';
import { ProfileHeaderCard } from './components/ProfileHeaderCard';
import { ProfileStatsRow } from './components/ProfileStatsRow';
import { ProfileMenuSection } from './components/ProfileMenuSection';
import { useProfileData } from './hooks/useProfileData';

export const ProfileScreen = () => {
  const {
    user,
    stats,
    level,
    currentXpInLevel,
    xpProgressPercent,
    loadStats,
    handleResetProgress,
    signOut,
  } = useProfileData();

  useFocusEffect(
    React.useCallback(() => {
      loadStats();
    }, [])
  );

  return (
    <SafeScreen>
      <View className="flex-1 bg-background">
        {/* Header */}
        <View className="px-6 py-5 border-b border-primary/5 bg-white flex-row justify-between items-center">
          <Text className="text-text-primary text-2xl font-bold tracking-tight">
            Profile
          </Text>
          <TouchableOpacity className="w-10 h-10 bg-slate-50 border border-primary/5 rounded-full justify-center items-center">
            <Ionicons name="settings-outline" size={18} color="#8B5CF6" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-6 py-5" showsVerticalScrollIndicator={false}>
          {/* User Profile Header Card */}
          <ProfileHeaderCard
            user={user}
            level={level}
            currentXpInLevel={currentXpInLevel}
            xpProgressPercent={xpProgressPercent}
          />

          {/* Statistics Horizontal Row */}
          <ProfileStatsRow stats={stats} />

          {/* Menu Options & Control Actions */}
          <ProfileMenuSection
            onResetProgress={handleResetProgress}
            onLogout={signOut}
          />
        </ScrollView>
      </View>
    </SafeScreen>
  );
};

export default ProfileScreen;
