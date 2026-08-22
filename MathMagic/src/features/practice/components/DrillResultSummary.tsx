import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DrillResultData, PracticeLevelItem } from '../types/practice.types';

interface DrillResultSummaryProps {
  result: DrillResultData | null;
  level: PracticeLevelItem | null;
  exerciseTitle?: string;
  onRetry: () => void;
  onClose: () => void;
  onNextLevel?: () => void;
  hasNextLevel?: boolean;
}

export const DrillResultSummary: React.FC<DrillResultSummaryProps> = ({
  result,
  level,
  exerciseTitle = 'Exercise',
  onRetry,
  onClose,
  onNextLevel,
  hasNextLevel = false,
}) => {
  if (!result) return null;

  const passed = result.passed;
  const score = result.score || 0;
  const passingScore = level?.passingScore || 70;

  const formatTotalTime = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <View className="items-center px-4 py-6">
      {/* Top Trophy / Medal Icon */}
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

      <Text className="text-slate-900 text-2xl font-black text-center font-inter tracking-tight">
        {passed ? 'Drill Completed' : 'Keep Practicing'}
      </Text>

      <Text className="text-slate-500 text-xs font-semibold text-center font-inter mt-1 mb-5">
        {exerciseTitle} • {level?.title || `Level ${level?.number}`}
      </Text>

      {/* Main Score Card */}
      <View className="w-full bg-slate-50 rounded-3xl p-5 border border-slate-200 mb-5">
        <View className="flex-row items-center justify-around mb-4">
          <View className="items-center">
            <Text className="text-slate-400 text-[10px] font-black uppercase font-inter">
              Your Score
            </Text>
            <Text
              className={`text-3xl font-black font-inter ${
                passed ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {score}%
            </Text>
          </View>

          <View className="h-10 w-[1px] bg-slate-200" />

          <View className="items-center">
            <Text className="text-slate-400 text-[10px] font-black uppercase font-inter">
              Pass Target
            </Text>
            <Text className="text-3xl font-black text-slate-700 font-inter">
              {passingScore}%
            </Text>
          </View>
        </View>

        {/* Detailed Metrics Grid */}
        <View className="pt-3 border-t border-slate-200 flex-row justify-between">
          <View className="items-center flex-1">
            <Text className="text-slate-400 text-[10px] font-bold uppercase font-inter">Correct</Text>
            <Text className="text-slate-800 text-sm font-black font-inter mt-0.5">
              {result.totalCorrect} / {result.totalQuestions}
            </Text>
          </View>

          <View className="items-center flex-1">
            <Text className="text-slate-400 text-[10px] font-bold uppercase font-inter">Time</Text>
            <Text className="text-slate-800 text-sm font-black font-inter mt-0.5">
              {formatTotalTime(result.totalTimeMs)}
            </Text>
          </View>

          <View className="items-center flex-1">
            <Text className="text-slate-400 text-[10px] font-bold uppercase font-inter">XP Earned</Text>
            <Text className="text-amber-600 text-sm font-black font-inter mt-0.5">
              +{result.xpEarned} XP
            </Text>
          </View>
        </View>
      </View>

      {/* Unlock Alert */}
      {passed ? (
        <View className="w-full bg-emerald-50 rounded-2xl p-3.5 border border-emerald-200 mb-6 flex-row items-center gap-2">
          <Ionicons name="lock-open-outline" size={18} color="#059669" />
          <Text className="text-emerald-900 text-xs font-bold font-inter flex-1">
            Next Practice Level is now Unlocked
          </Text>
        </View>
      ) : (
        <View className="w-full bg-rose-50 rounded-2xl p-3.5 border border-rose-200 mb-6">
          <Text className="text-rose-900 text-xs font-medium text-center font-inter">
            Score at least {passingScore}% to unlock the next level. Try again!
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View className="w-full gap-y-2.5">
        {passed && hasNextLevel && onNextLevel && (
          <TouchableOpacity
            onPress={onNextLevel}
            activeOpacity={0.85}
            className="w-full py-4 rounded-2xl bg-primary items-center justify-center flex-row gap-2 shadow-sm"
          >
            <Text className="text-white font-black text-sm font-inter">
              Next Level
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
          <Ionicons name="refresh" size={16} color={passed ? '#475569' : '#FFF'} />
          <Text
            className={`font-black text-sm font-inter ${
              passed ? 'text-slate-700' : 'text-white'
            }`}
          >
            Practice Again
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onClose}
          activeOpacity={0.7}
          className="w-full py-3 items-center justify-center"
        >
          <Text className="text-slate-400 font-bold text-xs font-inter">
            Back to Practice
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DrillResultSummary;
