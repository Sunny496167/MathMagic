import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Lesson } from '../types/learn.types';

interface LessonDetailModalProps {
  lesson: Lesson | null;
  onClose: () => void;
  quizInput: string;
  onChangeQuizInput: (text: string) => void;
  onQuizSubmit: () => void;
  quizFeedback: 'correct' | 'incorrect' | null;
}

export const LessonDetailModal = ({
  lesson,
  onClose,
  quizInput,
  onChangeQuizInput,
  onQuizSubmit,
  quizFeedback,
}: LessonDetailModalProps) => {
  if (!lesson) return null;

  return (
    <Modal visible={!!lesson} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-background">
        {/* Modal Top Bar */}
        <View className="px-6 py-4 border-b border-slate-200 bg-white flex-row justify-between items-center">
          <Text className="text-text-primary text-lg font-bold font-inter">{lesson.title}</Text>
          <TouchableOpacity
            onPress={onClose}
            className="w-9 h-9 bg-slate-100 rounded-full items-center justify-center"
          >
            <Ionicons name="close" size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-6 py-5" showsVerticalScrollIndicator={false}>
          {/* Key Formula Box */}
          <View className="bg-primary/5 border border-primary/20 rounded-3xl p-5 mb-6 items-center">
            <Text className="text-primary text-xs font-bold uppercase tracking-wider font-inter mb-1">
              Core Concept
            </Text>
            <Text className="text-primary text-2xl font-extrabold font-inter my-2 text-center">
              {lesson.formula}
            </Text>
            <Text className="text-slate-600 text-xs text-center font-inter mt-1 leading-relaxed">
              {lesson.description}
            </Text>
          </View>

          {/* Worked Example Section */}
          <View className="bg-white border border-slate-200/80 rounded-3xl p-5 mb-6 shadow-sm">
            <Text className="text-slate-800 text-sm font-bold font-inter mb-3 flex-row items-center">
              💡 Example Walkthrough
            </Text>
            <View className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl mb-3">
              <Text className="text-slate-800 font-bold text-xs font-inter">{lesson.exampleProblem}</Text>
            </View>
            <Text className="text-slate-600 text-xs font-inter leading-6 whitespace-pre-line">
              {lesson.exampleStep}
            </Text>
          </View>

          {/* Mini Checkpoint / Quiz Card */}
          <View className="bg-white border border-slate-200/80 rounded-3xl p-5 mb-8 shadow-sm">
            <Text className="text-slate-800 text-sm font-bold font-inter mb-2">
              🎯 Checkpoint Challenge
            </Text>
            <Text className="text-slate-600 text-xs font-inter mb-4">{lesson.quizQuestion}</Text>

            <View className="flex-row gap-x-3 mb-3">
              <TextInput
                className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 font-inter"
                placeholder="Enter answer"
                placeholderTextColor="#94A3B8"
                value={quizInput}
                onChangeText={onChangeQuizInput}
              />
              <TouchableOpacity
                onPress={onQuizSubmit}
                className="bg-primary px-5 rounded-2xl items-center justify-center shadow-sm active:scale-95"
              >
                <Text className="text-white font-bold text-xs font-inter">Check</Text>
              </TouchableOpacity>
            </View>

            {quizFeedback === 'correct' && (
              <View className="bg-green-50 border border-green-200 p-3 rounded-2xl flex-row items-center">
                <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                <Text className="text-green-700 text-xs font-bold font-inter ml-2">
                  Correct! +50 XP awarded 🎉
                </Text>
              </View>
            )}

            {quizFeedback === 'incorrect' && (
              <View className="bg-rose-50 border border-rose-200 p-3 rounded-2xl flex-row items-center">
                <Ionicons name="close-circle" size={18} color="#EF4444" />
                <Text className="text-rose-700 text-xs font-bold font-inter ml-2">
                  Incorrect. Review the steps and try again.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

export default LessonDetailModal;
