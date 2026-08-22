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
import { PracticeLevelItem } from '../types/practice.types';
import DrillQuestionPlayer from './DrillQuestionPlayer';
import DrillResultSummary from './DrillResultSummary';
import useDrillSession from '../hooks/useDrillSession';

interface DrillSessionModalProps {
  visible: boolean;
  level: PracticeLevelItem | null;
  exerciseTitle?: string;
  onClose: () => void;
  onDrillCompleted?: () => void;
}

export const DrillSessionModal: React.FC<DrillSessionModalProps> = ({
  visible,
  level,
  exerciseTitle = 'Exercise',
  onClose,
  onDrillCompleted,
}) => {
  const {
    loadingQuestions,
    levelData,
    questions,
    currentIdx,
    currentQuestion,
    totalQuestions,
    elapsedSeconds,
    submitting,
    result,
    handleRecordAnswerAndNext,
    handleRetry,
  } = useDrillSession(level, onDrillCompleted);

  if (!visible || !level) return null;

  const currentLevel = levelData || level;
  const isFinished = result !== null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-background">
        {/* Top Header */}
        <View className="px-5 py-4 border-b border-slate-100 bg-white flex-row items-center justify-between">
          <TouchableOpacity
            onPress={onClose}
            className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center border border-slate-100"
          >
            <Ionicons name="close" size={20} color="#475569" />
          </TouchableOpacity>

          <View className="items-center flex-1 mx-3">
            <Text
              numberOfLines={1}
              className="text-slate-900 font-black text-base font-inter"
            >
              {exerciseTitle}
            </Text>
            <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider font-inter">
              {currentLevel.title || `Level ${currentLevel.number}`} Drill
            </Text>
          </View>

          <View className="w-10 h-10 items-center justify-center">
            <View className="w-8 h-8 rounded-full bg-purple-50 items-center justify-center border border-purple-200">
              <Ionicons name="calculator-outline" size={14} color="#8B5CF6" />
            </View>
          </View>
        </View>

        {/* Modal Body */}
        {loadingQuestions ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text className="text-slate-400 text-xs font-bold font-inter mt-3">
              Loading drill questions...
            </Text>
          </View>
        ) : (
          <ScrollView
            className="flex-1 px-5 py-5"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 60 }}
          >
            {isFinished ? (
              <DrillResultSummary
                result={result}
                level={currentLevel}
                exerciseTitle={exerciseTitle}
                onRetry={handleRetry}
                onClose={() => {
                  onClose();
                  if (onDrillCompleted) onDrillCompleted();
                }}
              />
            ) : currentQuestion ? (
              <DrillQuestionPlayer
                question={currentQuestion}
                questionNumber={currentIdx + 1}
                totalQuestions={totalQuestions}
                elapsedSeconds={elapsedSeconds}
                onAnswerSubmit={handleRecordAnswerAndNext}
                submitting={submitting}
              />
            ) : (
              <View className="py-12 items-center justify-center bg-white rounded-3xl p-6 border border-slate-100 mt-4">
                <Ionicons name="alert-circle-outline" size={36} color="#94A3B8" />
                <Text className="text-slate-800 text-base font-bold font-inter mt-3">
                  No Questions Available
                </Text>
                <Text className="text-slate-400 text-xs text-center font-inter mt-1">
                  The administrator has not yet added drill questions to this practice level.
                </Text>
                <TouchableOpacity
                  onPress={onClose}
                  className="mt-5 bg-primary px-6 py-3 rounded-2xl"
                >
                  <Text className="text-white font-bold text-xs font-inter">
                    Back to Practice
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
};

export default DrillSessionModal;
