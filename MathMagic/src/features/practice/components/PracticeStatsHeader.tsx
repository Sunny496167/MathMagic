import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserStats } from '../../../types';

interface PracticeStatsHeaderProps {
  stats: UserStats;
}

export const PracticeStatsHeader = ({ stats }: PracticeStatsHeaderProps) => {
  return (
    <View className="flex-row justify-between mb-6">
      <View className="bg-[#FEF3C7] border border-[#FDE68A] flex-1 mr-2 p-4 rounded-3xl items-center flex-row justify-center shadow-sm">
        <Ionicons name="sparkles" size={20} color="#D97706" className="mr-2" />
        <View className="ml-1">
          <Text className="text-amber-800 text-xs font-bold font-inter">Total XP</Text>
          <Text className="text-amber-900 text-lg font-extrabold font-inter">{stats.xp}</Text>
        </View>
      </View>

      <View className="bg-[#FFF1F2] border border-[#FECDD3] flex-1 ml-2 p-4 rounded-3xl items-center flex-row justify-center shadow-sm">
        <Ionicons name="flame" size={20} color="#F43F5E" className="mr-2" />
        <View className="ml-1">
          <Text className="text-rose-800 text-xs font-bold font-inter">Streak</Text>
          <Text className="text-rose-900 text-lg font-extrabold font-inter">{stats.streak} Days</Text>
        </View>
      </View>
    </View>
  );
};

export default PracticeStatsHeader;
