import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../../../api/client';
import { ENDPOINTS } from '../../../../api/endpoints';
import { StudentDetailProgress } from '../../types/adminStudent.types';

interface StudentProgressDetailModalProps {
  visible: boolean;
  studentId: string | null;
  onClose: () => void;
}

export const StudentProgressDetailModal: React.FC<StudentProgressDetailModalProps> = ({
  visible,
  studentId,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<StudentDetailProgress | null>(null);

  useEffect(() => {
    if (visible && studentId) {
      loadStudentProgress();
    } else {
      setData(null);
    }
  }, [visible, studentId]);

  const loadStudentProgress = async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const res = await apiClient.get(ENDPOINTS.ADMIN.STUDENT_PROGRESS(studentId));
      setData(res.data?.data || null);
    } catch (err: any) {
      console.warn('Failed to fetch student progress:', err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!visible || !studentId) return null;

  const student = data?.student;
  const grade = data?.grade;
  const stats = data?.stats;
  const topics = data?.topics || [];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
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
              {student?.name || 'Student Progress'}
            </Text>
            <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider font-inter">
              {grade?.name || 'Enrolled Grade'} • Performance Tree
            </Text>
          </View>

          <TouchableOpacity
            onPress={loadStudentProgress}
            className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center border border-slate-100"
          >
            <Ionicons name="refresh" size={16} color="#8B5CF6" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text className="text-slate-400 text-xs font-bold font-inter mt-3">
              Loading student progress tree...
            </Text>
          </View>
        ) : !data ? (
          <View className="flex-1 items-center justify-center p-6">
            <Ionicons name="alert-circle-outline" size={40} color="#94A3B8" />
            <Text className="text-slate-700 font-bold text-sm font-inter mt-2">
              Failed to load student progress
            </Text>
          </View>
        ) : (
          <ScrollView
            className="flex-1 px-5 py-4"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 60 }}
          >
            {/* Student Info Card */}
            <View className="bg-white rounded-3xl p-5 mb-4 border border-slate-100 shadow-sm">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center gap-3 flex-1 mr-2">
                  <View className="w-12 h-12 rounded-2xl bg-purple-100 items-center justify-center border border-purple-200">
                    <Text className="text-primary font-black text-lg font-inter">
                      {student?.name ? student.name.charAt(0).toUpperCase() : 'S'}
                    </Text>
                  </View>

                  <View className="flex-1">
                    <Text className="text-slate-900 font-black text-base font-inter">
                      {student?.name}
                    </Text>
                    <Text className="text-slate-400 text-xs font-medium font-inter">
                      {student?.email}
                    </Text>
                  </View>
                </View>

                <View className="bg-purple-50 border border-purple-200 px-3 py-1 rounded-full">
                  <Text className="text-primary font-black text-xs font-inter">
                    {grade?.name || 'Grade 1'}
                  </Text>
                </View>
              </View>

              {/* Stats Grid */}
              <View className="bg-slate-50 rounded-2xl p-4 border border-slate-100 gap-y-3">
                <View className="flex-row justify-between">
                  <View className="items-center flex-1">
                    <Text className="text-slate-400 text-[10px] font-bold uppercase font-inter">Accuracy</Text>
                    <Text className="text-emerald-600 text-base font-black font-inter mt-0.5">
                      {stats?.overallAccuracy || 0}%
                    </Text>
                  </View>
                  <View className="h-8 w-[1px] bg-slate-200" />
                  <View className="items-center flex-1">
                    <Text className="text-slate-400 text-[10px] font-bold uppercase font-inter">Questions</Text>
                    <Text className="text-slate-800 text-base font-black font-inter mt-0.5">
                      {stats?.totalCorrectAnswers || 0} / {stats?.totalQuestionsAnswered || 0}
                    </Text>
                  </View>
                  <View className="h-8 w-[1px] bg-slate-200" />
                  <View className="items-center flex-1">
                    <Text className="text-slate-400 text-[10px] font-bold uppercase font-inter">Total XP</Text>
                    <Text className="text-amber-600 text-base font-black font-inter mt-0.5">
                      {student?.xp || 0}
                    </Text>
                  </View>
                </View>

                <View className="h-[1px] bg-slate-200" />

                <View className="flex-row justify-between">
                  <View className="items-center flex-1">
                    <Text className="text-slate-400 text-[10px] font-bold uppercase font-inter">Topics Done</Text>
                    <Text className="text-slate-800 text-sm font-black font-inter mt-0.5">
                      {stats?.topicsCompleted || 0} Topics
                    </Text>
                  </View>
                  <View className="h-8 w-[1px] bg-slate-200" />
                  <View className="items-center flex-1">
                    <Text className="text-slate-400 text-[10px] font-bold uppercase font-inter">Exercises Done</Text>
                    <Text className="text-slate-800 text-sm font-black font-inter mt-0.5">
                      {stats?.exercisesCompleted || 0} Subtopics
                    </Text>
                  </View>
                  <View className="h-8 w-[1px] bg-slate-200" />
                  <View className="items-center flex-1">
                    <Text className="text-slate-400 text-[10px] font-bold uppercase font-inter">Drills Done</Text>
                    <Text className="text-slate-800 text-sm font-black font-inter mt-0.5">
                      {stats?.practiceLevelsCompleted || 0} Levels
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Curriculum Progress Breakdown */}
            <View className="flex-row items-center justify-between mb-3 px-1">
              <Text className="text-slate-900 text-base font-black font-inter">
                Curriculum Progress Tree
              </Text>
              <Text className="text-slate-400 text-xs font-semibold font-inter">
                {topics.length} Topics
              </Text>
            </View>

            {topics.length === 0 ? (
              <View className="bg-white rounded-3xl p-6 items-center justify-center border border-slate-100">
                <Text className="text-slate-400 text-xs font-medium font-inter">
                  No curriculum topics found for this grade.
                </Text>
              </View>
            ) : (
              topics.map((topic, tIdx) => {
                const topicCompleted = topic.status === 'completed';
                const topicInProgress = topic.status === 'in_progress';
                const exercises = topic.exercises || [];

                return (
                  <View
                    key={topic._id}
                    className="bg-white rounded-3xl p-4 mb-4 border border-slate-100 shadow-xs"
                  >
                    {/* Topic Header */}
                    <View className="flex-row items-center justify-between mb-3">
                      <View className="flex-row items-center gap-2.5 flex-1 mr-2">
                        <View
                          className="w-8 h-8 rounded-xl items-center justify-center"
                          style={{ backgroundColor: `${topic.color || '#8B5CF6'}15` }}
                        >
                          <Ionicons
                            name={(topic.icon as any) || 'book-outline'}
                            size={16}
                            color={topic.color || '#8B5CF6'}
                          />
                        </View>
                        <View className="flex-1">
                          <Text className="text-slate-900 font-bold text-sm font-inter" numberOfLines={1}>
                            #{tIdx + 1}. {topic.title}
                          </Text>
                          <Text className="text-slate-400 text-[11px] font-medium font-inter">
                            {exercises.length} Subtopics
                          </Text>
                        </View>
                      </View>

                      <View
                        className={`px-2.5 py-1 rounded-full border ${
                          topicCompleted
                            ? 'bg-emerald-50 border-emerald-200'
                            : topicInProgress
                            ? 'bg-purple-50 border-purple-200'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <Text
                          className={`text-[10px] font-black font-inter ${
                            topicCompleted
                              ? 'text-emerald-700'
                              : topicInProgress
                              ? 'text-primary'
                              : 'text-slate-400'
                          }`}
                        >
                          {topicCompleted
                            ? 'Completed'
                            : topicInProgress
                            ? 'In Progress'
                            : 'Locked'}
                        </Text>
                      </View>
                    </View>

                    {/* Exercises within Topic */}
                    <View className="gap-y-2 pt-2 border-t border-slate-100">
                      {exercises.map((ex, eIdx) => {
                        const exCompleted = ex.status === 'completed';
                        const exInProgress = ex.status === 'in_progress';
                        const pLevels = ex.practiceLevels || [];

                        return (
                          <View
                            key={ex._id}
                            className={`p-3 rounded-2xl border ${
                              exCompleted
                                ? 'bg-emerald-50/40 border-emerald-100'
                                : exInProgress
                                ? 'bg-purple-50/40 border-purple-100'
                                : 'bg-slate-50/60 border-slate-100'
                            }`}
                          >
                            <View className="flex-row items-center justify-between">
                              <View className="flex-row items-center gap-2 flex-1 mr-2">
                                <View
                                  className={`w-6 h-6 rounded-lg items-center justify-center ${
                                    exCompleted
                                      ? 'bg-emerald-100'
                                      : exInProgress
                                      ? 'bg-purple-100'
                                      : 'bg-slate-200'
                                  }`}
                                >
                                  {exCompleted ? (
                                    <Ionicons name="checkmark" size={13} color="#059669" />
                                  ) : (
                                    <Text className="text-[10px] font-black text-slate-700 font-inter">
                                      S{ex.subtopicNumber || eIdx + 1}
                                    </Text>
                                  )}
                                </View>
                                <Text
                                  numberOfLines={1}
                                  className="text-slate-800 text-xs font-bold font-inter flex-1"
                                >
                                  {ex.title}
                                </Text>
                              </View>

                              <View className="flex-row items-center gap-1.5">
                                {ex.score > 0 && (
                                  <View className="bg-white px-2 py-0.5 rounded-full border border-slate-200">
                                    <Text className="text-slate-700 text-[10px] font-bold font-inter">
                                      Score: {ex.score}%
                                    </Text>
                                  </View>
                                )}
                                <Text
                                  className={`text-[10px] font-bold font-inter ${
                                    exCompleted
                                      ? 'text-emerald-700'
                                      : exInProgress
                                      ? 'text-primary'
                                      : 'text-slate-400'
                                  }`}
                                >
                                  {exCompleted
                                    ? 'Completed'
                                    : exInProgress
                                    ? 'In Progress'
                                    : 'Locked'}
                                </Text>
                              </View>
                            </View>

                            {/* Practice Levels for this exercise */}
                            {pLevels.length > 0 && (
                              <View className="mt-2 pt-2 border-t border-slate-200/60 gap-y-1.5">
                                {pLevels.map((lvl) => (
                                  <View
                                    key={lvl._id}
                                    className="flex-row items-center justify-between px-1"
                                  >
                                    <View className="flex-row items-center gap-1.5">
                                      <Ionicons
                                        name={lvl.completed ? 'trophy' : 'trophy-outline'}
                                        size={12}
                                        color={lvl.completed ? '#D97706' : '#94A3B8'}
                                      />
                                      <Text className="text-slate-600 text-[11px] font-semibold font-inter">
                                        Level {lvl.number}: {lvl.title}
                                      </Text>
                                    </View>
                                    <View className="flex-row items-center gap-2">
                                      {lvl.bestScore > 0 && (
                                        <Text className="text-emerald-700 text-[10px] font-black font-inter">
                                          Best: {lvl.bestScore}%
                                        </Text>
                                      )}
                                      <Text
                                        className={`text-[10px] font-bold font-inter ${
                                          lvl.completed
                                            ? 'text-emerald-600'
                                            : lvl.status !== 'locked'
                                            ? 'text-purple-600'
                                            : 'text-slate-400'
                                        }`}
                                      >
                                        {lvl.completed
                                          ? 'Passed'
                                          : lvl.status !== 'locked'
                                          ? 'Unlocked'
                                          : 'Locked'}
                                      </Text>
                                    </View>
                                  </View>
                                ))}
                              </View>
                            )}
                          </View>
                        );
                      })}
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
};

export default StudentProgressDetailModal;
