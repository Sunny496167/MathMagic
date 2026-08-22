import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PracticeFeedStats } from '../types/practice.types';

interface PracticeStatsHeaderProps {
  stats: PracticeFeedStats;
}

export const PracticeStatsHeader: React.FC<PracticeStatsHeaderProps> = ({ stats }) => {
  return (
    <View className="bg-white rounded-2xl p-4 mb-6 border border-slate-100 shadow-sm">
      <View className="flex-row items-center justify-between">
        {/* Accuracy */}
        <View className="items-center flex-1">
          <View className="flex-row items-center gap-1 mb-0.5">
            <Ionicons name="pie-chart-outline" size={14} color="#8B5CF6" />
            <Text className="text-slate-400 text-[10px] font-black uppercase font-inter">
              Accuracy
            </Text>
          </View>
          <Text className="text-slate-900 text-base font-black font-inter">
            {stats.accuracy}%
          </Text>
        </View>

        <View className="h-7 w-[1px] bg-slate-100" />

        {/* Solved Count */}
        <View className="items-center flex-1">
          <View className="flex-row items-center gap-1 mb-0.5">
            <Ionicons name="checkmark-circle-outline" size={14} color="#10B981" />
            <Text className="text-slate-400 text-[10px] font-black uppercase font-inter">
              Solved
            </Text>
          </View>
          <Text className="text-slate-900 text-base font-black font-inter">
            {stats.solvedCount}
          </Text>
        </View>

        <View className="h-7 w-[1px] bg-slate-100" />

        {/* Streak */}
        <View className="items-center flex-1">
          <View className="flex-row items-center gap-1 mb-0.5">
            <Ionicons name="flame-outline" size={14} color="#F43F5E" />
            <Text className="text-slate-400 text-[10px] font-black uppercase font-inter">
              Streak
            </Text>
          </View>
          <Text className="text-slate-900 text-base font-black font-inter">
            {stats.streak}d
          </Text>
        </View>

        <View className="h-7 w-[1px] bg-slate-100" />

        {/* Total XP */}
        <View className="items-center flex-1">
          <View className="flex-row items-center gap-1 mb-0.5">
            <Ionicons name="star-outline" size={14} color="#D97706" />
            <Text className="text-slate-400 text-[10px] font-black uppercase font-inter">
              Total XP
            </Text>
          </View>
          <Text className="text-slate-900 text-base font-black font-inter">
            {stats.totalXp}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default PracticeStatsHeader;
