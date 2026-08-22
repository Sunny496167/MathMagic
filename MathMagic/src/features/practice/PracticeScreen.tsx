import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import SafeScreen from '../../components/common/SafeScreen';
import { PracticeStatsHeader } from './components/PracticeStatsHeader';
import { PracticeExerciseGroup } from './components/PracticeExerciseGroup';
import { DrillSessionModal } from './components/DrillSessionModal';
import { usePracticeFeed } from './hooks/usePracticeFeed';

export const PracticeScreen = () => {
  const navigation = useNavigation<any>();
  const {
    loading,
    gradeTitle,
    exerciseGroups,
    stats,
    selectedLevel,
    loadFeedData,
    handleOpenLevel,
    handleCloseLevel,
  } = usePracticeFeed();

  useFocusEffect(
    React.useCallback(() => {
      loadFeedData();
    }, [loadFeedData])
  );

  return (
    <SafeScreen>
      <View className="flex-1 bg-background">
        {/* Top Header */}
        <View className="px-6 py-5 border-b border-primary/5 bg-white flex-row justify-between items-center">
          <View className="flex-1 mr-3">
            <Text className="text-text-primary text-2xl font-black tracking-tight font-inter">
              Practice Drills
            </Text>
            <Text className="text-text-secondary text-xs font-semibold font-inter mt-0.5">
              {gradeTitle} • Multi-Level Skill Reinforcement
            </Text>
          </View>

          <TouchableOpacity
            onPress={loadFeedData}
            activeOpacity={0.8}
            className="w-10 h-10 bg-slate-50 border border-primary/5 rounded-full justify-center items-center"
          >
            <Ionicons name="refresh" size={18} color="#8B5CF6" />
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1 px-6 py-5"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80 }}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={loadFeedData}
              tintColor="#8B5CF6"
            />
          }
        >
          {/* Practice Header Stats */}
          <PracticeStatsHeader stats={stats} />

          {/* Section Heading */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-text-primary text-lg font-black font-inter">
              Unlocked Exercises
            </Text>
            <Text className="text-text-secondary text-xs font-semibold font-inter">
              {exerciseGroups.length} Exercises
            </Text>
          </View>

          {/* Practice Groups List or Empty State */}
          {loading && exerciseGroups.length === 0 ? (
            <View className="py-12 items-center justify-center">
              <ActivityIndicator size="large" color="#8B5CF6" />
              <Text className="text-slate-400 text-xs font-bold font-inter mt-3">
                Loading practice drills...
              </Text>
            </View>
          ) : exerciseGroups.length === 0 ? (
            <View className="bg-white rounded-3xl p-8 items-center justify-center border border-slate-100 mt-2 shadow-xs">
              <View className="w-16 h-16 rounded-full bg-purple-50 items-center justify-center mb-3">
                <Ionicons name="lock-closed-outline" size={28} color="#8B5CF6" />
              </View>
              <Text className="text-slate-900 text-base font-black font-inter text-center">
                Practice Drills Locked
              </Text>
              <Text className="text-slate-400 text-xs text-center font-medium font-inter mt-1.5 leading-relaxed">
                Complete exercises in the Learn Tab to unlock 30–50 question mastery drills!
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('learn')}
                activeOpacity={0.85}
                className="mt-5 bg-primary px-6 py-3.5 rounded-2xl flex-row items-center gap-2 shadow-sm"
              >
                <Text className="text-white font-black text-xs font-inter">
                  Go to Learn Tab
                </Text>
                <Ionicons name="arrow-forward" size={14} color="#FFF" />
              </TouchableOpacity>
            </View>
          ) : (
            exerciseGroups.map((group) => (
              <PracticeExerciseGroup
                key={group._id}
                item={group}
                onSelectLevel={handleOpenLevel}
              />
            ))
          )}
        </ScrollView>

        {/* Drill Session Runner Modal */}
        <DrillSessionModal
          visible={selectedLevel !== null}
          level={selectedLevel?.level || null}
          exerciseTitle={selectedLevel?.exerciseTitle || 'Exercise'}
          onClose={handleCloseLevel}
          onDrillCompleted={handleCloseLevel}
        />
      </View>
    </SafeScreen>
  );
};

export default PracticeScreen;
