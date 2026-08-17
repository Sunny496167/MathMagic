import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

const HERO_BANNER_IMAGE = require("@/assets/images/HeroBanner.png");

interface HeroBannerProps {
  onPressShopNow?: () => void;
}

const HeroBanner = memo(function HeroBanner({ onPressShopNow }: HeroBannerProps) {
  return (
    <View className="mx-6 my-4 rounded-2xl overflow-hidden h-64 relative bg-surface-light">
      <Image
        source={HERO_BANNER_IMAGE}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
        contentFit="cover"
      />
      {/* Dark Gradient Overlay for readability */}
      <View className="absolute inset-0 bg-black/40" />

      <View className="flex-1 justify-end p-6">
        <Text className="text-primary font-sans text-xs uppercase tracking-widest mb-2 font-bold">
          New Collection
        </Text>
        <Text className="text-text-primary font-serif flex-wrap text-4xl mb-4 leading-tight">
          Elegance,{"\n"}Redefined
        </Text>

        <TouchableOpacity
          className="bg-primary px-6 py-3 rounded-full self-start flex-row items-center shadow-lg shadow-black/50"
          activeOpacity={0.8}
          onPress={onPressShopNow}
        >
          <Text className="text-background font-sans font-bold text-sm mr-2">Shop Now</Text>
          <Ionicons name="arrow-forward" size={16} color="#0B0B0B" />
        </TouchableOpacity>
      </View>
    </View>
  );
});

export default HeroBanner;
