import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  Dimensions,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { resolveImageUrl } from "@/lib/utils";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export interface CarouselItem {
  id: string;
  imageUri: string;
  subtitle: string;
  title: string;
  ctaText: string;
  onPress: () => void;
}

interface HomeCarouselProps {
  items: CarouselItem[];
}

export default function HomeCarousel({ items }: HomeCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<CarouselItem>>(null);

  // Auto-sliding effect
  useEffect(() => {
    if (items.length <= 1) return;

    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % items.length;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setActiveIndex(nextIndex);
    }, 4500); // Auto slide every 4.5 seconds

    return () => clearInterval(interval);
  }, [activeIndex, items.length]);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const getItemLayout = useCallback((_: any, index: number) => ({
    length: SCREEN_WIDTH,
    offset: SCREEN_WIDTH * index,
    index,
  }), []);

  const onScrollToIndexFailed = useCallback((info: { index: number; highestMeasuredFrameIndex: number }) => {
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index: info.index,
        animated: false,
      });
    }, 500);
  }, []);

  const renderItem = useCallback(({ item }: { item: CarouselItem }) => {
    return (
      <View style={{ width: SCREEN_WIDTH }} className="px-6 py-2">
        <View className="rounded-3xl overflow-hidden h-72 relative bg-surface border border-surface-light shadow-xl">
          <Image
            source={{ uri: resolveImageUrl(item.imageUri) }}
            style={{ position: "absolute", width: "100%", height: "100%" }}
            contentFit="cover"
            transition={300}
          />
          {/* Dark Gradient Overlay for optimal text readability */}
          <View className="absolute inset-0 bg-black/45" />

          {/* Carousel Contents */}
          <View className="flex-1 justify-end p-6">
            <Text className="text-primary font-sans text-xs uppercase tracking-widest mb-2 font-bold">
              {item.subtitle}
            </Text>
            <Text className="text-text-primary font-serif flex-wrap text-3xl mb-4 leading-tight">
              {item.title}
            </Text>

            <TouchableOpacity
              className="bg-primary px-5 py-2.5 rounded-full self-start flex-row items-center shadow-lg active:opacity-90"
              activeOpacity={0.8}
              onPress={item.onPress}
            >
              <Text className="text-background font-sans font-bold text-xs uppercase tracking-wider mr-1.5">
                {item.ctaText}
              </Text>
              <Ionicons name="arrow-forward" size={14} color="#0B0B0B" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }, []);

  return (
    <View className="my-2">
      <FlatList
        ref={flatListRef}
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={getItemLayout}
        onScrollToIndexFailed={onScrollToIndexFailed}
        snapToInterval={SCREEN_WIDTH}
        decelerationRate="fast"
      />

      {/* Pagination Indicator Dots */}
      <View className="flex-row justify-center items-center gap-1.5 mt-3">
        {items.map((_, index) => {
          const isActive = index === activeIndex;
          return (
            <View
              key={index}
              className={`rounded-full transition-all duration-300 ${
                isActive ? "w-6 h-1.5 bg-primary" : "w-1.5 h-1.5 bg-surface-light border border-surface"
              }`}
            />
          );
        })}
      </View>
    </View>
  );
}
