import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Grade, UserProfile } from '../../../types';

interface ProfileHeaderCardProps {
  user: UserProfile | null;
  selectedGrade: Grade | null;
  onOpenGradePicker: () => void;
}

export const ProfileHeaderCard: React.FC<ProfileHeaderCardProps> = ({
  user,
  selectedGrade,
}) => {
  const isAdmin = user?.role === 'admin';

  return (
    <View className="bg-primary rounded-[32px] p-6 mb-5 shadow-lg relative overflow-hidden">
      {/* Decorative background shapes */}
      <View className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-white/10" />
      <View className="absolute -left-10 -bottom-10 w-32 h-32 rounded-full bg-white/5" />

      <View className="flex-row items-center mb-4">
        <View className="w-16 h-16 rounded-2xl bg-white/20 items-center justify-center mr-4 border border-white/20">
          <Ionicons name="person" size={32} color="#FFFFFF" />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-white text-xl font-bold font-inter" numberOfLines={1}>
              {user?.name || 'Math Learner'}
            </Text>
            {isAdmin && (
              <View className="bg-amber-400/90 px-2 py-0.5 rounded-full">
                <Text className="text-slate-900 text-[10px] font-black uppercase">ADMIN</Text>
              </View>
            )}
          </View>
          <Text className="text-white/80 text-xs font-inter mt-0.5" numberOfLines={1}>
            {user?.email || 'learner@mathmagic.com'}
          </Text>
        </View>
      </View>

      {/* Grade info banner */}
      <View className="bg-white/15 rounded-2xl px-4 py-3 flex-row items-center justify-between border border-white/15">
        <View className="flex-row items-center gap-2.5">
          <View className="w-8 h-8 rounded-xl bg-white/20 items-center justify-center">
            <Ionicons name="school-outline" size={16} color="#FFFFFF" />
          </View>
          <View>
            <Text className="text-white/70 text-[10px] font-bold uppercase tracking-wider">
              Enrolled Grade
            </Text>
            <Text className="text-white font-bold text-sm font-inter">
              {selectedGrade ? `${selectedGrade.name}` : 'Grade 1'}
            </Text>
          </View>
        </View>

        <View className="bg-white/25 px-3 py-1.5 rounded-xl">
          <Text className="text-white font-bold text-xs">
            {selectedGrade?.description ? 'Active' : 'Grade 1'}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default ProfileHeaderCard;
