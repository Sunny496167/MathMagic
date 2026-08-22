import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PracticeExerciseItem, PracticeLevelItem } from '../types/practice.types';
import PracticeLevelRow from './PracticeLevelRow';

interface PracticeExerciseGroupProps {
  item: PracticeExerciseItem;
  onSelectLevel: (level: PracticeLevelItem, exerciseTitle: string) => void;
}

export const PracticeExerciseGroup: React.FC<PracticeExerciseGroupProps> = ({
  item,
  onSelectLevel,
}) => {
  const levels = item.levels || [];
  const completedLevels = levels.filter((l) => l.status === 'completed').length;

  return (
    <View className="bg-white rounded-3xl p-5 mb-4 border border-slate-100 shadow-sm">
      {/* Group Header */}
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1 mr-2">
          {/* Topic Category Tag */}
          <View className="flex-row items-center gap-1.5 mb-1">
            <View
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: item.topicColor || '#8B5CF6' }}
            />
            <Text
              className="text-[10px] font-black uppercase tracking-wider font-inter"
              style={{ color: item.topicColor || '#8B5CF6' }}
            >
              {item.topicTitle}
            </Text>
          </View>

          <Text className="text-slate-900 text-base font-black font-inter tracking-tight">
            {item.exerciseTitle}
          </Text>
          {item.exerciseDescription ? (
            <Text className="text-slate-400 text-xs font-semibold font-inter mt-0.5" numberOfLines={1}>
              {item.exerciseDescription}
            </Text>
          ) : null}
        </View>

        <View className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full flex-row items-center gap-1">
          <Ionicons name="trophy" size={12} color="#8B5CF6" />
          <Text className="text-slate-700 text-[10px] font-black font-inter">
            {completedLevels} / {levels.length} Levels
          </Text>
        </View>
      </View>

      {/* Levels List */}
      <View className="pt-2 border-t border-slate-100">
        {levels.length === 0 ? (
          <View className="py-4 items-center justify-center">
            <Text className="text-slate-400 text-xs font-medium font-inter">
              No practice drill levels configured for this exercise.
            </Text>
          </View>
        ) : (
          levels.map((lvl) => (
            <PracticeLevelRow
              key={lvl._id}
              level={lvl}
              onPress={() => onSelectLevel(lvl, item.exerciseTitle)}
            />
          ))
        )}
      </View>
    </View>
  );
};

export default PracticeExerciseGroup;
