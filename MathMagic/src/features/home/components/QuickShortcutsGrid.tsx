import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface QuickShortcutsGridProps {
  onNavigate: (tab: 'learn' | 'practice' | 'game' | 'profile') => void;
}

export const QuickShortcutsGrid: React.FC<QuickShortcutsGridProps> = ({
  onNavigate,
}) => {
  const shortcuts: {
    id: string;
    title: string;
    subtitle: string;
    icon: string;
    color: string;
    bg: string;
    tab: 'learn' | 'practice' | 'game' | 'profile';
  }[] = [
    {
      id: 's_learn',
      title: 'Learn',
      subtitle: 'Interactive Lessons',
      icon: 'book',
      color: '#8B5CF6',
      bg: '#F3E8FF',
      tab: 'learn',
    },
    {
      id: 's_practice',
      title: 'Practice',
      subtitle: 'Skill Drills',
      icon: 'calculator',
      color: '#3B82F6',
      bg: '#EFF6FF',
      tab: 'practice',
    },
    {
      id: 's_game',
      title: 'Arcade',
      subtitle: '8 Mini-Games',
      icon: 'game-controller',
      color: '#10B981',
      bg: '#ECFDF5',
      tab: 'game',
    },
    {
      id: 's_profile',
      title: 'Profile',
      subtitle: 'XP & Trophies',
      icon: 'person',
      color: '#F59E0B',
      bg: '#FFFBEB',
      tab: 'profile',
    },
  ];

  return (
    <View className="mb-6">
      <Text className="text-slate-900 text-base font-black font-inter mb-3">
        Quick Jump
      </Text>

      <View className="flex-row flex-wrap justify-between gap-y-3">
        {shortcuts.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => onNavigate(item.tab)}
            activeOpacity={0.8}
            style={{ width: '48%' }}
            className="p-4 rounded-3xl bg-white border border-slate-100 shadow-sm flex-row items-center gap-3"
          >
            <View
              className="w-11 h-11 rounded-2xl items-center justify-center"
              style={{ backgroundColor: item.bg }}
            >
              <Ionicons name={item.icon as any} size={20} color={item.color} />
            </View>
            <View className="flex-1">
              <Text className="text-slate-900 font-black text-sm font-inter">
                {item.title}
              </Text>
              <Text
                numberOfLines={1}
                className="text-slate-400 text-[10px] font-bold font-inter mt-0.5"
              >
                {item.subtitle}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default QuickShortcutsGrid;
