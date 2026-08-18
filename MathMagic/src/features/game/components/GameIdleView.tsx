import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserStats } from '../../../types';

interface GameIdleViewProps {
  stats: UserStats;
  onStartGame: () => void;
}

export const GameIdleView = ({ stats, onStartGame }: GameIdleViewProps) => {
  return (
    <View className="flex-1 px-6 justify-center items-center">
      <View className="w-24 h-24 bg-[#FEF3C7] border border-[#FDE68A] rounded-[32px] items-center justify-center mb-6 shadow-sm">
        <Ionicons name="flash" size={44} color="#D97706" />
      </View>

      <Text className="text-2xl font-bold text-slate-800 text-center font-inter">
        Speed Math Challenge
      </Text>
      <Text className="text-slate-500 text-xs text-center mt-2 px-8 font-inter leading-relaxed">
        Solve as many basic math operations as you can in 60 seconds!
      </Text>

      {/* High score box */}
      <View className="bg-white border border-primary/10 rounded-2xl px-6 py-3 my-6 flex-row items-center shadow-sm">
        <Ionicons name="trophy" size={20} color="#8B5CF6" />
        <Text className="text-slate-700 font-bold text-sm font-inter ml-2">
          Personal Best: <Text className="text-primary font-extrabold">{stats.highScore} Solved</Text>
        </Text>
      </View>

      <TouchableOpacity
        onPress={onStartGame}
        activeOpacity={0.8}
        className="w-full bg-primary py-4 rounded-2xl items-center shadow-md active:scale-95 transition-all"
      >
        <Text className="text-white font-bold text-base font-inter tracking-wider">
          START GAME ⚡
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default GameIdleView;
