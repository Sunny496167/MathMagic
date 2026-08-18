import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MathCategory } from '../../../types';

interface TopicItem {
  id: MathCategory;
  name: string;
  desc: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
  border: string;
}

const TOPICS: TopicItem[] = [
  { id: 'Addition', name: 'Addition', desc: 'Single & multi-digit addition', icon: 'add-circle-outline', color: '#8B5CF6', bg: 'bg-[#F3E8FF]', border: 'border-[#E9D5FF]' },
  { id: 'Subtraction', name: 'Subtraction', desc: 'Takeaways and differences', icon: 'remove-circle-outline', color: '#10B981', bg: 'bg-[#E8F8F0]', border: 'border-[#D1F2E1]' },
  { id: 'Multiplication', name: 'Multiplication', desc: 'Times tables & multiples', icon: 'close-circle-outline', color: '#0284C7', bg: 'bg-[#F0F9FF]', border: 'border-[#E0F2FE]' },
  { id: 'Division', name: 'Division', desc: 'Splitting into equal parts', icon: 'git-compare-outline', color: '#D97706', bg: 'bg-[#FEF3C7]', border: 'border-[#FEEB9F]' },
  { id: 'Fractions', name: 'Fractions', desc: 'Halves, quarters & parts', icon: 'pie-chart-outline', color: '#EC4899', bg: 'bg-[#FDF2F8]', border: 'border-[#FCE7F3]' },
];

interface TopicSelectorProps {
  onSelectTopic: (topic: MathCategory) => void;
}

export const TopicSelector = ({ onSelectTopic }: TopicSelectorProps) => {
  return (
    <View>
      <Text className="text-text-secondary text-xs font-bold uppercase tracking-wider mb-4 font-inter">
        Choose a Topic
      </Text>

      <View className="gap-y-3.5 mb-8">
        {TOPICS.map((t) => (
          <TouchableOpacity
            key={t.id}
            activeOpacity={0.8}
            onPress={() => onSelectTopic(t.id)}
            className="bg-white border border-primary/5 rounded-[28px] p-4 flex-row items-center justify-between shadow-sm active:scale-98 transition-all"
          >
            <View className="flex-row items-center flex-1 pr-3">
              <View className={`w-12 h-12 rounded-2xl ${t.bg} border ${t.border} items-center justify-center mr-4 shadow-sm`}>
                <Ionicons name={t.icon} size={22} color={t.color} />
              </View>
              <View className="flex-1">
                <Text className="text-text-primary text-base font-bold font-inter">{t.name}</Text>
                <Text className="text-text-secondary text-xs font-inter mt-0.5" numberOfLines={1}>
                  {t.desc}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default TopicSelector;
