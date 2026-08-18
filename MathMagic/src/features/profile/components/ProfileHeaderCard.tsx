import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserProfile } from '../../../types';

interface ProfileHeaderCardProps {
  user: UserProfile | null;
  level: number;
  currentXpInLevel: number;
  xpProgressPercent: number;
}

export const ProfileHeaderCard = ({
  user,
  level,
  currentXpInLevel,
  xpProgressPercent,
}: ProfileHeaderCardProps) => {
  return (
    <View className="bg-primary rounded-[32px] p-6 mb-6 shadow-md relative overflow-hidden">
      <View className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-white/10" />
      <View className="absolute -left-12 -bottom-12 w-32 h-32 rounded-full bg-white/5" />

      <View className="flex-row items-center mb-5">
        <View className="w-14 h-14 rounded-2xl bg-white/20 items-center justify-center mr-4">
          <Ionicons name="person" size={28} color="#FFFFFF" />
        </View>
        <View className="flex-1">
          <Text className="text-white text-lg font-bold font-inter">
            {user?.name || 'Math Learner'}
          </Text>
          <Text className="text-white/80 text-xs font-inter mt-0.5" numberOfLines={1}>
            {user?.email || 'mathlearner@gmail.com'}
          </Text>
        </View>
      </View>

      <View className="border-t border-white/10 pt-4">
        <View className="flex-row justify-between items-center mb-2">
          <View className="bg-white/20 px-3 py-1 rounded-full border border-white/10">
            <Text className="text-white font-bold text-[10px] uppercase font-inter">
              Level {level}
            </Text>
          </View>
          <Text className="text-white/90 font-bold text-xs font-inter">
            {currentXpInLevel} / 100 XP
          </Text>
        </View>
        <View className="h-2.5 bg-white/20 rounded-full overflow-hidden">
          <View style={{ width: `${xpProgressPercent}%` }} className="h-full bg-white rounded-full" />
        </View>
      </View>
    </View>
  );
};

export default ProfileHeaderCard;
