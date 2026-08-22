import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DailyMathFact } from '../types/home.types';

interface MathFactCardProps {
  fact: DailyMathFact | null;
}

export const MathFactCard: React.FC<MathFactCardProps> = ({ fact }) => {
  if (!fact) return null;

  return (
    <View className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-5 mb-6">
      <View className="flex-row items-center gap-2 mb-2">
        <View className="w-7 h-7 rounded-xl bg-emerald-100 items-center justify-center">
          <Ionicons name="bulb-outline" size={16} color="#059669" />
        </View>
        <Text className="text-emerald-900 font-black text-xs uppercase tracking-wider font-inter">
          Math Fact of the Day: {fact.title}
        </Text>
      </View>

      <Text className="text-slate-700 text-xs font-semibold font-inter leading-relaxed">
        {fact.fact}
      </Text>
    </View>
  );
};

export default MathFactCard;
