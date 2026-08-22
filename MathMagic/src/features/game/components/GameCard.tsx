import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GameCardConfig } from '../types/game.types';

interface GameCardProps {
  game: GameCardConfig;
  onPress: () => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onPress }) => {
  const isLocked = !game.isUnlocked;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isLocked}
      activeOpacity={0.85}
      style={{ width: '48%' }}
      className={`rounded-3xl p-4 mb-4 border relative overflow-hidden ${
        isLocked
          ? 'bg-slate-50 border-slate-200 opacity-60'
          : 'bg-white border-slate-100 shadow-sm'
      }`}
    >
      {/* Top Icon & Lock Status */}
      <View className="flex-row items-center justify-between mb-3">
        <View
          className="w-12 h-12 rounded-2xl items-center justify-center shadow-xs"
          style={{ backgroundColor: `${game.color}15` }}
        >
          <Ionicons
            name={isLocked ? 'lock-closed' : (game.icon as any)}
            size={22}
            color={isLocked ? '#94A3B8' : game.color}
          />
        </View>

        {/* Stars */}
        {game.stars > 0 && !isLocked && (
          <View className="flex-row items-center gap-0.5 bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
            {Array.from({ length: game.stars }).map((_, idx) => (
              <Ionicons key={idx} name="star" size={11} color="#F59E0B" />
            ))}
          </View>
        )}
      </View>

      {/* Title & Subtitle */}
      <Text
        numberOfLines={1}
        className="text-slate-900 font-black text-base font-inter tracking-tight"
      >
        {game.title}
      </Text>

      <Text
        numberOfLines={1}
        className="text-xs font-bold font-inter mt-0.5 uppercase tracking-wider"
        style={{ color: isLocked ? '#94A3B8' : game.color }}
      >
        {game.subtitle}
      </Text>

      <Text
        numberOfLines={2}
        className="text-slate-400 text-[11px] font-medium font-inter mt-2 leading-relaxed h-8"
      >
        {isLocked
          ? `Complete ${game.requiredTopics} Topic${game.requiredTopics > 1 ? 's' : ''} in Learn Tab to unlock!`
          : game.description}
      </Text>

      {/* Footer: High Score or Play Button */}
      <View className="mt-3 pt-2.5 border-t border-slate-100 flex-row items-center justify-between">
        {game.highScore > 0 && !isLocked ? (
          <View className="flex-row items-center gap-1">
            <Ionicons name="trophy-outline" size={12} color="#D97706" />
            <Text className="text-slate-700 text-[11px] font-black font-inter">
              {game.highScore}
            </Text>
          </View>
        ) : (
          <Text className="text-slate-400 text-[10px] font-bold font-inter">
            {isLocked ? 'Locked' : 'Ready'}
          </Text>
        )}

        <View
          className={`w-7 h-7 rounded-xl items-center justify-center ${
            isLocked ? 'bg-slate-200' : 'bg-slate-900'
          }`}
        >
          <Ionicons
            name={isLocked ? 'lock-closed' : 'play'}
            size={12}
            color="#FFFFFF"
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default GameCard;
