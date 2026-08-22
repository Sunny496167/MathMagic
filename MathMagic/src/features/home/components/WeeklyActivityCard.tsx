import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WeeklyActivityDay } from '../types/home.types';

interface WeeklyActivityCardProps {
  activity: WeeklyActivityDay[];
  currentStreak: number;
}

export const WeeklyActivityCard: React.FC<WeeklyActivityCardProps> = ({
  activity,
  currentStreak,
}) => {
  const activeDaysCount = activity.filter((d) => d.isActive).length;

  return (
    <View className="bg-white rounded-3xl p-5 mb-6 border border-slate-100 shadow-sm">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2">
          <View className="w-8 h-8 rounded-xl bg-rose-100 items-center justify-center">
            <Ionicons name="flame" size={16} color="#E11D48" />
          </View>
          <View>
            <Text className="text-slate-900 font-black text-base font-inter">
              Weekly Activity
            </Text>
            <Text className="text-slate-400 text-xs font-bold font-inter">
              {activeDaysCount} of 7 Active Days This Week
            </Text>
          </View>
        </View>

        <View className="bg-rose-50 border border-rose-200 px-3 py-1 rounded-full flex-row items-center gap-1">
          <Ionicons name="flash" size={12} color="#E11D48" />
          <Text className="text-rose-700 font-black text-xs font-inter">
            {currentStreak} Day Streak
          </Text>
        </View>
      </View>

      {/* 7-Day Activity Calendar Row */}
      <View className="flex-row justify-between items-center bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
        {activity.map((item, idx) => (
          <View key={idx} className="items-center">
            <Text className="text-slate-400 text-[11px] font-bold font-inter mb-1.5">
              {item.day}
            </Text>
            <View
              className={`w-9 h-9 rounded-2xl items-center justify-center border ${
                item.isActive
                  ? 'bg-rose-500 border-rose-600 shadow-xs'
                  : item.isToday
                  ? 'bg-white border-purple-300'
                  : 'bg-white border-slate-200'
              }`}
            >
              {item.isActive ? (
                <Ionicons name="flame" size={16} color="#FFFFFF" />
              ) : item.isToday ? (
                <View className="w-2.5 h-2.5 rounded-full bg-primary" />
              ) : (
                <View className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default WeeklyActivityCard;
