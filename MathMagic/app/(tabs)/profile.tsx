import SafeScreen from "@/components/SafeScreen";
import { useAuth } from "@/context/AuthContext";
import { ScrollView, Text, TouchableOpacity, View, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { statsStorage, UserStats } from "@/lib/statsStorage";

export default function ProfileScreen() {
  const { signOut, user } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    xp: 0,
    streak: 0,
    highScore: 0,
    completedLessons: [],
    lastActiveDate: null,
  });

  useFocusEffect(
    React.useCallback(() => {
      loadStats();
    }, [])
  );

  const loadStats = async () => {
    const s = await statsStorage.getStats();
    setStats(s);
  };

  const handleResetProgress = () => {
    Alert.alert(
      "Reset Progress",
      "Are you sure you want to clear your stats, streak, and level progress? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            const resetData = await statsStorage.resetStats();
            setStats(resetData);
          },
        },
      ]
    );
  };

  const level = Math.floor(stats.xp / 100) + 1;
  const currentXpInLevel = stats.xp % 100;
  const xpProgressPercent = Math.min(Math.max(currentXpInLevel, 0), 100);

  // Badge logic
  const isProdigyUnlocked = stats.xp >= 100;
  const isSpeedsterUnlocked = stats.highScore >= 15;
  const isMasterUnlocked = stats.completedLessons.length >= 3;

  return (
    <SafeScreen>
      <View className="flex-1 bg-background">
        {/* Header */}
        <View className="px-6 py-5 border-b border-primary/5 bg-white flex-row justify-between items-center">
          <Text className="text-text-primary text-2xl font-bold tracking-tight">
            Profile
          </Text>
          <TouchableOpacity className="w-10 h-10 bg-slate-50 border border-primary/5 rounded-full justify-center items-center">
            <Ionicons name="settings-outline" size={18} color="#8B5CF6" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-6 py-5" showsVerticalScrollIndicator={false}>
          
          {/* User Profile Header Card */}
          <View className="bg-primary rounded-[32px] p-6 mb-6 shadow-md relative overflow-hidden">
            {/* Background design accents */}
            <View className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-white/10" />
            <View className="absolute -left-12 -bottom-12 w-32 h-32 rounded-full bg-white/5" />

            <View className="flex-row items-center mb-5">
              <View className="w-14 h-14 rounded-2xl bg-white/20 items-center justify-center mr-4">
                <Ionicons name="person" size={28} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text className="text-white text-lg font-bold font-inter">
                  {user?.name || "Math Learner"}
                </Text>
                <Text className="text-white/80 text-xs font-inter mt-0.5" numberOfLines={1}>
                  {user?.email || "mathlearner@gmail.com"}
                </Text>
              </View>
            </View>

            {/* Level & XP slider bar */}
            <View className="border-t border-white/10 pt-4">
              <View className="flex-row justify-between items-center mb-2">
                {/* Level badge */}
                <View className="bg-white/20 px-3 py-1 rounded-full border border-white/10">
                  <Text className="text-white font-bold text-[10px] uppercase font-inter">
                    Level {level}
                  </Text>
                </View>
                <Text className="text-white/90 font-bold text-xs font-inter">
                  {currentXpInLevel} / 100 XP
                </Text>
              </View>
              {/* Progress bar container */}
              <View className="h-2.5 bg-white/20 rounded-full overflow-hidden">
                <View
                  style={{ width: `${xpProgressPercent}%` }}
                  className="h-full bg-white rounded-full"
                />
              </View>
            </View>
          </View>

          {/* Statistics Horizontal Cards Row */}
          <Text className="text-text-secondary text-[11px] font-bold uppercase tracking-wider mb-3.5 font-inter">
            Stats
          </Text>
          <View className="flex-row justify-between mb-6">
            {[
              { id: "Practice", value: stats.completedLessons.length * 4 || 12, bg: "bg-[#E8F8F0]", border: "border-[#D1F2E1]", color: "#10B981", icon: "calculator" },
              { id: "Games", value: stats.highScore || 18, bg: "bg-[#F0F9FF]", border: "border-[#E0F2FE]", color: "#0284C7", icon: "game-controller" },
              { id: "Quizzes", value: stats.completedLessons.length || 9, bg: "bg-[#FEF3C7]", border: "border-[#FEEB9F]", color: "#D97706", icon: "trophy" },
              { id: "Streak", value: `${stats.streak}d`, bg: "bg-[#FFF1F2]", border: "border-[#FFE4E6]", color: "#F43F5E", icon: "flame" }
            ].map((stat) => (
              <View 
                key={stat.id} 
                className={`w-[23.5%] ${stat.bg} border ${stat.border} rounded-2xl py-3.5 items-center justify-center shadow-sm`}
              >
                <Ionicons name={stat.icon as any} size={18} color={stat.color} />
                <Text className="text-text-primary text-sm font-bold mt-1.5">{stat.value}</Text>
                <Text className="text-text-secondary text-[8px] font-bold uppercase mt-0.5">{stat.id}</Text>
              </View>
            ))}
          </View>

          {/* Menu Options list */}
          <View className="bg-white border border-primary/5 rounded-[32px] p-5 mb-6 shadow-sm">
            {[
              { id: "Achievements", icon: "ribbon-outline", color: "#8B5CF6" },
              { id: "My Progress", icon: "trending-up-outline", color: "#8B5CF6" },
              { id: "Settings", icon: "settings-outline", color: "#8B5CF6" },
              { id: "Help & Support", icon: "help-circle-outline", color: "#8B5CF6" }
            ].map((item, idx) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.7}
                className={`flex-row items-center justify-between py-3.5 ${
                  idx !== 3 ? "border-b border-primary/5" : ""
                }`}
              >
                <View className="flex-row items-center">
                  <Ionicons name={item.icon as any} size={20} color={item.color} className="mr-3" />
                  <Text className="text-text-primary text-sm font-bold font-inter">{item.id}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Control Actions */}
          <View className="gap-y-3 mb-10">
            <TouchableOpacity
              onPress={handleResetProgress}
              activeOpacity={0.8}
              className="bg-white border border-red-200 py-4 rounded-2xl items-center active:scale-95 transition-all shadow-sm"
            >
              <Text className="text-red-500 font-bold text-xs tracking-wider font-inter">
                RESET ALL PROGRESS
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={signOut}
              activeOpacity={0.8}
              className="bg-[#10B981] py-4 rounded-2xl items-center active:scale-95 transition-all shadow-sm"
            >
              <Text className="text-white font-bold text-xs tracking-wider font-inter">
                LOG OUT 🌟
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeScreen>
  );
}
