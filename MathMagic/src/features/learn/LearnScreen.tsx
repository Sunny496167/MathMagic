import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import SafeScreen from '../../components/common/SafeScreen';
import { useAuth } from '../../context/AuthContext';
import { TopicCard } from './components/TopicCard';
import { ExerciseCard } from './components/ExerciseCard';
import { ExerciseDetailModal } from './components/ExerciseDetailModal';
import { useLearnCurriculum } from './hooks/useLearnCurriculum';

export const LearnScreen = () => {
  const { user } = useAuth();
  const {
    loadingTopics,
    topics,
    activeTopic,
    activeGradeName,
    loadingExercises,
    exercises,
    selectedExercise,
    loadTopics,
    handleSelectTopic,
    handleBackToTopics,
    handleSelectExercise,
    handleCloseExercise,
  } = useLearnCurriculum();

  useFocusEffect(
    React.useCallback(() => {
      loadTopics();
    }, [loadTopics])
  );

  // Compute overall grade completion
  const completedTopics = topics.filter((t) => t.status === 'completed').length;
  const totalTopics = topics.length;
  const overallProgress = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;

  const currentGradeTitle =
    activeGradeName ||
    user?.selectedGrade?.name ||
    (typeof user?.selectedGrade === 'string' ? 'Grade 1' : 'Grade 1');

  return (
    <SafeScreen>
      <View className="flex-1 bg-background">
        {/* Top Header */}
        <View className="px-6 py-5 border-b border-primary/5 bg-white flex-row justify-between items-center">
          <View className="flex-1 mr-3">
            <Text className="text-text-primary text-2xl font-black tracking-tight font-inter">
              {activeTopic ? activeTopic.title : 'Math Curriculum'}
            </Text>
            <Text className="text-text-secondary text-xs font-semibold font-inter mt-0.5">
              {activeTopic
                ? `${exercises.length} Step-by-Step Exercises`
                : `${currentGradeTitle} • Step-by-Step Concept Mastery`}
            </Text>
          </View>

          {activeTopic ? (
            <TouchableOpacity
              onPress={handleBackToTopics}
              activeOpacity={0.8}
              className="px-3.5 py-2 bg-slate-100 rounded-2xl flex-row items-center gap-1.5"
            >
              <Ionicons name="arrow-back" size={14} color="#475569" />
              <Text className="text-slate-700 font-bold text-xs font-inter">
                Topics
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={loadTopics}
              activeOpacity={0.8}
              className="w-10 h-10 bg-slate-50 border border-primary/5 rounded-full justify-center items-center"
            >
              <Ionicons name="refresh" size={18} color="#8B5CF6" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          className="flex-1 px-6 py-5"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80 }}
          refreshControl={
            <RefreshControl
              refreshing={loadingTopics || loadingExercises}
              onRefresh={loadTopics}
              tintColor="#8B5CF6"
            />
          }
        >
          {/* Main View: Topic List vs Topic Exercises */}
          {!activeTopic ? (
            <>
              {/* Overall Progress Banner */}
              <View
                style={{ backgroundColor: '#8B5CF6' }}
                className="rounded-2xl p-5 mb-6 shadow-md relative overflow-hidden"
              >
                <View className="flex-row justify-between items-center mb-3">
                  <View className="flex-row items-center gap-2">
                    <View className="w-7 h-7 rounded-lg bg-white/20 items-center justify-center">
                      <Ionicons name="school" size={16} color="#FFFFFF" />
                    </View>
                    <Text className="text-white text-base font-black font-inter">
                      {currentGradeTitle} Progress
                    </Text>
                  </View>
                  <Text className="text-white font-bold text-xs font-inter bg-white/20 px-2.5 py-1 rounded-full">
                    {completedTopics} / {totalTopics} Mastered
                  </Text>
                </View>

                <View className="h-2.5 bg-white/30 rounded-full overflow-hidden mt-1">
                  <View
                    style={{
                      width: `${Math.min(overallProgress, 100)}%`,
                      backgroundColor: '#FFFFFF',
                    }}
                    className="h-full rounded-full"
                  />
                </View>
              </View>

              {/* Section Header */}
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-text-primary text-lg font-black font-inter">
                  Learning Topics
                </Text>
                <Text className="text-text-secondary text-xs font-semibold font-inter">
                  Sequential Progression
                </Text>
              </View>

              {/* Topics List */}
              {loadingTopics && topics.length === 0 ? (
                <View className="py-12 items-center justify-center">
                  <ActivityIndicator size="large" color="#8B5CF6" />
                  <Text className="text-slate-400 text-xs font-bold font-inter mt-3">
                    Loading curriculum topics...
                  </Text>
                </View>
              ) : topics.length === 0 ? (
                <View className="bg-white rounded-3xl p-8 items-center justify-center border border-slate-100 mt-4">
                  <Ionicons name="book-outline" size={36} color="#94A3B8" />
                  <Text className="text-slate-800 text-base font-bold font-inter mt-3">
                    No Topics Found
                  </Text>
                  <Text className="text-slate-400 text-xs text-center font-inter mt-1">
                    Select an enabled grade or ask the administrator to publish curriculum topics.
                  </Text>
                </View>
              ) : (
                topics.map((topic) => (
                  <TopicCard
                    key={topic._id}
                    topic={topic}
                    onPress={() => handleSelectTopic(topic)}
                  />
                ))
              )}
            </>
          ) : (
            <>
              {/* Active Topic Banner */}
              <View
                className="rounded-xl p-5 mb-5 border shadow-sm"
                style={{
                  backgroundColor: `${activeTopic.color || '#8B5CF6'}12`,
                  borderColor: `${activeTopic.color || '#8B5CF6'}25`,
                }}
              >
                <View className="flex-row items-center gap-2 mb-1">
                  <Ionicons
                    name={(activeTopic.icon as any) || 'book'}
                    size={18}
                    color={activeTopic.color || '#8B5CF6'}
                  />
                  <Text
                    className="font-black text-xs uppercase tracking-wider font-inter"
                    style={{ color: activeTopic.color || '#8B5CF6' }}
                  >
                    Topic Progression
                  </Text>
                </View>
                <Text className="text-slate-900 text-xl font-black font-inter">
                  {activeTopic.title}
                </Text>
                {activeTopic.description ? (
                  <Text className="text-slate-600 text-xs font-medium font-inter mt-1 leading-relaxed">
                    {activeTopic.description}
                  </Text>
                ) : null}
              </View>

              {/* Exercises List Header */}
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-text-primary text-base font-black font-inter">
                  Exercises in this Topic
                </Text>
                <Text className="text-text-secondary text-xs font-semibold font-inter">
                  {exercises.filter((e) => e.status === 'completed').length} / {exercises.length} Done
                </Text>
              </View>

              {/* Exercises List */}
              {loadingExercises ? (
                <View className="py-10 items-center justify-center">
                  <ActivityIndicator size="small" color="#8B5CF6" />
                  <Text className="text-slate-400 text-xs font-bold font-inter mt-2">
                    Loading exercises...
                  </Text>
                </View>
              ) : (
                exercises.map((exercise, idx) => (
                  <ExerciseCard
                    key={exercise._id}
                    exercise={exercise}
                    index={idx}
                    onPress={() => handleSelectExercise(exercise)}
                  />
                ))
              )}
            </>
          )}
        </ScrollView>

        {/* Exercise Learning & Practice Modal */}
        <ExerciseDetailModal
          visible={selectedExercise !== null}
          exercise={selectedExercise}
          onClose={handleCloseExercise}
          onExerciseCompleted={handleCloseExercise}
        />
      </View>
    </SafeScreen>
  );
};

export default LearnScreen;
