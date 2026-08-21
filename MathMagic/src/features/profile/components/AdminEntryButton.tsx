import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AdminEntryButtonProps {
  onPress: () => void;
}

export const AdminEntryButton: React.FC<AdminEntryButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="bg-slate-900 rounded-2xl p-4 mb-6 flex-row items-center justify-between shadow-md border border-slate-800"
    >
      <View className="flex-row items-center gap-3.5 flex-1">
        <View className="w-12 h-12 rounded-xl bg-amber-400/20 border border-amber-400/30 items-center justify-center">
          <Ionicons name="construct" size={24} color="#FBBF24" />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-white text-base font-bold font-inter">
              Admin Portal
            </Text>
            <View className="bg-amber-400 px-1.5 py-0.5 rounded">
              <Text className="text-slate-900 text-[9px] font-black uppercase">Staff</Text>
            </View>
          </View>
          <Text className="text-slate-400 text-xs font-inter mt-0.5">
            Manage grades, curriculum & ingest question JSON
          </Text>
        </View>
      </View>

      <View className="w-8 h-8 rounded-full bg-white/10 items-center justify-center">
        <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
      </View>
    </TouchableOpacity>
  );
};

export default AdminEntryButton;
