import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HomeHeaderProps {
  userName?: string;
  gradeName?: string;
  streak?: number;
  xp?: number;
  onRefresh?: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  userName = 'Adventurer',
  gradeName = 'Grade 1',
  streak = 1,
  xp = 0,
  onRefresh,
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const initial = userName ? userName.charAt(0).toUpperCase() : 'M';

  return (
    <View className="px-6 py-4 bg-white border-b border-slate-100 flex-row items-center justify-between">
      {/* User Avatar & Greeting */}
      <View className="flex-row items-center gap-3 flex-1 mr-2">
        <View className="w-12 h-12 rounded-2xl bg-purple-100 items-center justify-center border-2 border-purple-200">
          <Text className="text-primary font-black text-lg font-inter">
            {initial}
          </Text>
        </View>

        <View className="flex-1">
          <Text className="text-slate-400 text-xs font-bold font-inter">
            {getGreeting()},
          </Text>
          <Text
            numberOfLines={1}
            className="text-slate-900 text-lg font-black font-inter tracking-tight"
          >
            {userName}
          </Text>
        </View>
      </View>

      {/* Grade Pill & Streak / XP Badges */}
      <View className="flex-row items-center gap-2">
        <View className="bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-2xl flex-row items-center gap-1.5">
          <Ionicons name="school" size={13} color="#8B5CF6" />
          <Text className="text-primary text-xs font-black font-inter">
            {gradeName}
          </Text>
        </View>

        <View className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-2xl flex-row items-center gap-1">
          <Ionicons name="flame" size={13} color="#D97706" />
          <Text className="text-amber-800 text-xs font-black font-inter">
            {streak}d
          </Text>
        </View>
      </View>
    </View>
  );
};

export default HomeHeader;
