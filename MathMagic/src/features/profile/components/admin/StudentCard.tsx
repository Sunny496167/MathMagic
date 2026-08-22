import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StudentListItem } from '../../types/adminStudent.types';

interface StudentCardProps {
  student: StudentListItem;
  onPress: () => void;
}

export const StudentCard: React.FC<StudentCardProps> = ({ student, onPress }) => {
  const gradeName = student.selectedGrade?.name || 'Grade 1';
  const stats = student.stats || {
    totalQuestionsAnswered: 0,
    overallAccuracy: 0,
    exercisesCompleted: 0,
    topicsCompleted: 0,
  };

  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : 'S';
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="bg-white rounded-2xl p-4 mb-3 border border-slate-100 shadow-xs"
    >
      <View className="flex-row items-center justify-between mb-3">
        {/* Student Avatar & Basic Info */}
        <View className="flex-row items-center gap-3 flex-1 mr-2">
          <View className="w-11 h-11 rounded-2xl bg-purple-100 items-center justify-center border border-purple-200">
            <Text className="text-primary font-black text-base font-inter">
              {getInitial(student.name)}
            </Text>
          </View>

          <View className="flex-1">
            <Text
              numberOfLines={1}
              className="text-slate-900 font-bold text-sm font-inter"
            >
              {student.name || 'Unnamed Student'}
            </Text>
            <Text
              numberOfLines={1}
              className="text-slate-400 text-xs font-medium font-inter mt-0.5"
            >
              {student.email}
            </Text>
          </View>
        </View>

        {/* Grade Pill */}
        <View className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full">
          <Text className="text-slate-700 font-black text-[10px] font-inter">
            {gradeName}
          </Text>
        </View>
      </View>

      {/* Metrics Row */}
      <View className="bg-slate-50 rounded-xl p-2.5 flex-row justify-between items-center border border-slate-100">
        {/* Total XP */}
        <View className="items-center flex-1">
          <View className="flex-row items-center gap-1">
            <Ionicons name="star" size={11} color="#D97706" />
            <Text className="text-slate-400 text-[9px] font-black uppercase font-inter">
              XP
            </Text>
          </View>
          <Text className="text-slate-800 text-xs font-black font-inter mt-0.5">
            {student.xp || 0}
          </Text>
        </View>

        <View className="h-5 w-[1px] bg-slate-200" />

        {/* Accuracy */}
        <View className="items-center flex-1">
          <View className="flex-row items-center gap-1">
            <Ionicons name="pie-chart" size={11} color="#8B5CF6" />
            <Text className="text-slate-400 text-[9px] font-black uppercase font-inter">
              Accuracy
            </Text>
          </View>
          <Text className="text-slate-800 text-xs font-black font-inter mt-0.5">
            {stats.overallAccuracy || 0}%
          </Text>
        </View>

        <View className="h-5 w-[1px] bg-slate-200" />

        {/* Solved */}
        <View className="items-center flex-1">
          <View className="flex-row items-center gap-1">
            <Ionicons name="checkmark-circle" size={11} color="#10B981" />
            <Text className="text-slate-400 text-[9px] font-black uppercase font-inter">
              Solved
            </Text>
          </View>
          <Text className="text-slate-800 text-xs font-black font-inter mt-0.5">
            {stats.totalQuestionsAnswered || 0}
          </Text>
        </View>

        <View className="h-5 w-[1px] bg-slate-200" />

        {/* Topics Mastered */}
        <View className="items-center flex-1">
          <View className="flex-row items-center gap-1">
            <Ionicons name="school" size={11} color="#3B82F6" />
            <Text className="text-slate-400 text-[9px] font-black uppercase font-inter">
              Mastered
            </Text>
          </View>
          <Text className="text-slate-800 text-xs font-black font-inter mt-0.5">
            {stats.topicsCompleted || 0} Top
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default StudentCard;
