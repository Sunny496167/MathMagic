import React from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MathCategory, MathDifficulty } from '../../../types';
import { PracticeQuestion } from '../types/practice.types';

interface PracticeQuestionViewProps {
  topic: MathCategory;
  difficulty: MathDifficulty;
  onDifficultyChange: (diff: MathDifficulty) => void;
  onBack: () => void;
  question: PracticeQuestion | null;
  userAnswer: string;
  onChangeUserAnswer: (text: string) => void;
  onSubmitAnswer: () => void;
  onSkip: () => void;
  feedback: 'correct' | 'incorrect' | null;
  solvedCount: number;
}

export const PracticeQuestionView = ({
  topic,
  difficulty,
  onDifficultyChange,
  onBack,
  question,
  userAnswer,
  onChangeUserAnswer,
  onSubmitAnswer,
  onSkip,
  feedback,
  solvedCount,
}: PracticeQuestionViewProps) => {
  return (
    <View>
      {/* Top Header bar with Back button and Topic Title */}
      <View className="flex-row items-center justify-between mb-4">
        <TouchableOpacity
          onPress={onBack}
          className="w-10 h-10 bg-white border border-primary/10 rounded-full items-center justify-center shadow-sm"
        >
          <Ionicons name="arrow-back" size={20} color="#8B5CF6" />
        </TouchableOpacity>

        <Text className="text-text-primary text-lg font-bold font-inter">{topic} Practice</Text>

        <View className="bg-primary/10 px-3 py-1.5 rounded-full">
          <Text className="text-primary font-bold text-xs font-inter">{solvedCount} Solved</Text>
        </View>
      </View>

      {/* Difficulty Toggle tabs */}
      <View className="flex-row bg-slate-100/80 p-1 rounded-2xl mb-6 border border-slate-200/50">
        {(['Easy', 'Medium', 'Hard'] as MathDifficulty[]).map((d) => (
          <TouchableOpacity
            key={d}
            onPress={() => onDifficultyChange(d)}
            className={`flex-1 py-2.5 rounded-xl items-center ${
              difficulty === d ? 'bg-white shadow-sm' : ''
            }`}
          >
            <Text
              className={`text-xs font-bold font-inter ${
                difficulty === d ? 'text-primary' : 'text-slate-500'
              }`}
            >
              {d}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Question Card Display */}
      {question ? (
        <View className="bg-white border border-primary/10 rounded-[32px] p-6 shadow-sm mb-6 items-center">
          <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 font-inter">
            Solve this equation
          </Text>
          <Text className="text-4xl font-extrabold text-slate-800 my-4 font-inter tracking-wider">
            {question.text} = ?
          </Text>

          {/* Answer Input Box */}
          <View className="w-full max-w-[200px] mt-2 mb-4">
            <TextInput
              className="bg-slate-50 border-2 border-primary/20 rounded-2xl text-center py-3.5 text-2xl font-bold text-slate-800 font-inter focus:border-primary"
              placeholder="?"
              placeholderTextColor="#CBD5E1"
              keyboardType="numeric"
              value={userAnswer}
              onChangeText={onChangeUserAnswer}
              autoFocus
            />
          </View>

          {/* Feedback Display */}
          {feedback === 'correct' && (
            <View className="bg-green-50 border border-green-200 px-4 py-2 rounded-xl flex-row items-center mb-2">
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
              <Text className="text-green-700 text-xs font-bold font-inter ml-1.5">
                Awesome! Correct Answer 🎉
              </Text>
            </View>
          )}

          {feedback === 'incorrect' && (
            <View className="bg-rose-50 border border-rose-200 px-4 py-2 rounded-xl flex-row items-center mb-2">
              <Ionicons name="close-circle" size={18} color="#EF4444" />
              <Text className="text-rose-700 text-xs font-bold font-inter ml-1.5">
                Not quite right. Try again! 🤔
              </Text>
            </View>
          )}

          {/* Actions button */}
          <View className="w-full flex-row gap-x-3 mt-4">
            <TouchableOpacity
              onPress={onSkip}
              className="flex-1 bg-slate-100 py-3.5 rounded-2xl items-center"
            >
              <Text className="text-slate-600 font-bold text-xs font-inter">Skip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onSubmitAnswer}
              className="flex-1 bg-primary py-3.5 rounded-2xl items-center shadow-sm active:scale-95"
            >
              <Text className="text-white font-bold text-xs font-inter">Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <ActivityIndicator size="large" color="#8B5CF6" />
      )}
    </View>
  );
};

export default PracticeQuestionView;
