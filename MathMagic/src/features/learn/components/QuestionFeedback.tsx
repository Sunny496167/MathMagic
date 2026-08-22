import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AnswerSubmissionResult } from '../types/learn.types';

interface QuestionFeedbackProps {
  feedback: AnswerSubmissionResult | null;
  onNext: () => void;
  isLastQuestion: boolean;
  submittingCompletion?: boolean;
}

export const QuestionFeedback: React.FC<QuestionFeedbackProps> = ({
  feedback,
  onNext,
  isLastQuestion,
  submittingCompletion = false,
}) => {
  if (!feedback) return null;

  const isCorrect = feedback.isCorrect;

  return (
    <View
      className={`rounded-3xl p-5 border shadow-lg mt-4 ${
        isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
      }`}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2.5">
          <View
            className={`w-9 h-9 rounded-2xl items-center justify-center ${
              isCorrect ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
          >
            <Ionicons
              name={isCorrect ? 'checkmark' : 'close'}
              size={20}
              color="#FFF"
            />
          </View>
          <View>
            <Text
              className={`font-black text-base font-inter ${
                isCorrect ? 'text-emerald-900' : 'text-rose-900'
              }`}
            >
              {isCorrect ? 'Awesome! Correct!' : 'Not quite right!'}
            </Text>
            {isCorrect && feedback.xpEarned > 0 && (
              <Text className="text-emerald-700 text-xs font-bold font-inter">
                +{feedback.xpEarned} XP Earned ⭐
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Explanation / Solution */}
      {feedback.explanation ? (
        <View className="bg-white/80 rounded-2xl p-3 mb-4 border border-slate-100">
          <Text className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-0.5 font-inter">
            Explanation
          </Text>
          <Text className="text-slate-800 text-xs font-medium leading-relaxed font-inter">
            {feedback.explanation}
          </Text>
        </View>
      ) : !isCorrect && feedback.correctAnswer !== undefined ? (
        <View className="bg-white/80 rounded-2xl p-3 mb-4 border border-slate-100">
          <Text className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-0.5 font-inter">
            Correct Answer
          </Text>
          <Text className="text-slate-800 text-xs font-bold font-inter">
            {String(feedback.correctAnswer)}
          </Text>
        </View>
      ) : null}

      {/* Next Button */}
      <TouchableOpacity
        onPress={onNext}
        disabled={submittingCompletion}
        activeOpacity={0.85}
        className={`w-full py-3.5 rounded-2xl items-center justify-center flex-row gap-2 shadow-sm ${
          isCorrect ? 'bg-emerald-600' : 'bg-rose-600'
        }`}
      >
        <Text className="text-white font-bold text-sm font-inter">
          {submittingCompletion
            ? 'Finishing Exercise...'
            : isLastQuestion
            ? 'Complete Exercise 🎉'
            : 'Next Question'}
        </Text>
        <Ionicons
          name={isLastQuestion ? 'ribbon' : 'arrow-forward'}
          size={16}
          color="#FFF"
        />
      </TouchableOpacity>
    </View>
  );
};

export default QuestionFeedback;
