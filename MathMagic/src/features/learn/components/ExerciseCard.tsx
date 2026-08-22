import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ExerciseItem } from '../types/learn.types';

interface ExerciseCardProps {
  exercise: ExerciseItem;
  index: number;
  onPress: () => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  index,
  onPress,
}) => {
  const isLocked = exercise.status === 'locked';
  const isCompleted = exercise.status === 'completed';
  const isInProgress = exercise.status === 'in_progress';

  const minScore = exercise.completionRequirement?.minScore || 80;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isLocked}
      activeOpacity={0.8}
      className={`rounded-3xl p-5 mb-3.5 border shadow-sm ${
        isLocked
          ? 'bg-slate-50/80 border-slate-200 opacity-60'
          : 'bg-white border-slate-100'
      }`}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3 flex-1 mr-3">
          {/* Index Circle */}
          <View
            className={`w-11 h-11 rounded-2xl items-center justify-center ${
              isLocked
                ? 'bg-slate-200'
                : isCompleted
                ? 'bg-emerald-100'
                : 'bg-purple-100'
            }`}
          >
            {isCompleted ? (
              <Ionicons name="checkmark" size={20} color="#059669" />
            ) : isLocked ? (
              <Ionicons name="lock-closed" size={18} color="#94A3B8" />
            ) : (
              <Text className="text-primary font-black text-sm font-inter">
                {index + 1}
              </Text>
            )}
          </View>

          <View className="flex-1">
            <Text
              numberOfLines={1}
              className={`text-base font-black font-inter tracking-tight ${
                isLocked ? 'text-slate-500' : 'text-slate-900'
              }`}
            >
              {exercise.title}
            </Text>
            {exercise.description ? (
              <Text
                numberOfLines={1}
                className="text-slate-400 text-xs font-semibold font-inter mt-0.5"
              >
                {exercise.description}
              </Text>
            ) : (
              <Text className="text-slate-400 text-[11px] font-medium font-inter mt-0.5">
                Pass requirement: {minScore}%
              </Text>
            )}
          </View>
        </View>

        {/* Action Button */}
        <View
          className={`px-3.5 py-2 rounded-2xl flex-row items-center gap-1.5 ${
            isLocked
              ? 'bg-slate-100'
              : isCompleted
              ? 'bg-emerald-50 border border-emerald-200'
              : 'bg-primary'
          }`}
        >
          <Text
            className={`text-xs font-bold font-inter ${
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
              ? 'Review'
              : isInProgress
              ? 'Resume'
              : 'Start'}
          </Text>
          {!isLocked && (
            <Ionicons
              name={isCompleted ? 'eye-outline' : 'arrow-forward'}
              size={13}
              color={isCompleted ? '#059669' : '#FFF'}
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ExerciseCard;
