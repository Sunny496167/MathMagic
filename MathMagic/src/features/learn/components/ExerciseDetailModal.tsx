import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ExerciseItem } from '../types/learn.types';
import ContentBlockRenderer from './ContentBlockRenderer';
import QuestionPlayer from './QuestionPlayer';
import ExerciseCompleteModal from './ExerciseCompleteModal';
import useExercisePlayer from '../hooks/useExercisePlayer';

interface ExerciseDetailModalProps {
  visible: boolean;
  exercise: ExerciseItem | null;
  onClose: () => void;
  onExerciseCompleted?: () => void;
}

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({
  visible,
  exercise,
  onClose,
  onExerciseCompleted,
}) => {
  const {
    loadingDetail,
    exerciseData,
    questions,
    mode,
    currentQuestionIndex,
    currentQuestion,
    isLastQuestion,
    completionResult,
    submittingCompletion,
    handleStartQuestions,
    handleAnswerSubmit,
    handleNextQuestion,
    handleRetry,
    handleBackToContent,
  } = useExercisePlayer(exercise, onExerciseCompleted);

  if (!visible || !exercise) return null;

  const currentExercise = exerciseData || exercise;
  const contentBlocks = currentExercise.learningContent?.blocks || [];
  const minScore = currentExercise.completionRequirement?.minScore || 80;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-background">
        {/* Top Navigation Bar */}
        <View className="px-5 py-4 border-b border-slate-100 bg-white flex-row items-center justify-between">
          <TouchableOpacity
            onPress={mode === 'player' ? handleBackToContent : onClose}
            className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center border border-slate-100"
          >
            <Ionicons
              name={mode === 'player' ? 'arrow-back' : 'close'}
              size={20}
              color="#475569"
            />
          </TouchableOpacity>

          <View className="items-center flex-1 mx-3">
            <Text
              numberOfLines={1}
              className="text-slate-900 font-black text-base font-inter"
            >
              {currentExercise.title}
            </Text>
            <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider font-inter">
              {mode === 'player'
                ? `Question ${currentQuestionIndex + 1} of ${questions.length}`
                : 'Learn & Practice'}
            </Text>
          </View>

          <View className="w-10 h-10 items-center justify-center">
            {mode === 'player' && (
              <View className="w-8 h-8 rounded-full bg-purple-50 items-center justify-center border border-purple-200">
                <Ionicons name="sparkles" size={14} color="#8B5CF6" />
              </View>
            )}
          </View>
        </View>

        {/* Loading Spinner */}
        {loadingDetail ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text className="text-slate-400 text-xs font-bold font-inter mt-3">
              Loading lesson notes...
            </Text>
          </View>
        ) : (
          <ScrollView
            className="flex-1 px-5 py-5"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 60 }}
          >
            {mode === 'content' && (
              <>
                {/* Header Banner */}
                <View className="bg-primary/10 rounded-3xl p-5 mb-5 border border-primary/15">
                  <View className="flex-row items-center gap-2 mb-1">
                    <Ionicons name="book" size={18} color="#8B5CF6" />
                    <Text className="text-primary font-black text-xs uppercase tracking-wider font-inter">
                      Concept Guide
                    </Text>
                  </View>
                  <Text className="text-slate-900 text-xl font-black font-inter tracking-tight">
                    {currentExercise.title}
                  </Text>
                  {currentExercise.description ? (
                    <Text className="text-slate-600 text-xs font-semibold font-inter mt-1">
                      {currentExercise.description}
                    </Text>
                  ) : null}
                </View>

                {/* Structured Content Blocks */}
                <ContentBlockRenderer blocks={contentBlocks} />

                {/* Start Questions Card */}
                <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-md">
                  <View className="flex-row items-center justify-between mb-4">
                    <View>
                      <Text className="text-slate-900 text-base font-black font-inter">
                        Practice Drill
                      </Text>
                      <Text className="text-slate-400 text-xs font-medium font-inter mt-0.5">
                        {questions.length} interactive questions • Pass Target: {minScore}%
                      </Text>
                    </View>
                    <View className="w-10 h-10 rounded-2xl bg-purple-50 items-center justify-center">
                      <Ionicons name="trophy-outline" size={20} color="#8B5CF6" />
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={handleStartQuestions}
                    disabled={questions.length === 0}
                    activeOpacity={0.85}
                    className={`w-full py-4 rounded-2xl items-center justify-center flex-row gap-2 shadow-sm ${
                      questions.length > 0 ? 'bg-primary' : 'bg-slate-200'
                    }`}
                  >
                    <Text className="text-white font-black text-sm font-inter">
                      {questions.length > 0
                        ? `Start Questions (${questions.length}) 🎯`
                        : 'No Questions Available'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {mode === 'player' && currentQuestion && (
              <QuestionPlayer
                question={currentQuestion}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={questions.length}
                onAnswerSubmit={handleAnswerSubmit}
                onNextQuestion={handleNextQuestion}
                isLastQuestion={isLastQuestion}
                submittingCompletion={submittingCompletion}
              />
            )}
          </ScrollView>
        )}

        {/* Completion Celebration Modal */}
        <ExerciseCompleteModal
          visible={mode === 'completed'}
          result={completionResult}
          exerciseTitle={currentExercise.title}
          onRetry={handleRetry}
          onClose={() => {
            onClose();
            if (onExerciseCompleted) onExerciseCompleted();
          }}
        />
      </View>
    </Modal>
  );
};

export default ExerciseDetailModal;
