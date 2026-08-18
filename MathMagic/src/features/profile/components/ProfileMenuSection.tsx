import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProfileMenuItem } from '../types/profile.types';

interface ProfileMenuSectionProps {
  onResetProgress: () => void;
  onLogout: () => void;
}

export const ProfileMenuSection = ({
  onResetProgress,
  onLogout,
}: ProfileMenuSectionProps) => {
  const menuItems: ProfileMenuItem[] = [
    { id: 'Achievements', icon: 'ribbon-outline', color: '#8B5CF6' },
    { id: 'My Progress', icon: 'trending-up-outline', color: '#8B5CF6' },
    { id: 'Settings', icon: 'settings-outline', color: '#8B5CF6' },
    { id: 'Help & Support', icon: 'help-circle-outline', color: '#8B5CF6' },
  ];

  return (
    <View>
      <View className="bg-white border border-primary/5 rounded-[32px] p-5 mb-6 shadow-sm">
        {menuItems.map((item, idx) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.7}
            className={`flex-row items-center justify-between py-3.5 ${
              idx !== menuItems.length - 1 ? 'border-b border-primary/5' : ''
            }`}
          >
            <View className="flex-row items-center">
              <Ionicons name={item.icon} size={20} color={item.color} className="mr-3" />
              <Text className="text-text-primary text-sm font-bold font-inter">{item.id}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Control Actions */}
      <View className="gap-y-3 mb-10">
        <TouchableOpacity
          onPress={onResetProgress}
          activeOpacity={0.8}
          className="bg-white border border-red-200 py-4 rounded-2xl items-center active:scale-95 transition-all shadow-sm"
        >
          <Text className="text-red-500 font-bold text-xs tracking-wider font-inter">
            RESET ALL PROGRESS
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onLogout}
          activeOpacity={0.8}
          className="bg-[#10B981] py-4 rounded-2xl items-center active:scale-95 transition-all shadow-sm"
        >
          <Text className="text-white font-bold text-xs tracking-wider font-inter">
            LOG OUT 🌟
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProfileMenuSection;
