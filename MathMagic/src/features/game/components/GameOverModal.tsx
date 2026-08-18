import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserStats } from '../../../types';

interface GameOverModalProps {
  visible: boolean;
  score: number;
  stats: UserStats;
  onPlayAgain: () => void;
  onClose: () => void;
}

export const GameOverModal = ({
  visible,
  score,
  stats,
  onPlayAgain,
  onClose,
}: GameOverModalProps) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/60 justify-center items-center px-6">
        <View className="bg-white w-full max-w-[340px] rounded-[32px] p-6 items-center shadow-xl">
          <View className="w-16 h-16 bg-[#FEF3C7] border border-[#FDE68A] rounded-full items-center justify-center mb-4">
            <Ionicons name="trophy" size={32} color="#D97706" />
          </View>

          <Text className="text-2xl font-bold text-slate-800 font-inter">Time's Up!</Text>
          <Text className="text-slate-500 text-xs mt-1 font-inter">Great effort solving math!</Text>

          <View className="my-6 bg-slate-50 border border-slate-100 rounded-2xl p-4 w-full items-center">
            <Text className="text-slate-400 text-xs font-bold uppercase font-inter">Your Score</Text>
            <Text className="text-4xl font-extrabold text-primary font-inter my-1">{score}</Text>
            <Text className="text-slate-500 text-[11px] font-inter">
              Personal Best: {Math.max(stats.highScore, score)}
            </Text>
          </View>

          <View className="w-full gap-y-3">
            <TouchableOpacity
              onPress={onPlayAgain}
              className="bg-primary py-3.5 rounded-2xl items-center shadow-sm active:scale-95"
            >
              <Text className="text-white font-bold text-sm font-inter">Play Again 🚀</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              className="bg-slate-100 py-3.5 rounded-2xl items-center"
            >
              <Text className="text-slate-600 font-bold text-sm font-inter">Back to Menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default GameOverModal;
