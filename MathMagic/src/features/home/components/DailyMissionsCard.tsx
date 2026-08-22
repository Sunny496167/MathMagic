import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DailyMission } from '../types/home.types';

interface DailyMissionsCardProps {
  missions: DailyMission[];
  allCompleted: boolean;
  rewardClaimed: boolean;
  bonusXp: number;
  onClaimReward: () => void;
  onNavigateTab: (tab: 'learn' | 'practice' | 'game' | 'profile') => void;
}

export const DailyMissionsCard: React.FC<DailyMissionsCardProps> = ({
  missions,
  allCompleted,
  rewardClaimed,
  bonusXp = 50,
  onClaimReward,
  onNavigateTab,
}) => {
  const completedCount = missions.filter((m) => m.isCompleted).length;

  return (
    <View className="bg-white rounded-3xl p-5 mb-6 border border-slate-100 shadow-sm">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2">
          <View className="w-8 h-8 rounded-xl bg-amber-100 items-center justify-center">
            <Ionicons name="trophy" size={16} color="#D97706" />
          </View>
          <View>
            <Text className="text-slate-900 font-black text-base font-inter">
              Daily Missions
            </Text>
            <Text className="text-slate-400 text-xs font-bold font-inter">
              {completedCount} / {missions.length} Goals Completed
            </Text>
          </View>
        </View>

        {/* Claim Reward Pill */}
        {allCompleted && !rewardClaimed ? (
          <TouchableOpacity
            onPress={onClaimReward}
            activeOpacity={0.85}
            className="bg-amber-400 px-3.5 py-1.5 rounded-full flex-row items-center gap-1 shadow-sm"
          >
            <Ionicons name="sparkles" size={13} color="#78350F" />
            <Text className="text-amber-950 text-xs font-black font-inter">
              Claim +{bonusXp} XP
            </Text>
          </TouchableOpacity>
        ) : rewardClaimed ? (
          <View className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full flex-row items-center gap-1">
            <Ionicons name="checkmark-circle" size={13} color="#059669" />
            <Text className="text-emerald-800 text-xs font-bold font-inter">
              Claimed
            </Text>
          </View>
        ) : (
          <View className="bg-slate-100 px-2.5 py-1 rounded-full">
            <Text className="text-slate-500 text-[11px] font-black font-inter">
              +{bonusXp} XP Reward
            </Text>
          </View>
        )}
      </View>

      {/* Missions List */}
      <View className="gap-y-3">
        {missions.map((mission) => {
          const progressPercent = Math.min((mission.current / mission.target) * 100, 100);
          return (
            <TouchableOpacity
              key={mission.id}
              onPress={() => onNavigateTab(mission.targetTab)}
              activeOpacity={0.8}
              className={`p-3.5 rounded-2xl border flex-row items-center justify-between ${
                mission.isCompleted
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : 'bg-slate-50 border-slate-200/70'
              }`}
            >
              <View className="flex-row items-center gap-3 flex-1 mr-2">
                <View
                  className="w-10 h-10 rounded-2xl items-center justify-center"
                  style={{ backgroundColor: `${mission.color}15` }}
                >
                  <Ionicons
                    name={
                      mission.isCompleted ? 'checkmark-circle' : (mission.icon as any)
                    }
                    size={20}
                    color={mission.isCompleted ? '#059669' : mission.color}
                  />
                </View>

                <View className="flex-1">
                  <Text className="text-slate-900 font-bold text-xs font-inter">
                    {mission.title}
                  </Text>
                  <Text
                    numberOfLines={1}
                    className="text-slate-400 text-[11px] font-medium font-inter mt-0.5"
                  >
                    {mission.description}
                  </Text>
                </View>
              </View>

              <View className="items-end">
                <Text
                  className={`text-xs font-black font-inter ${
                    mission.isCompleted ? 'text-emerald-700' : 'text-slate-700'
                  }`}
                >
                  {mission.current} / {mission.target}
                </Text>
                <View className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1">
                  <View
                    style={{ width: `${progressPercent}%` }}
                    className={`h-full rounded-full ${
                      mission.isCompleted ? 'bg-emerald-500' : 'bg-primary'
                    }`}
                  />
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default DailyMissionsCard;
