import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ContinueLessonData } from '../types/home.types';

interface ContinueLearningCardProps {
  lesson: ContinueLessonData | null;
  onPressResume: () => void;
}

export const ContinueLearningCard: React.FC<ContinueLearningCardProps> = ({
  lesson,
  onPressResume,
}) => {
  if (!lesson) {
    return (
      <View className="bg-purple-600 rounded-3xl p-6 mb-6 shadow-md relative overflow-hidden">
        <Text className="text-white/80 text-xs font-bold font-inter uppercase tracking-wider mb-1">
          Curriculum Ready
        </Text>
        <Text className="text-white text-xl font-black font-inter mb-4">
          Start Your Math Adventure!
        </Text>
        <TouchableOpacity
          onPress={onPressResume}
          activeOpacity={0.85}
          className="bg-white py-3.5 px-5 rounded-2xl items-center flex-row justify-center gap-2 self-start shadow-sm"
        >
          <Ionicons name="play" size={16} color="#8B5CF6" />
          <Text className="text-primary font-black text-sm font-inter">
            Open Learn Tab
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      style={{ backgroundColor: '#8B5CF6' }}
      className="rounded-3xl p-6 mb-6 shadow-md relative overflow-hidden"
    >
      {/* Background Decorative Rings */}
      <View className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/10" />
      <View className="absolute -right-2 -bottom-10 w-28 h-28 rounded-full bg-white/10" />

      {/* Badge */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="bg-white/20 px-3 py-1 rounded-full flex-row items-center gap-1.5 self-start">
          <Ionicons name="sparkles" size={12} color="#FFFFFF" />
          <Text className="text-white text-[11px] font-black uppercase tracking-wider font-inter">
            {lesson.isCompleted ? 'Review Lesson' : 'Continue Where You Left Off'}
          </Text>
        </View>

        <Text className="text-white/80 text-xs font-bold font-inter">
          Subtopic {lesson.subtopicNumber}
        </Text>
      </View>

      {/* Topic Title */}
      <Text className="text-white/90 text-xs font-bold font-inter uppercase tracking-wider">
        {lesson.topicTitle}
      </Text>

      {/* Exercise Title */}
      <Text
        numberOfLines={2}
        className="text-white text-xl font-black font-inter tracking-tight mt-0.5 mb-4 leading-snug"
      >
        {lesson.exerciseTitle}
      </Text>

      {/* Resume Button */}
      <TouchableOpacity
        onPress={onPressResume}
        activeOpacity={0.85}
        className="bg-white py-3.5 px-6 rounded-2xl items-center flex-row justify-center gap-2 self-start shadow-sm"
      >
        <Ionicons name="play" size={16} color="#8B5CF6" />
        <Text className="text-primary font-black text-sm font-inter">
          {lesson.isCompleted ? 'Review Lesson' : 'Resume Lesson'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ContinueLearningCard;
