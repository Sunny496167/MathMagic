import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { FeatureCarousel, type FeatureCarouselItem } from '../../../components/common';

interface WelcomeViewProps {
  onStart: () => void;
  onLogin: () => void;
}

const VALUE_PROPS: FeatureCarouselItem[] = [
  {
    id: 'visual',
    title: 'Visual & Interactive Lessons',
    subtitle: 'Step-by-step animations that make hard math concepts effortlessly clear.',
    icon: 'school',
    color: '#8B5CF6',
    bg: '#F5F3FF',
    badge: '100+ Topics',
  },
  {
    id: 'gamified',
    title: 'Daily Quests & Math Arena',
    subtitle: 'Play speed runs, earn gems, unlock badges & challenge friends.',
    icon: 'game-controller',
    color: '#10B981',
    bg: '#ECFDF5',
    badge: 'Play & Win',
  },
  {
    id: 'mastery',
    title: 'Track Progress & Ace Tests',
    subtitle: 'Instant AI feedback, streak rewards, and verified math IQ boosters.',
    icon: 'trophy',
    color: '#F59E0B',
    bg: '#FFFBEB',
    badge: 'Top Scores',
  },
];

export const WelcomeView = ({ onStart, onLogin }: WelcomeViewProps) => {
  const { height, width } = useWindowDimensions();

  // Responsive scale calculations
  const isSmallScreen = height < 740;
  const isLargeScreen = height >= 850;
  const heroSize = isSmallScreen ? 180 : isLargeScreen ? 230 : 205;
  const maxHeroWidth = Math.min(width - 48, 340);

  // Floating Micro-Animations with Reanimated Physics
  const float1 = useSharedValue(0);
  const float2 = useSharedValue(0);
  const float3 = useSharedValue(0);
  const float4 = useSharedValue(0);

  useEffect(() => {
    float1.value = withRepeat(
      withSequence(
        withTiming(-7, { duration: 1900, easing: Easing.inOut(Easing.sin) }),
        withTiming(7, { duration: 1900, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );

    float2.value = withRepeat(
      withSequence(
        withTiming(6, { duration: 2300, easing: Easing.inOut(Easing.sin) }),
        withTiming(-8, { duration: 2300, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );

    float3.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 2100, easing: Easing.inOut(Easing.sin) }),
        withTiming(6, { duration: 2100, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );

    float4.value = withRepeat(
      withSequence(
        withTiming(7, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
        withTiming(-6, { duration: 2500, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, []);

  const badgeStyle1 = useAnimatedStyle(() => ({
    transform: [{ translateY: float1.value }, { rotate: '-6deg' }],
  }));

  const badgeStyle2 = useAnimatedStyle(() => ({
    transform: [{ translateY: float2.value }, { rotate: '6deg' }],
  }));

  const badgeStyle3 = useAnimatedStyle(() => ({
    transform: [{ translateY: float3.value }, { rotate: '5deg' }],
  }));

  const badgeStyle4 = useAnimatedStyle(() => ({
    transform: [{ translateY: float4.value }, { rotate: '-5deg' }],
  }));

  const handleStartPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    onStart();
  };

  const handleLoginPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onLogin();
  };

  return (
    <View className="flex-1 px-5 pt-2 pb-6 justify-between">
      {/* Top Header / Brand Bar */}
      <Animated.View
        entering={FadeInDown.duration(600).delay(100)}
        className="flex-row items-center justify-between px-1"
      >
        <View className="flex-row items-center gap-2.5">
          <View className="rounded-xl overflow-hidden shadow-sm shadow-purple-500/20 border border-purple-200/60">
            <Image
              source={require('../../../../assets/images/icon.png')}
              style={{ width: 40, height: 40 }}
              contentFit="cover"
              transition={300}
            />
          </View>
          <View className="justify-center">
            <View className="flex-row items-center gap-1.5">
              <Text className="text-xl font-black text-slate-800 tracking-tight">Math</Text>
              <Text className="text-xl font-black text-purple-600 tracking-tight">Magic</Text>
              <View className="bg-purple-100 border border-purple-200 px-1.5 py-0.5 rounded-full">
                <Text className="text-purple-700 text-[9px] font-black tracking-wider">PRO</Text>
              </View>
            </View>
            <Text className="text-[11px] text-slate-500 font-semibold -mt-0.5">
              The Adventure of Numbers ✨
            </Text>
          </View>
        </View>

        <TouchableOpacity
          className="w-10 h-10 rounded-2xl bg-white/90 border border-purple-200 items-center justify-center shadow-sm shadow-purple-500/10 active:scale-90"
          activeOpacity={0.7}
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.selectionAsync();
            }
          }}
        >
          <Ionicons name="sparkles" size={18} color="#8B5CF6" />
        </TouchableOpacity>
      </Animated.View>

      {/* Main Title & Hero Hook */}
      <Animated.View
        entering={FadeInDown.duration(650).delay(200)}
        className="items-center my-1 px-2"
      >
        <Text className="text-[26px] font-black text-slate-900 text-center tracking-tight leading-tight">
          Learn Math Faster with{' '}
          <Text className="text-purple-600">Pure Joy</Text>
        </Text>
        <Text className="text-xs text-slate-500 text-center mt-1.5 leading-relaxed font-medium px-4">
          Master everyday math, conquer tough tests & level up your brain with gamified adventures!
        </Text>
      </Animated.View>

      {/* Hero Showcase with Character Illustration & Dynamic Badges */}
      <Animated.View
        entering={FadeInUp.duration(700).delay(300)}
        className="self-center items-center justify-center my-2 relative"
        style={{ width: maxHeroWidth, height: heroSize }}
      >
        {/* Floating Badge 1 - Top Left */}
        <Animated.View
          className="absolute left-[-8px] top-1 z-20 shadow-md shadow-blue-500/20"
          style={badgeStyle1}
        >
          <LinearGradient
            colors={['#EFF6FF', '#DBEAFE']}
            className="flex-row items-center gap-1 px-3 py-1.5 rounded-full border border-blue-200"
          >
            <Text className="text-xs font-black text-blue-700">✨ 2 + 3 = 5</Text>
          </LinearGradient>
        </Animated.View>

        {/* Floating Badge 2 - Top Right */}
        <Animated.View
          className="absolute right-[-8px] top-2 z-20 shadow-md shadow-amber-500/20"
          style={badgeStyle2}
        >
          <LinearGradient
            colors={['#FFFBEB', '#FEF3C7']}
            className="flex-row items-center gap-1 px-3 py-1.5 rounded-full border border-amber-200"
          >
            <Text className="text-xs font-black text-amber-800">π ≈ 3.14</Text>
          </LinearGradient>
        </Animated.View>

        {/* Floating Badge 3 - Bottom Left */}
        <Animated.View
          className="absolute left-[-6px] bottom-3 z-20 shadow-md shadow-emerald-500/20"
          style={badgeStyle3}
        >
          <LinearGradient
            colors={['#ECFDF5', '#D1FAE5']}
            className="flex-row items-center gap-1 px-3 py-1.5 rounded-full border border-emerald-200"
          >
            <Ionicons name="flash" size={12} color="#059669" />
            <Text className="text-xs font-black text-emerald-800">100 XP Boost</Text>
          </LinearGradient>
        </Animated.View>

        {/* Floating Badge 4 - Bottom Right */}
        <Animated.View
          className="absolute right-[-6px] bottom-4 z-20 shadow-md shadow-purple-500/20"
          style={badgeStyle4}
        >
          <LinearGradient
            colors={['#FAF5FF', '#F3E8FF']}
            className="flex-row items-center gap-1 px-3 py-1.5 rounded-full border border-purple-200"
          >
            <Ionicons name="trophy" size={12} color="#7C3AED" />
            <Text className="text-xs font-black text-purple-800">Mastery Lv.5</Text>
          </LinearGradient>
        </Animated.View>

        {/* Core Hero Frame Portal */}
        <View className="w-full h-full rounded-[32px] bg-white border-2 border-purple-200/80 p-2 overflow-hidden shadow-xl shadow-purple-600/15 justify-center items-center">
          <Image
            source={require('../../../../assets/images/student_learning.jpg')}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            transition={300}
          />
        </View>
      </Animated.View>

      {/* Interactive Value Carousel Card */}
      <Animated.View entering={FadeInUp.duration(750).delay(400)} className="w-full my-1">
        <FeatureCarousel
          items={VALUE_PROPS}
          containerClassName="bg-white/95 rounded-3xl border border-purple-200/80 p-4 shadow-sm shadow-purple-500/10"
        />
      </Animated.View>

      {/* Duolingo-style 3D Action Buttons */}
      <Animated.View
        entering={FadeInUp.duration(800).delay(500)}
        className="w-full items-center gap-2.5 mt-2"
      >
        {/* Primary 3D Gradient CTA */}
        <TouchableOpacity
          onPress={handleStartPress}
          activeOpacity={0.9}
         className="w-full rounded-2xl bg-purple-500 border-2 border-purple-600 border-b-4 border-b-purple-700 py-3.5 items-center justify-center shadow-sm active:translate-y-0.5"
        >
          <View className="flex-row gap-2">
            <Text className="text-white text-center item-center text-base font-black tracking-wider uppercase">
              GET STARTED FREE
            </Text>
            <View className="w-6 h-6 rounded-full bg-white/20 items-center justify-center">
              <Ionicons name="arrow-forward" size={15} color="#FFFFFF" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Secondary 3D Outline CTA */}
        <TouchableOpacity
          onPress={handleLoginPress}
          activeOpacity={0.8}
          className="w-full rounded-2xl bg-white border-2 border-purple-200 border-b-4 border-b-purple-300 py-3.5 items-center justify-center shadow-sm active:translate-y-0.5"
        >
          <Text className="text-purple-800 text-sm font-extrabold tracking-wider uppercase">
            I ALREADY HAVE AN ACCOUNT
          </Text>
        </TouchableOpacity>

        {/* Social Proof & Trust Strip */}
        <View className="flex-row items-center justify-center gap-2 mt-1">
          <View className="flex-row items-center gap-1">
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text className="text-[11px] text-slate-500 font-bold">4.9/5 Rating</Text>
          </View>
          <View className="w-1 h-1 rounded-full bg-slate-300" />
          <View className="flex-row items-center gap-1">
            <MaterialCommunityIcons name="shield-check" size={13} color="#10B981" />
            <Text className="text-[11px] text-slate-500 font-bold">100% Safe</Text>
          </View>
          <View className="w-1 h-1 rounded-full bg-slate-300" />
          <View className="flex-row items-center gap-1">
            <Ionicons name="people" size={12} color="#8B5CF6" />
            <Text className="text-[11px] text-slate-500 font-bold">50k+ Learners</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

export default WelcomeView;
