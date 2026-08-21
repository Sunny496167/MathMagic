import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProgressStats } from '../../../types';

interface ProfileStatsGridProps {
  stats: ProgressStats | null;
}

export const ProfileStatsGrid: React.FC<ProfileStatsGridProps> = ({ stats }) => {
  const statItems = [
    {
      label: 'Questions Answered',
      value: stats?.totalQuestionsAnswered ?? 0,
      icon: 'help-circle',
      color: '#8B5CF6',
      bg: 'bg-purple-50',
    },
    {
      label: 'Overall Accuracy',
      value: `${stats?.overallAccuracy ?? 0}%`,
      icon: 'checkmark-done-circle',
      color: '#10B981',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Exercises Mastered',
      value: stats?.exercisesCompleted ?? 0,
      icon: 'checkbox',
      color: '#3B82F6',
      bg: 'bg-blue-50',
    },
    {
      label: 'Topics Completed',
      value: stats?.topicsCompleted ?? 0,
      icon: 'book',
      color: '#F59E0B',
      bg: 'bg-amber-50',
    },
    {
      label: 'Practice Levels Passed',
      value: stats?.practiceLevelsCompleted ?? 0,
      icon: 'trophy',
      color: '#EC4899',
      bg: 'bg-pink-50',
    },
    {
      label: 'Games Played',
      value: stats?.gamesPlayed ?? 0,
      icon: 'game-controller',
      color: '#6366F1',
      bg: 'bg-indigo-50',
    },
    {
      label: 'Total Experience (XP)',
      value: (stats?.totalXp ?? 0).toLocaleString(),
      icon: 'star',
      color: '#EAB308',
      bg: 'bg-yellow-50',
    },
    {
      label: 'Day Streak',
      value: `${stats?.currentStreak ?? 0} Days`,
      icon: 'flame',
      color: '#EF4444',
      bg: 'bg-red-50',
    },
  ];

  return (
    <View className="mb-6">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-text-primary text-base font-bold font-inter">
          Learning Statistics
        </Text>
        <Text className="text-text-secondary text-xs font-semibold">
          Lifetime Progress
        </Text>
      </View>

      <View className="flex-row flex-wrap justify-between gap-y-3">
        {statItems.map((item, idx) => (
          <View
            key={idx}
            className="w-[48%] bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex-row items-center gap-3"
          >
            <View className={`w-10 h-10 rounded-xl ${item.bg} items-center justify-center`}>
              <Ionicons name={item.icon as any} size={20} color={item.color} />
            </View>
            <View className="flex-1">
              <Text className="text-text-primary text-base font-extrabold font-inter" numberOfLines={1}>
                {item.value}
              </Text>
              <Text className="text-text-secondary text-[11px] font-medium font-inter mt-0.5" numberOfLines={1}>
                {item.label}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default ProfileStatsGrid;
