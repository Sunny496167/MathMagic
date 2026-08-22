import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ContentBlock } from '../types/learn.types';

interface ContentBlockRendererProps {
  blocks?: ContentBlock[];
}

export const ContentBlockRenderer: React.FC<ContentBlockRendererProps> = ({ blocks = [] }) => {
  if (!blocks || blocks.length === 0) {
    return (
      <View className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
        <Text className="text-slate-500 text-sm italic font-inter">
          No learning notes for this exercise. Ready to begin practice questions!
        </Text>
      </View>
    );
  }

  return (
    <View className="gap-y-3.5 mb-6">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'heading':
            return (
              <View key={idx} className="mt-2 mb-1">
                <Text className="text-slate-900 text-lg font-black font-inter tracking-tight">
                  {block.content}
                </Text>
              </View>
            );

          case 'example':
            return (
              <View
                key={idx}
                className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 shadow-sm"
              >
                <View className="flex-row items-center gap-2 mb-1.5">
                  <View className="w-6 h-6 rounded-lg bg-amber-500 items-center justify-center">
                    <Ionicons name="sparkles" size={14} color="#FFF" />
                  </View>
                  <Text className="text-amber-900 font-black text-xs uppercase tracking-wider font-inter">
                    Worked Example
                  </Text>
                </View>
                <Text className="text-amber-950 text-sm font-semibold leading-relaxed font-inter pl-1">
                  {block.content}
                </Text>
              </View>
            );

          case 'tip':
            return (
              <View
                key={idx}
                className="bg-purple-50/90 border border-purple-200/90 rounded-2xl p-4 shadow-sm"
              >
                <View className="flex-row items-center gap-2 mb-1.5">
                  <View className="w-6 h-6 rounded-lg bg-purple-600 items-center justify-center">
                    <Ionicons name="bulb" size={14} color="#FFF" />
                  </View>
                  <Text className="text-purple-900 font-black text-xs uppercase tracking-wider font-inter">
                    Magic Tip
                  </Text>
                </View>
                <Text className="text-purple-950 text-sm font-medium leading-relaxed font-inter pl-1">
                  {block.content}
                </Text>
              </View>
            );

          case 'formula':
          case 'note':
            return (
              <View
                key={idx}
                className="bg-blue-50/90 border border-blue-200/90 rounded-2xl p-4 shadow-sm"
              >
                <View className="flex-row items-center gap-2 mb-1.5">
                  <View className="w-6 h-6 rounded-lg bg-blue-600 items-center justify-center">
                    <Ionicons name="information-circle" size={14} color="#FFF" />
                  </View>
                  <Text className="text-blue-900 font-black text-xs uppercase tracking-wider font-inter">
                    Key Note
                  </Text>
                </View>
                <Text className="text-blue-950 text-sm font-medium leading-relaxed font-inter pl-1">
                  {block.content}
                </Text>
              </View>
            );

          case 'text':
          default:
            return (
              <View key={idx} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                <Text className="text-slate-700 text-sm font-normal leading-relaxed font-inter">
                  {block.content}
                </Text>
              </View>
            );
        }
      })}
    </View>
  );
};

export default ContentBlockRenderer;
