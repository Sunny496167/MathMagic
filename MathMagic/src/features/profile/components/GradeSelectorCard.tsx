import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Grade } from '../../../types';

interface GradeSelectorCardProps {
  currentGrade: Grade | null;
  onOpenModal: () => void;
}

export const GradeSelectorCard: React.FC<GradeSelectorCardProps> = ({
  currentGrade,
  onOpenModal,
}) => {
  return (
    <View className="bg-white rounded-2xl p-5 mb-6 border border-slate-100 shadow-sm">
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center gap-3">
          <View className="w-12 h-12 rounded-2xl bg-purple-50 items-center justify-center border border-purple-100">
            <Ionicons name="school" size={24} color="#8B5CF6" />
          </View>
          <View>
            <Text className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
              Assigned Grade
            </Text>
            <Text className="text-text-primary text-lg font-bold font-inter mt-0.5">
              {currentGrade ? currentGrade.name : 'Grade 1'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={onOpenModal}
          activeOpacity={0.8}
          className="bg-primary/10 border border-primary/20 px-4 py-2 rounded-xl flex-row items-center gap-1.5"
        >
          <Text className="text-primary font-bold text-xs font-inter">Change</Text>
          <Ionicons name="chevron-forward" size={14} color="#8B5CF6" />
        </TouchableOpacity>
      </View>

      {currentGrade?.description ? (
        <Text className="text-text-secondary text-xs font-inter mt-3 pt-3 border-t border-slate-100">
          {currentGrade.description}
        </Text>
      ) : null}
    </View>
  );
};

export default GradeSelectorCard;
