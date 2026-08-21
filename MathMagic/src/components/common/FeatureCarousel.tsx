import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export interface FeatureCarouselItem {
  id: string;
  title: string;
  subtitle: string;
  icon?: keyof typeof Ionicons.glyphMap;
  color?: string;
  bg?: string;
  badge?: string;
}

export interface FeatureCarouselProps {
  items: FeatureCarouselItem[];
  autoRotateInterval?: number; // In ms, default 4000. Pass 0 to disable auto-rotation.
  activeIndex?: number;
  onIndexChange?: (index: number) => void;
  onItemPress?: (item: FeatureCarouselItem, index: number) => void;
  containerClassName?: string;
  activeDotClassName?: string;
  inactiveDotClassName?: string;
}

export const FeatureCarousel = ({
  items,
  autoRotateInterval = 4000,
  activeIndex: controlledIndex,
  onIndexChange,
  onItemPress,
  containerClassName = 'bg-white rounded-3xl border border-purple-200 p-4 shadow-sm',
  activeDotClassName = 'w-7 bg-purple-600',
  inactiveDotClassName = 'w-2 bg-slate-300',
}: FeatureCarouselProps) => {
  const [internalIndex, setInternalIndex] = useState(0);

  const isControlled = controlledIndex !== undefined;
  const currentIndex = isControlled ? controlledIndex : internalIndex;

  const setIndex = (newIndex: number) => {
    if (!isControlled) {
      setInternalIndex(newIndex);
    }
    onIndexChange?.(newIndex);
  };

  // Auto-advance
  useEffect(() => {
    if (!autoRotateInterval || items.length <= 1) return;

    const timer = setInterval(() => {
      setIndex((currentIndex + 1) % items.length);
    }, autoRotateInterval);

    return () => clearInterval(timer);
  }, [autoRotateInterval, items.length, currentIndex]);

  const handleSelect = (idx: number) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    setIndex(idx);
  };

  const handleCardPress = () => {
    const nextIdx = (currentIndex + 1) % items.length;
    handleSelect(nextIdx);
    onItemPress?.(items[currentIndex], currentIndex);
  };

  if (!items || items.length === 0) return null;

  const currentItem = items[currentIndex] || items[0];
  const itemColor = currentItem.color || '#8B5CF6';
  const itemBg = currentItem.bg || '#F5F3FF';

  return (
    <View className={containerClassName}>
      {/* Active Feature Card */}
      <Pressable className="flex-row items-center gap-3.5" onPress={handleCardPress}>
        {currentItem.icon && (
          <View
            className="w-12 h-12 rounded-2xl border items-center justify-center shadow-sm"
            style={{ backgroundColor: itemBg, borderColor: `${itemColor}30` }}
          >
            <Ionicons name={currentItem.icon} size={24} color={itemColor} />
          </View>
        )}
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-[14px] font-extrabold text-slate-800">{currentItem.title}</Text>
            {currentItem.badge && (
              <View
                className="px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${itemColor}15` }}
              >
                <Text className="text-[10px] font-extrabold" style={{ color: itemColor }}>
                  {currentItem.badge}
                </Text>
              </View>
            )}
          </View>
          <Text className="text-xs text-slate-500 leading-4 font-medium" numberOfLines={2}>
            {currentItem.subtitle}
          </Text>
        </View>
      </Pressable>

      {/* Pagination Indicator Dots */}
      {items.length > 1 && (
        <View className="flex-row items-center justify-center gap-1.5 mt-3 pt-2.5 border-t border-slate-100">
          {items.map((item, idx) => {
            const isActive = idx === currentIndex;
            return (
              <TouchableOpacity
                key={item.id || idx}
                onPress={() => handleSelect(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  isActive ? activeDotClassName : inactiveDotClassName
                }`}
                activeOpacity={0.7}
              />
            );
          })}
        </View>
      )}
    </View>
  );
};

export default FeatureCarousel;
