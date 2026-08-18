import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import SafeScreen from '../../components/common/SafeScreen';
import { PracticeStatsHeader } from './components/PracticeStatsHeader';
import { TopicSelector } from './components/TopicSelector';
import { PracticeQuestionView } from './components/PracticeQuestionView';
import { usePracticeSession } from './hooks/usePracticeSession';

export const PracticeScreen = () => {
  const {
    stats,
    activeTopic,
    difficulty,
    question,
    userAnswer,
    setUserAnswer,
    feedback,
    solvedCount,
    handleTopicSelect,
    handleDifficultyChange,
    handleBackToTopics,
    handleSubmitAnswer,
    newQuestion,
    loadUserStats,
  } = usePracticeSession();

  useFocusEffect(
    React.useCallback(() => {
      loadUserStats();
    }, [])
  );

  return (
    <SafeScreen>
      <View className="flex-1 bg-background">
        {/* Top Header */}
        <View className="px-6 py-5 border-b border-primary/5 bg-white flex-row justify-between items-center">
          <View>
            <Text className="text-text-primary text-2xl font-bold tracking-tight">
              Math Magic
            </Text>
            <Text className="text-text-secondary text-xs mt-0.5">
              Practice and master mathematics
            </Text>
          </View>
          <TouchableOpacity className="w-10 h-10 bg-slate-50 border border-primary/5 rounded-full justify-center items-center">
            <Ionicons name="notifications-outline" size={18} color="#8B5CF6" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-6 py-5" showsVerticalScrollIndicator={false}>
          {/* Header Stats */}
          <PracticeStatsHeader stats={stats} />

          {/* Conditional View: Topic Selector or Active Practice Question */}
          {!activeTopic ? (
            <TopicSelector onSelectTopic={handleTopicSelect} />
          ) : (
            <PracticeQuestionView
              topic={activeTopic}
              difficulty={difficulty}
              onDifficultyChange={handleDifficultyChange}
              onBack={handleBackToTopics}
              question={question}
              userAnswer={userAnswer}
              onChangeUserAnswer={setUserAnswer}
              onSubmitAnswer={handleSubmitAnswer}
              onSkip={newQuestion}
              feedback={feedback}
              solvedCount={solvedCount}
            />
          )}
        </ScrollView>
      </View>
    </SafeScreen>
  );
};

export default PracticeScreen;
