import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Grade } from '../../../types';

interface GradePickerModalProps {
  visible: boolean;
  onClose: () => void;
  grades: Grade[];
  selectedGradeId: string | null;
  onSelectGrade: (gradeId: string) => void;
  isLoading: boolean;
}

export const GradePickerModal: React.FC<GradePickerModalProps> = ({
  visible,
  onClose,
  grades,
  selectedGradeId,
  onSelectGrade,
  isLoading,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/60 justify-center items-center px-6">
        <View className="bg-white rounded-[32px] w-full max-w-md p-6 shadow-2xl">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-text-primary text-xl font-bold font-inter">
                Select Your Grade
              </Text>
              <Text className="text-text-secondary text-xs mt-0.5 font-inter">
                Choose from admin-enabled grades
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="w-9 h-9 rounded-full bg-slate-100 items-center justify-center"
            >
              <Ionicons name="close" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          {isLoading ? (
            <View className="py-12 items-center justify-center">
              <ActivityIndicator size="large" color="#8B5CF6" />
              <Text className="text-text-secondary text-xs font-inter mt-3">
                Loading available grades...
              </Text>
            </View>
          ) : grades.length === 0 ? (
            <View className="py-8 items-center justify-center">
              <Ionicons name="alert-circle-outline" size={36} color="#94A3B8" />
              <Text className="text-text-secondary text-sm font-semibold mt-2">
                No enabled grades found
              </Text>
            </View>
          ) : (
            <ScrollView className="max-h-80" showsVerticalScrollIndicator={false}>
              <View className="gap-y-3 my-2">
                {grades.map((grade) => {
                  const isSelected = selectedGradeId === grade._id;
                  return (
                    <TouchableOpacity
                      key={grade._id}
                      onPress={() => onSelectGrade(grade._id)}
                      activeOpacity={0.8}
                      className={`p-4 rounded-2xl border flex-row items-center justify-between ${
                        isSelected
                          ? 'bg-purple-50/80 border-primary shadow-sm'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <View className="flex-row items-center gap-3.5 flex-1 mr-2">
                        <View
                          className={`w-11 h-11 rounded-xl items-center justify-center ${
                            isSelected ? 'bg-primary' : 'bg-slate-100'
                          }`}
                        >
                          <Ionicons
                            name={(grade.icon as any) || 'shapes-outline'}
                            size={20}
                            color={isSelected ? '#FFFFFF' : '#8B5CF6'}
                          />
                        </View>
                        <View className="flex-1">
                          <Text
                            className={`text-base font-bold font-inter ${
                              isSelected ? 'text-primary' : 'text-text-primary'
                            }`}
                          >
                            {grade.name}
                          </Text>
                          {grade.description ? (
                            <Text
                              className="text-text-secondary text-xs font-inter mt-0.5"
                              numberOfLines={1}
                            >
                              {grade.description}
                            </Text>
                          ) : null}
                        </View>
                      </View>

                      <View
                        className={`w-6 h-6 rounded-full border items-center justify-center ${
                          isSelected
                            ? 'bg-primary border-primary'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && (
                          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          )}

          {/* Footer note */}
          <View className="mt-4 pt-3 border-t border-slate-100 flex-row items-center gap-2">
            <Ionicons name="information-circle-outline" size={16} color="#94A3B8" />
            <Text className="text-text-secondary text-[11px] font-inter flex-1">
              Grades 2 to 5 can be enabled by the administrator from the Admin Portal.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default GradePickerModal;
