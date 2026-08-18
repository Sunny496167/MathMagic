import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Lesson } from '../types/learn.types';

interface LessonCardProps {
  lesson: Lesson;
  isCompleted: boolean;
  onPress: () => void;
}

export const LessonCard = ({ lesson, isCompleted, onPress }: LessonCardProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className="bg-white border border-primary/5 rounded-[28px] p-5 shadow-sm active:scale-98 transition-all mb-4"
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="bg-primary/10 px-3 py-1 rounded-full">
          <Text className="text-primary font-bold text-[10px] uppercase font-inter">
            {lesson.category}
          </Text>
        </View>
        {isCompleted ? (
          <View className="flex-row items-center bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
            <Ionicons name="checkmark-circle" size={14} color="#10B981" />
            <Text className="text-green-700 text-[10px] font-bold font-inter ml-1">Mastered</Text>
          </View>
        ) : (
          <View className="flex-row items-center bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full">
            <Ionicons name="time-outline" size={14} color="#64748B" />
            <Text className="text-slate-600 text-[10px] font-bold font-inter ml-1">5 min read</Text>
          </View>
        )}
      </View>

      <Text className="text-slate-800 text-lg font-bold font-inter mb-1.5">{lesson.title}</Text>
      <Text className="text-slate-500 text-xs font-inter leading-relaxed" numberOfLines={2}>
        {lesson.description}
      </Text>

      <View className="mt-4 pt-3 border-t border-slate-100 flex-row justify-between items-center">
        <Text className="text-primary font-bold text-xs font-inter font-mono">
          {lesson.formula}
        </Text>
        <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
      </View>
    </TouchableOpacity>
  );
};

export default LessonCard;
