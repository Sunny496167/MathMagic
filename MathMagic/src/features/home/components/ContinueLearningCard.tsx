import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { ContinueLessonData } from '../types/home.types';

interface ContinueLearningCardProps {
  lesson: ContinueLessonData | null;
  onPressResume: () => void;
}

export const ContinueLearningCard: React.FC<ContinueLearningCardProps> = ({
  lesson,
  onPressResume,
}) => {
  // Micro-floating physics for interactive adventure badge
  const floatAnim = useSharedValue(0);

  useEffect(() => {
    floatAnim.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(5, { duration: 2000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, []);

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatAnim.value }],
  }));

  const isCompleted = lesson?.isCompleted;

  return (
    <View className="rounded-[32px] overflow-hidden mb-6 shadow-lg shadow-purple-600/20 border-2 border-purple-200/40 relative">
      {/* Background Hero Image */}
      <Image
        source={require('../../../../assets/images/home_hero_banner.jpg')}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        transition={400}
      />

      {/* Gradient Overlay for Text Readability & Contrast */}
      <LinearGradient
        colors={[
          'rgba(15, 23, 42, 0.35)',
          'rgba(76, 29, 149, 0.78)',
          'rgba(15, 23, 42, 0.92)',
        ]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Card Content */}
      <View className="p-6 flex-col justify-between min-h-[220px]">
        {/* Top Header Row with Floating Badge */}
        <View className="flex-row items-center justify-between mb-2">
          <Animated.View style={badgeStyle}>
            <View className="bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full flex-row items-center gap-1.5 border border-white/30">
              <Ionicons name="sparkles" size={13} color="#FDE047" />
              <Text className="text-white text-[11px] font-black uppercase tracking-wider font-inter">
                {isCompleted ? 'Mastery Review' : 'Current Adventure'}
              </Text>
            </View>
          </Animated.View>

          {lesson?.subtopicNumber ? (
            <View className="bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/20">
              <Text className="text-white/90 text-xs font-bold font-inter">
                Subtopic {lesson.subtopicNumber}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Middle Content */}
        <View className="my-2">
          <Text className="text-purple-200 text-xs font-black uppercase tracking-wider font-inter">
            {lesson?.topicTitle || 'Grade 1 Math Quest'}
          </Text>

          <Text
            numberOfLines={2}
            className="text-white text-2xl font-black font-inter tracking-tight mt-1 leading-tight drop-shadow-md"
          >
            {lesson?.exerciseTitle || 'Start Your Math Adventure!'}
          </Text>
        </View>

        {/* Action Button & XP Tip */}
        <View className="flex-row items-center justify-between mt-3 pt-2 border-t border-white/15">
          <TouchableOpacity
            onPress={onPressResume}
            activeOpacity={0.85}
            className="bg-white py-3.5 px-6 rounded-2xl items-center flex-row justify-center gap-2 shadow-md shadow-black/30 active:scale-95"
          >
            <Ionicons name="play" size={16} color="#7C3AED" />
            <Text className="text-purple-900 font-black text-sm font-inter">
              {isCompleted ? 'Review Lesson' : 'Resume Lesson'}
            </Text>
          </TouchableOpacity>

          <View className="flex-row items-center gap-1 bg-white/10 px-3 py-2 rounded-2xl border border-white/20">
            <Ionicons name="flash" size={13} color="#FDE047" />
            <Text className="text-yellow-300 text-xs font-black font-inter">
              +25 XP
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ContinueLearningCard;
