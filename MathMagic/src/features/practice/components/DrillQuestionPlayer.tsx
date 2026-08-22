import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LearnQuestion } from '../../learn/types/learn.types';

interface DrillQuestionPlayerProps {
  question: LearnQuestion;
  questionNumber: number;
  totalQuestions: number;
  elapsedSeconds: number;
  onAnswerSubmit: (userAnswer: any) => void;
  submitting?: boolean;
}

export const DrillQuestionPlayer: React.FC<DrillQuestionPlayerProps> = ({
  question,
  questionNumber,
  totalQuestions,
  elapsedSeconds,
  onAnswerSubmit,
  submitting = false,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [textInputVal, setTextInputVal] = useState('');

  useEffect(() => {
    setSelectedOption(null);
    setTextInputVal('');
  }, [question._id]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (opt: string) => {
    setSelectedOption(opt);
    onAnswerSubmit(opt);
  };

  const handleTextSubmit = () => {
    if (!textInputVal.trim()) return;
    onAnswerSubmit(textInputVal.trim());
  };

  const progressPercent = totalQuestions > 0 ? (questionNumber / totalQuestions) * 100 : 0;

  const renderInput = () => {
    const type = question.type || 'mcq';

    if (type === 'true_false') {
      const tfOptions = ['True', 'False'];
      return (
        <View className="flex-row gap-3 mt-4">
          {tfOptions.map((opt) => (
            <TouchableOpacity
              key={opt}
              onPress={() => handleSelectOption(opt)}
              disabled={submitting}
              activeOpacity={0.8}
              className="flex-1 py-5 rounded-2xl border-2 border-slate-200 bg-white items-center justify-center shadow-xs active:bg-purple-50 active:border-primary"
            >
              <Text className="text-base font-black text-slate-800 font-inter">
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    if (type === 'numeric' || type === 'fill_blank') {
      return (
        <View className="mt-4 gap-y-3">
          <TextInput
            value={textInputVal}
            onChangeText={setTextInputVal}
            placeholder={type === 'numeric' ? 'Enter number...' : 'Type answer...'}
            placeholderTextColor="#94A3B8"
            keyboardType={type === 'numeric' ? 'numeric' : 'default'}
            autoFocus
            className="bg-white border-2 border-slate-200 rounded-2xl px-5 py-4 text-center text-xl font-bold text-slate-800 font-inter"
          />
          <TouchableOpacity
            onPress={handleTextSubmit}
            disabled={!textInputVal.trim() || submitting}
            activeOpacity={0.85}
            className={`py-4 rounded-2xl items-center justify-center flex-row gap-2 ${
              textInputVal.trim() ? 'bg-primary' : 'bg-slate-300'
            }`}
          >
            <Text className="text-white font-bold text-sm font-inter">
              Submit & Next
            </Text>
            <Ionicons name="arrow-forward" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>
      );
    }

    // Default MCQ
    const options = question.options || ['A', 'B', 'C', 'D'];
    return (
      <View className="gap-y-3 mt-4">
        {options.map((opt, oIdx) => (
          <TouchableOpacity
            key={oIdx}
            onPress={() => handleSelectOption(opt)}
            disabled={submitting}
            activeOpacity={0.8}
            className="p-4 rounded-2xl border-2 border-slate-200 bg-white flex-row items-center justify-between shadow-xs active:bg-purple-50 active:border-primary"
          >
            <View className="flex-row items-center gap-3 flex-1 pr-2">
              <View className="w-8 h-8 rounded-xl bg-slate-100 items-center justify-center">
                <Text className="font-black text-xs text-slate-700">
                  {String.fromCharCode(65 + oIdx)}
                </Text>
              </View>
              <Text className="text-base font-bold text-slate-800 font-inter flex-1">
                {opt}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View className="mb-6">
      {/* Session Progress Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="bg-purple-100 px-3 py-1 rounded-full">
          <Text className="text-primary font-black text-xs font-inter">
            Question {questionNumber} / {totalQuestions}
          </Text>
        </View>

        <View className="flex-row items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full">
          <Ionicons name="timer-outline" size={14} color="#64748B" />
          <Text className="text-slate-700 text-xs font-black font-inter">
            {formatTimer(elapsedSeconds)}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View className="h-2 bg-slate-100 rounded-full overflow-hidden mb-5">
        <View
          style={{ width: `${progressPercent}%` }}
          className="h-full bg-primary rounded-full"
        />
      </View>

      {/* Question Card */}
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

        {/* Input UI */}
        {renderInput()}
      </View>
    </View>
  );
};

export default DrillQuestionPlayer;
