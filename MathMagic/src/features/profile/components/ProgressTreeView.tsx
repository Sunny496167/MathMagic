import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TopicProgressNode, ExerciseProgressNode } from '../../../types';

interface ProgressTreeViewProps {
  topics: TopicProgressNode[];
  gradeName?: string;
}

export const ProgressTreeView: React.FC<ProgressTreeViewProps> = ({
  topics,
  gradeName = 'Grade 1',
}) => {
  const [expandedTopicIds, setExpandedTopicIds] = useState<string[]>(() =>
    topics.map((t) => t._id)
  );

  const toggleTopic = (topicId: string) => {
    setExpandedTopicIds((prev) =>
      prev.includes(topicId) ? prev.filter((id) => id !== topicId) : [...prev, topicId]
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          icon: 'checkmark-circle',
          color: '#10B981',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          label: 'Completed',
        };
      case 'in_progress':
        return {
          icon: 'time',
          color: '#8B5CF6',
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          label: 'In Progress',
        };
      case 'unlocked':
        return {
          icon: 'lock-open-outline',
          color: '#3B82F6',
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          label: 'Ready',
        };
      case 'locked':
      default:
        return {
          icon: 'lock-closed',
          color: '#94A3B8',
          bg: 'bg-slate-50 text-slate-500 border-slate-200',
          label: 'Locked',
        };
    }
  };

  return (
    <View className="mb-6">
      <View className="flex-row justify-between items-center mb-3">
        <View>
          <Text className="text-text-primary text-base font-bold font-inter">
            Curriculum Progress Tree
          </Text>
          <Text className="text-text-secondary text-xs font-semibold">
            {gradeName} • Topics, Subtopics & Practice Levels
          </Text>
        </View>
      </View>

      {topics.length === 0 ? (
        <View className="bg-white rounded-2xl p-6 items-center justify-center border border-slate-100">
          <Ionicons name="book-outline" size={32} color="#94A3B8" />
          <Text className="text-text-secondary text-xs font-inter mt-2">
            No published topics found for this grade.
          </Text>
        </View>
      ) : (
        <View className="gap-y-3">
          {topics.map((topic, tIdx) => {
            const isExpanded = expandedTopicIds.includes(topic._id);
            const topicBadge = getStatusBadge(topic.status);

            return (
              <View
                key={topic._id || tIdx}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
              >
                {/* Topic Header Accordion */}
                <TouchableOpacity
                  onPress={() => toggleTopic(topic._id)}
                  activeOpacity={0.8}
                  className="p-4 flex-row items-center justify-between bg-white"
                >
                  <View className="flex-row items-center gap-3 flex-1 mr-2">
                    <View
                      className="w-10 h-10 rounded-xl items-center justify-center"
                      style={{ backgroundColor: `${topic.color || '#8B5CF6'}15` }}
                    >
                      <Ionicons
                        name={(topic.icon as any) || 'calculator-outline'}
                        size={20}
                        color={topic.color || '#8B5CF6'}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-text-primary text-sm font-bold font-inter" numberOfLines={1}>
                        {topic.title}
                      </Text>
                      <Text className="text-text-secondary text-[11px] font-inter mt-0.5">
                        {topic.exercises?.length || 0} Subtopics & Exercises
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center gap-2">
                    <View
                      className={`px-2.5 py-1 rounded-full border flex-row items-center gap-1 ${topicBadge.bg}`}
                    >
                      <Ionicons name={topicBadge.icon as any} size={12} color={topicBadge.color} />
                      <Text
                        style={{ color: topicBadge.color }}
                        className="text-[10px] font-bold uppercase tracking-wider font-inter"
                      >
                        {topicBadge.label}
                      </Text>
                    </View>

                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color="#94A3B8"
                    />
                  </View>
                </TouchableOpacity>

                {/* Subtopics & Practice Levels List */}
                {isExpanded && (
                  <View className="px-4 pb-4 pt-1 border-t border-slate-50 gap-y-3 bg-slate-50/50">
                    {topic.exercises?.map((exercise: ExerciseProgressNode, eIdx: number) => {
                      const exBadge = getStatusBadge(exercise.status);

                      return (
                        <View
                          key={exercise._id || eIdx}
                          className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-2xs"
                        >
                          <View className="flex-row items-center justify-between mb-2">
                            <View className="flex-row items-center gap-2 flex-1 mr-2">
                              <View className="bg-blue-50 px-2 py-0.5 rounded-md">
                                <Text className="text-blue-700 font-bold text-[10px]">
                                  Subtopic {eIdx + 1}
                                </Text>
                              </View>
                              <Text
                                className="text-text-primary text-xs font-bold font-inter flex-1"
                                numberOfLines={1}
                              >
                                {exercise.title}
                              </Text>
                            </View>

                            <View className="flex-row items-center gap-1">
                              <Ionicons name={exBadge.icon as any} size={12} color={exBadge.color} />
                              <Text style={{ color: exBadge.color }} className="text-[10px] font-bold">
                                {exBadge.label}
                              </Text>
                            </View>
                          </View>

                          {/* Practice Levels Sub-Row */}
                          <View className="pt-2 border-t border-slate-100">
                            <Text className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider mb-1.5">
                              Practice Levels:
                            </Text>

                            {exercise.practiceLevels?.length === 0 ? (
                              <Text className="text-slate-400 text-[11px] italic">
                                No practice levels configured
                              </Text>
                            ) : (
                              <View className="flex-row flex-wrap gap-1.5">
                                {exercise.practiceLevels?.map((pl, pIdx) => {
                                  const plBadge = getStatusBadge(pl.status);
                                  return (
                                    <View
                                      key={pl._id || pIdx}
                                      className={`px-2.5 py-1 rounded-lg border flex-row items-center gap-1.5 ${plBadge.bg}`}
                                    >
                                      <Text
                                        style={{ color: plBadge.color }}
                                        className="text-[11px] font-bold font-inter"
                                      >
                                        L{pl.number}
                                      </Text>
                                      <Ionicons
                                        name={plBadge.icon as any}
                                        size={10}
                                        color={plBadge.color}
                                      />
                                      {pl.status === 'completed' && pl.bestScore > 0 && (
                                        <Text
                                          style={{ color: plBadge.color }}
                                          className="text-[10px] font-extrabold"
                                        >
                                          {pl.bestScore}%
                                        </Text>
                                      )}
                                    </View>
                                  );
                                })}
                              </View>
                            )}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

export default ProgressTreeView;
