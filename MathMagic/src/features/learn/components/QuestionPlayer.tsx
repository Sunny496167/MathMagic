import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LearnQuestion, AnswerSubmissionResult } from '../types/learn.types';
import QuestionFeedback from './QuestionFeedback';

interface QuestionPlayerProps {
  question: LearnQuestion;
  questionNumber: number;
  totalQuestions: number;
  onAnswerSubmit: (userAnswer: any) => Promise<AnswerSubmissionResult | null>;
  onNextQuestion: () => void;
  isLastQuestion: boolean;
  submittingCompletion?: boolean;
}

export const QuestionPlayer: React.FC<QuestionPlayerProps> = ({
  question,
  questionNumber,
  totalQuestions,
  onAnswerSubmit,
  onNextQuestion,
  isLastQuestion,
  submittingCompletion = false,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [textInputVal, setTextInputVal] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<AnswerSubmissionResult | null>(null);

  const isAnswered = feedback !== null;

  const handleSelectOption = async (option: string) => {
    if (isAnswered || isEvaluating) return;
    setSelectedOption(option);
    setIsEvaluating(true);
    const result = await onAnswerSubmit(option);
    setIsEvaluating(false);
    if (result) {
      setFeedback(result);
    }
  };

  const handleTextSubmit = async () => {
    if (isAnswered || isEvaluating || !textInputVal.trim()) return;
    setIsEvaluating(true);
    const result = await onAnswerSubmit(textInputVal.trim());
    setIsEvaluating(false);
    if (result) {
      setFeedback(result);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setTextInputVal('');
    setFeedback(null);
    onNextQuestion();
  };

  const renderQuestionInput = () => {
    const type = question.type || 'mcq';

    if (type === 'true_false') {
      const tfOptions = ['True', 'False'];
      return (
        <View className="flex-row gap-3 mt-4">
          {tfOptions.map((opt) => {
            const isSelected = selectedOption?.toLowerCase() === opt.toLowerCase();
            return (
              <TouchableOpacity
                key={opt}
                onPress={() => handleSelectOption(opt)}
                disabled={isAnswered || isEvaluating}
                activeOpacity={0.8}
                className={`flex-1 py-5 rounded-2xl border-2 items-center justify-center shadow-sm ${
                  isSelected
                    ? 'bg-purple-50 border-primary'
                    : 'bg-white border-slate-200'
                }`}
              >
                <Text
                  className={`text-base font-black font-inter ${
                    isSelected ? 'text-primary' : 'text-slate-700'
                  }`}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      );
    }

    if (type === 'fill_blank') {
      return (
        <View className="mt-4 gap-y-3">
          <TextInput
            value={textInputVal}
            onChangeText={setTextInputVal}
            placeholder="Type your answer..."
            placeholderTextColor="#94A3B8"
            editable={!isAnswered && !isEvaluating}
            autoCapitalize="none"
            className="bg-white border-2 border-slate-200 rounded-2xl px-5 py-4 text-base font-bold text-slate-800 font-inter"
          />
          {!isAnswered && (
            <TouchableOpacity
              onPress={handleTextSubmit}
              disabled={!textInputVal.trim() || isEvaluating}
              activeOpacity={0.85}
              className={`py-3.5 rounded-2xl items-center justify-center flex-row gap-2 ${
                textInputVal.trim() ? 'bg-primary' : 'bg-slate-300'
              }`}
            >
              {isEvaluating ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Text className="text-white font-bold text-sm font-inter">
                    Submit Answer
                  </Text>
                  <Ionicons name="checkmark" size={18} color="#FFF" />
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      );
    }

    if (type === 'numeric') {
      return (
        <View className="mt-4 gap-y-3">
          <TextInput
            value={textInputVal}
            onChangeText={setTextInputVal}
            placeholder="Enter numeric answer..."
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
            editable={!isAnswered && !isEvaluating}
            className="bg-white border-2 border-slate-200 rounded-2xl px-5 py-4 text-center text-2xl font-black text-slate-800 font-inter"
          />
          {!isAnswered && (
            <TouchableOpacity
              onPress={handleTextSubmit}
              disabled={!textInputVal.trim() || isEvaluating}
              activeOpacity={0.85}
              className={`py-3.5 rounded-2xl items-center justify-center flex-row gap-2 ${
                textInputVal.trim() ? 'bg-primary' : 'bg-slate-300'
              }`}
            >
              {isEvaluating ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Text className="text-white font-bold text-sm font-inter">
                    Check Number
                  </Text>
                  <Ionicons name="checkmark" size={18} color="#FFF" />
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      );
    }

    // Default MCQ & Image MCQ
    const options = question.options || ['A', 'B', 'C', 'D'];
    return (
      <View className="gap-y-3 mt-4">
        {options.map((opt, oIdx) => {
          const isSelected = selectedOption === opt;
          return (
            <TouchableOpacity
              key={oIdx}
              onPress={() => handleSelectOption(opt)}
              disabled={isAnswered || isEvaluating}
              activeOpacity={0.8}
              className={`p-4 rounded-2xl border-2 flex-row items-center justify-between shadow-sm ${
                isSelected
                  ? 'bg-purple-50 border-primary'
                  : 'bg-white border-slate-200'
              }`}
            >
              <View className="flex-row items-center gap-3 flex-1 pr-2">
                <View
                  className={`w-7 h-7 rounded-xl items-center justify-center ${
                    isSelected ? 'bg-primary' : 'bg-slate-100'
                  }`}
                >
                  <Text
                    className={`font-black text-xs ${
                      isSelected ? 'text-white' : 'text-slate-600'
                    }`}
                  >
                    {String.fromCharCode(65 + oIdx)}
                  </Text>
                </View>
                <Text
                  className={`text-base font-bold font-inter ${
                    isSelected ? 'text-primary' : 'text-slate-800'
                  }`}
                >
                  {opt}
                </Text>
              </View>
              {isSelected && (
                <Ionicons name="checkmark-circle" size={20} color="#8B5CF6" />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <View className="mb-6">
      {/* Question Header Status */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <View className="bg-purple-100 px-3 py-1 rounded-full">
            <Text className="text-primary font-black text-xs font-inter">
              Question {questionNumber} / {totalQuestions}
            </Text>
          </View>
          {question.difficulty && (
            <View className="bg-slate-100 px-2.5 py-1 rounded-full">
              <Text className="text-slate-600 font-bold text-[10px] uppercase font-inter">
                {question.difficulty}
              </Text>
            </View>
          )}
        </View>

        <View className="flex-row items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
          <Ionicons name="star" size={12} color="#F59E0B" />
          <Text className="text-amber-700 text-xs font-bold font-inter">
            +{question.xpReward || 5} XP
          </Text>
        </View>
      </View>

      {/* Question Prompt Card */}
      <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
        <Text className="text-slate-900 text-lg font-black leading-snug font-inter">
          {question.text}
        </Text>

        {question.hint && (
          <View className="flex-row items-center gap-1.5 mt-2 bg-slate-50 p-2.5 rounded-xl">
            <Ionicons name="help-circle-outline" size={15} color="#64748B" />
            <Text className="text-slate-500 text-xs font-medium font-inter flex-1">
              {question.hint}
            </Text>
          </View>
        )}

        {/* Dynamic Input Types */}
        {renderQuestionInput()}
      </View>

      {/* Evaluating loader */}
      {isEvaluating && (
        <View className="py-4 items-center justify-center flex-row gap-2">
          <ActivityIndicator size="small" color="#8B5CF6" />
          <Text className="text-slate-500 text-xs font-bold font-inter">
            Verifying your answer...
          </Text>
        </View>
      )}

      {/* Feedback Banner */}
      <QuestionFeedback
        feedback={feedback}
        onNext={handleNext}
        isLastQuestion={isLastQuestion}
        submittingCompletion={submittingCompletion}
      />
    </View>
  );
};

export default QuestionPlayer;
