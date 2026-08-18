import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import SafeScreen from '../../components/common/SafeScreen';
import { LessonCard } from './components/LessonCard';
import { LessonDetailModal } from './components/LessonDetailModal';
import { useLessonProgress } from './hooks/useLessonProgress';
import { LessonCategoryFilter } from './types/learn.types';

export const LearnScreen = () => {
  const {
    stats,
    selectedLesson,
    selectedCategory,
    quizInput,
    setQuizInput,
    quizFeedback,
    filteredLessons,
    handleOpenLesson,
    handleCloseLesson,
    handleCategorySelect,
    handleQuizSubmit,
    loadStats,
  } = useLessonProgress();

  useFocusEffect(
    React.useCallback(() => {
      loadStats();
    }, [])
  );

  return (
    <SafeScreen>
      <View className="flex-1 bg-background">
        {/* Header */}
        <View className="px-6 py-5 border-b border-primary/5 bg-white flex-row justify-between items-center">
          <View>
            <Text className="text-text-primary text-2xl font-bold tracking-tight">
              Math Concepts
            </Text>
            <Text className="text-text-secondary text-xs mt-0.5">
              Learn formulas, rules and logic
            </Text>
          </View>
          <TouchableOpacity className="w-10 h-10 bg-slate-50 border border-primary/5 rounded-full justify-center items-center">
            <Ionicons name="book-outline" size={18} color="#8B5CF6" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-6 py-5" showsVerticalScrollIndicator={false}>
          {/* Progress Overview Card */}
          <View className="bg-primary rounded-[32px] p-6 mb-6 shadow-md relative overflow-hidden">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-white text-base font-bold font-inter">Mastery Progress</Text>
              <Text className="text-white/80 font-bold text-xs font-inter">
                {stats.completedLessons.length} / {filteredLessons.length} Mastered
              </Text>
            </View>
            <View className="h-2.5 bg-white/20 rounded-full overflow-hidden">
              <View
                style={{
                  width: `${Math.min((stats.completedLessons.length / Math.max(filteredLessons.length, 1)) * 100, 100)}%`,
                }}
                className="h-full bg-white rounded-full"
              />
            </View>
          </View>

          {/* Category Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
            {(['All', 'Basics', 'Algebra', 'Fractions', 'Geometry'] as LessonCategoryFilter[]).map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => handleCategorySelect(cat)}
                className={`mr-2.5 px-4 py-2 rounded-2xl border ${
                  selectedCategory === cat
                    ? 'bg-primary border-primary'
                    : 'bg-white border-slate-200'
                }`}
              >
                <Text
                  className={`text-xs font-bold font-inter ${
                    selectedCategory === cat ? 'text-white' : 'text-slate-600'
                  }`}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Lessons List */}
          <View className="mb-10">
            {filteredLessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                isCompleted={stats.completedLessons.includes(lesson.id)}
                onPress={() => handleOpenLesson(lesson)}
              />
            ))}
          </View>
        </ScrollView>

        {/* Lesson Detail Modal */}
        <LessonDetailModal
          lesson={selectedLesson}
          onClose={handleCloseLesson}
          quizInput={quizInput}
          onChangeQuizInput={setQuizInput}
          onQuizSubmit={handleQuizSubmit}
          quizFeedback={quizFeedback}
        />
      </View>
    </SafeScreen>
  );
};

export default LearnScreen;
