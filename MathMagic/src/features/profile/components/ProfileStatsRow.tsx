import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserStats } from '../../../types';

interface ProfileStatsRowProps {
  stats: UserStats;
}

export const ProfileStatsRow = ({ stats }: ProfileStatsRowProps) => {
  const statItems = [
    {
      id: 'Practice',
      value: stats.completedLessons.length * 4 || 12,
      bg: 'bg-[#E8F8F0]',
      border: 'border-[#D1F2E1]',
      color: '#10B981',
      icon: 'calculator',
    },
    {
      id: 'Games',
      value: stats.highScore || 18,
      bg: 'bg-[#F0F9FF]',
      border: 'border-[#E0F2FE]',
      color: '#0284C7',
      icon: 'game-controller',
    },
    {
      id: 'Quizzes',
      value: stats.completedLessons.length || 9,
      bg: 'bg-[#FEF3C7]',
      border: 'border-[#FEEB9F]',
      color: '#D97706',
      icon: 'trophy',
    },
    {
      id: 'Streak',
      value: `${stats.streak}d`,
      bg: 'bg-[#FFF1F2]',
      border: 'border-[#FFE4E6]',
      color: '#F43F5E',
      icon: 'flame',
    },
  ];

  return (
    <View>
      <Text className="text-text-secondary text-[11px] font-bold uppercase tracking-wider mb-3.5 font-inter">
        Stats Overview
      </Text>
      <View className="flex-row justify-between mb-6">
        {statItems.map((stat) => (
          <View
            key={stat.id}
            className={`w-[23.5%] ${stat.bg} border ${stat.border} rounded-2xl py-3.5 items-center justify-center shadow-sm`}
          >
            <Ionicons name={stat.icon as any} size={18} color={stat.color} />
            <Text className="text-text-primary text-sm font-bold mt-1.5">{stat.value}</Text>
            <Text className="text-text-secondary text-[8px] font-bold uppercase mt-0.5">{stat.id}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default ProfileStatsRow;
