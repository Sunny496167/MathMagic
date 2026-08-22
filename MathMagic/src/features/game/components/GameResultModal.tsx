import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GameResultData } from '../types/game.types';

interface GameResultModalProps {
  result: GameResultData | null;
  gameTitle: string;
  onReplay: () => void;
  onClose: () => void;
}

export const GameResultModal: React.FC<GameResultModalProps> = ({
  result,
  gameTitle,
  onReplay,
  onClose,
}) => {
  if (!result) return null;

  const stars = result.starsEarned || 1;
  const isHighScore = result.isHighScore;

  return (
    <View className="items-center px-4 py-6">
      {/* High Score Banner */}
      {isHighScore && (
        <View className="bg-amber-100 border border-amber-300 px-4 py-1.5 rounded-full mb-3 flex-row items-center gap-1.5">
          <Ionicons name="sparkles" size={14} color="#D97706" />
          <Text className="text-amber-900 text-xs font-black uppercase tracking-wider font-inter">
            New High Score Record!
          </Text>
        </View>
      )}

      {/* Star Podium */}
      <View className="flex-row items-center justify-center gap-2 mb-3">
        {[1, 2, 3].map((starNum) => {
          const isEarned = starNum <= stars;
          const isCenter = starNum === 2;
          return (
            <View
              key={starNum}
              className={`rounded-full items-center justify-center ${
                isCenter ? 'w-16 h-16' : 'w-12 h-12'
              } ${
                isEarned
                  ? 'bg-amber-50 border-2 border-amber-300 shadow-sm'
                  : 'bg-slate-100 border border-slate-200 opacity-40'
              }`}
            >
              <Ionicons
                name="star"
                size={isCenter ? 32 : 22}
                color={isEarned ? '#F59E0B' : '#94A3B8'}
              />
            </View>
          );
        })}
      </View>

      <Text className="text-slate-900 text-2xl font-black text-center font-inter tracking-tight">
        {stars >= 3 ? 'Outstanding Victory!' : stars >= 2 ? 'Great Game!' : 'Game Over'}
      </Text>

      <Text className="text-slate-500 text-xs font-semibold text-center font-inter mt-0.5 mb-5">
        {gameTitle} Challenge
      </Text>

      {/* Main Score & Metrics Card */}
      <View className="w-full bg-slate-50 rounded-3xl p-5 border border-slate-200 mb-5">
        <View className="items-center mb-4">
          <Text className="text-slate-400 text-[10px] font-black uppercase font-inter">
            Final Score
          </Text>
          <Text className="text-4xl font-black text-primary font-inter mt-0.5">
            {result.score}
          </Text>
        </View>

        {/* Detailed Metrics */}
        <View className="pt-3 border-t border-slate-200 flex-row justify-between">
          <View className="items-center flex-1">
            <Text className="text-slate-400 text-[10px] font-bold uppercase font-inter">Accuracy</Text>
            <Text className="text-slate-800 text-sm font-black font-inter mt-0.5">
              {result.accuracy}%
            </Text>
          </View>

          <View className="items-center flex-1">
            <Text className="text-slate-400 text-[10px] font-bold uppercase font-inter">Max Combo</Text>
            <Text className="text-amber-600 text-sm font-black font-inter mt-0.5">
              {result.maxCombo}x
            </Text>
          </View>

          <View className="items-center flex-1">
            <Text className="text-slate-400 text-[10px] font-bold uppercase font-inter">XP Earned</Text>
            <Text className="text-emerald-600 text-sm font-black font-inter mt-0.5">
              +{result.xpEarned} XP
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="w-full gap-y-2.5">
        <TouchableOpacity
          onPress={onReplay}
          activeOpacity={0.85}
          className="w-full py-4 rounded-2xl bg-primary items-center justify-center flex-row gap-2 shadow-sm"
        >
          <Ionicons name="refresh" size={16} color="#FFF" />
          <Text className="text-white font-black text-sm font-inter">
            Play Again
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onClose}
          activeOpacity={0.7}
          className="w-full py-3 items-center justify-center"
        >
          <Text className="text-slate-400 font-bold text-xs font-inter">
            Choose Another Game
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default GameResultModal;
