import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PracticeLevelItem } from '../types/practice.types';

interface PracticeLevelRowProps {
  level: PracticeLevelItem;
  onPress: () => void;
}

export const PracticeLevelRow: React.FC<PracticeLevelRowProps> = ({ level, onPress }) => {
  const isLocked = level.status === 'locked';
  const isCompleted = level.status === 'completed';
  const isInProgress = level.status === 'in_progress';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isLocked}
      activeOpacity={0.8}
      className={`p-3.5 rounded-2xl border flex-row items-center justify-between mb-2.5 ${
        isLocked
          ? 'bg-slate-50/70 border-slate-200 opacity-60'
          : isCompleted
          ? 'bg-white border-emerald-200 shadow-xs'
          : 'bg-white border-purple-200 shadow-xs'
      }`}
    >
      <View className="flex-row items-center gap-3 flex-1 mr-2">
        {/* Level Number Pill */}
        <View
          className={`w-9 h-9 rounded-xl items-center justify-center ${
            isLocked
              ? 'bg-slate-200'
              : isCompleted
              ? 'bg-emerald-100'
              : 'bg-purple-100'
          }`}
        >
          {isCompleted ? (
            <Ionicons name="checkmark" size={18} color="#059669" />
          ) : isLocked ? (
            <Ionicons name="lock-closed" size={16} color="#94A3B8" />
          ) : (
            <Text className="text-primary font-black text-xs font-inter">
              L{level.number}
            </Text>
          )}
        </View>

        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text
              numberOfLines={1}
              className={`text-sm font-bold font-inter ${
                isLocked ? 'text-slate-500' : 'text-slate-900'
              }`}
            >
              {level.title || `Level ${level.number}`}
            </Text>

            {level.bestScore !== undefined && level.bestScore > 0 && (
              <View className="bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                <Text className="text-amber-700 text-[10px] font-black font-inter">
                  Best: {level.bestScore}%
                </Text>
              </View>
            )}
          </View>

          <Text className="text-slate-400 text-[11px] font-medium font-inter mt-0.5">
            {level.questionCount} Questions • Target: {level.passingScore}%
          </Text>
        </View>
      </View>

      {/* Action Button */}
      <View
        className={`px-3 py-1.5 rounded-xl flex-row items-center gap-1 ${
          isLocked
            ? 'bg-slate-100'
            : isCompleted
            ? 'bg-emerald-50 border border-emerald-200'
            : 'bg-primary'
        }`}
      >
        <Text
          className={`text-[11px] font-bold font-inter ${
            isLocked
              ? 'text-slate-400'
              : isCompleted
              ? 'text-emerald-700'
              : 'text-white'
          }`}
        >
          {isLocked
            ? 'Locked'
            : isCompleted
            ? 'Drill Again'
            : isInProgress
            ? 'Resume'
            : 'Start Drill'}
        </Text>
        {!isLocked && (
          <Ionicons
            name={isCompleted ? 'refresh' : 'arrow-forward'}
            size={12}
            color={isCompleted ? '#059669' : '#FFF'}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

export default PracticeLevelRow;
