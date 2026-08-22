import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ExerciseCompletionResult } from '../types/learn.types';

interface ExerciseCompleteModalProps {
  visible: boolean;
  result: ExerciseCompletionResult | null;
  exerciseTitle?: string;
  onNextExercise?: () => void;
  onRetry: () => void;
  onClose: () => void;
  hasNextExercise?: boolean;
}

export const ExerciseCompleteModal: React.FC<ExerciseCompleteModalProps> = ({
  visible,
  result,
  exerciseTitle = 'Exercise',
  onNextExercise,
  onRetry,
  onClose,
  hasNextExercise = false,
}) => {
  if (!visible || !result) return null;

  const passed = result.passed !== false && result.success !== false;
  const score = typeof result.score === 'number' ? result.score : 0;
  const reqScore = result.requiredScore || 80;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-slate-900/70 justify-center items-center px-6">
        <View className="w-full bg-white rounded-3xl p-6 items-center shadow-2xl border border-slate-100 max-w-sm">
          {/* Top Badge Icon */}
          <View
            className={`w-20 h-20 rounded-full items-center justify-center mb-4 shadow-md ${
              passed ? 'bg-amber-50 border-4 border-amber-200' : 'bg-rose-50 border-4 border-rose-200'
            }`}
          >
            <Ionicons
              name={passed ? 'trophy' : 'refresh-circle'}
              size={38}
              color={passed ? '#D97706' : '#E11D48'}
            />
          </View>

          {/* Heading */}
          <Text className="text-slate-900 text-2xl font-black text-center font-inter tracking-tight">
            {passed ? 'Mastery Achieved' : 'Keep Going'}
          </Text>

          <Text className="text-slate-500 text-xs font-semibold text-center font-inter mt-1 mb-5">
            {exerciseTitle}
          </Text>

          {/* Score Stats Card */}
          <View className="w-full bg-slate-50 rounded-2xl p-4 border border-slate-200 mb-5">
            <View className="flex-row items-center justify-around">
              <View className="items-center">
                <Text className="text-slate-400 text-[10px] font-black uppercase font-inter">
                  Your Score
                </Text>
                <Text
                  className={`text-2xl font-black font-inter ${
                    passed ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {score}%
                </Text>
              </View>

              <View className="h-8 w-[1px] bg-slate-200" />

              <View className="items-center">
                <Text className="text-slate-400 text-[10px] font-black uppercase font-inter">
                  Pass Target
                </Text>
                <Text className="text-2xl font-black text-slate-700 font-inter">
                  {reqScore}%
                </Text>
              </View>
            </View>
          </View>

          {/* Unlock Alerts */}
          {passed ? (
            <View className="w-full bg-emerald-50 rounded-2xl p-3.5 border border-emerald-200 mb-6 gap-y-2">
              <View className="flex-row items-center gap-2">
                <Ionicons name="lock-open-outline" size={16} color="#059669" />
                <Text className="text-emerald-900 text-xs font-bold font-inter flex-1">
                  Next Exercise is now Unlocked
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Ionicons name="calculator-outline" size={16} color="#059669" />
                <Text className="text-emerald-900 text-xs font-bold font-inter flex-1">
                  Practice Drill Levels Unlocked in Practice Tab
                </Text>
              </View>
            </View>
          ) : (
            <View className="w-full bg-rose-50 rounded-2xl p-3.5 border border-rose-200 mb-6">
              <Text className="text-rose-900 text-xs font-medium text-center font-inter">
                You need at least {reqScore}% to unlock the next exercise and practice drills. Review the concepts and try again.
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View className="w-full gap-y-2.5">
            {passed && hasNextExercise && onNextExercise && (
              <TouchableOpacity
                onPress={onNextExercise}
                activeOpacity={0.85}
                className="w-full py-4 rounded-2xl bg-primary items-center justify-center flex-row gap-2 shadow-sm"
              >
                <Text className="text-white font-black text-sm font-inter">
                  Next Exercise
                </Text>
                <Ionicons name="arrow-forward" size={16} color="#FFF" />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={onRetry}
              activeOpacity={0.85}
              className={`w-full py-3.5 rounded-2xl items-center justify-center flex-row gap-2 ${
                passed ? 'bg-slate-100' : 'bg-primary shadow-sm'
              }`}
            >
              <Ionicons
                name="refresh"
                size={16}
                color={passed ? '#475569' : '#FFF'}
              />
              <Text
                className={`font-black text-sm font-inter ${
                  passed ? 'text-slate-700' : 'text-white'
                }`}
              >
                {passed ? 'Practice Again' : 'Try Again'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.7}
              className="w-full py-3 items-center justify-center"
            >
              <Text className="text-slate-400 font-bold text-xs font-inter">
                Back to Topics
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ExerciseCompleteModal;
