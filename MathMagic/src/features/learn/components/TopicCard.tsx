import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TopicItem } from '../types/learn.types';

interface TopicCardProps {
  topic: TopicItem;
  onPress: () => void;
}

export const TopicCard: React.FC<TopicCardProps> = ({ topic, onPress }) => {
  const isLocked = topic.status === 'locked';
  const isCompleted = topic.status === 'completed';
  const isInProgress = topic.status === 'in_progress';

  const completedCount = topic.completedExercises || 0;
  const totalCount = topic.totalExercises || 0;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const topicColor = topic.color || '#8B5CF6';

  const getStatusBadge = () => {
    if (isCompleted) {
      return (
        <View className="bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex-row items-center gap-1">
          <Ionicons name="checkmark-circle" size={12} color="#059669" />
          <Text className="text-emerald-700 text-[10px] font-black uppercase font-inter">
            Mastered
          </Text>
        </View>
      );
    }
    if (isInProgress) {
      return (
        <View className="bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-full flex-row items-center gap-1">
          <Ionicons name="time" size={12} color="#7C3AED" />
          <Text className="text-purple-700 text-[10px] font-black uppercase font-inter">
            In Progress
          </Text>
        </View>
      );
    }
    if (isLocked) {
      return (
        <View className="bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full flex-row items-center gap-1">
          <Ionicons name="lock-closed" size={12} color="#64748B" />
          <Text className="text-slate-500 text-[10px] font-black uppercase font-inter">
            Locked
          </Text>
        </View>
      );
    }
    return (
      <View className="bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full flex-row items-center gap-1">
        <Ionicons name="sparkles" size={12} color="#2563EB" />
        <Text className="text-blue-700 text-[10px] font-black uppercase font-inter">
          Start Here
        </Text>
      </View>
    );
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isLocked}
      activeOpacity={0.8}
      className={`rounded-3xl p-5 mb-4 border shadow-sm transition-all ${
        isLocked
          ? 'bg-slate-50/80 border-slate-200 opacity-60'
          : 'bg-white border-slate-100'
      }`}
    >
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-row items-center gap-3 flex-1 mr-2">
          <View
            className="w-12 h-12 rounded-2xl items-center justify-center shadow-sm"
            style={{ backgroundColor: isLocked ? '#E2E8F0' : `${topicColor}18` }}
          >
            <Ionicons
              name={
                isLocked
                  ? 'lock-closed'
                  : isCompleted
                  ? 'ribbon'
                  : (topic.icon as any) || 'calculator'
              }
              size={22}
              color={isLocked ? '#94A3B8' : topicColor}
            />
          </View>

          <View className="flex-1">
            <Text
              numberOfLines={1}
              className={`text-base font-black font-inter tracking-tight ${
                isLocked ? 'text-slate-500' : 'text-slate-900'
              }`}
            >
              {topic.title}
            </Text>
            {topic.description ? (
              <Text
                numberOfLines={1}
                className="text-slate-400 text-xs font-semibold font-inter mt-0.5"
              >
                {topic.description}
              </Text>
            ) : null}
          </View>
        </View>

        {getStatusBadge()}
      </View>

      {/* Exercise Progress Bar */}
      {!isLocked && (
        <View className="mt-2 pt-3 border-t border-slate-100">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-slate-500 text-xs font-bold font-inter">
              {completedCount} / {totalCount} Exercises Mastered
            </Text>
            <Text className="text-slate-700 text-xs font-black font-inter">
              {Math.round(progressPercent)}%
            </Text>
          </View>

          <View className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <View
              className="h-full rounded-full"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: isCompleted ? '#10B981' : topicColor,
              }}
            />
          </View>
        </View>
      )}

      {isLocked && (
        <View className="mt-2 pt-2 border-t border-slate-200/60 flex-row items-center gap-1.5">
          <Ionicons name="information-circle-outline" size={14} color="#94A3B8" />
          <Text className="text-slate-400 text-[11px] font-medium font-inter">
            Complete previous topic exercises to unlock
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default TopicCard;
