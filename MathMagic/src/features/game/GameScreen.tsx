import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import SafeScreen from '../../components/common/SafeScreen';
import { GameCardConfig } from './types/game.types';
import { gameService } from './services/gameService';
import GameCard from './components/GameCard';
import ActiveGameRunnerModal from './components/ActiveGameRunnerModal';
import { useAuth } from '../../context/AuthContext';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';

export const GameScreen = () => {
  const { user } = useAuth();
  const { triggerLight } = useHapticFeedback();

  const [loading, setLoading] = useState(false);
  const [games, setGames] = useState<GameCardConfig[]>([]);
  const [selectedGame, setSelectedGame] = useState<GameCardConfig | null>(null);

  const loadGames = useCallback(async () => {
    setLoading(true);
    try {
      const data = await gameService.fetchAvailableGames();
      setGames(data || []);
    } catch (err: any) {
      console.warn('Failed to load games:', err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    React.useCallback(() => {
      loadGames();
    }, [loadGames])
  );

  const handleSelectGame = (game: GameCardConfig) => {
    if (!game.isUnlocked) return;
    triggerLight();
    setSelectedGame(game);
  };

  const totalStars = games.reduce((acc, g) => acc + (g.stars || 0), 0);
  const unlockedCount = games.filter((g) => g.isUnlocked).length;

  return (
    <SafeScreen>
      <View className="flex-1 bg-background">
        {/* Top Header */}
        <View className="px-6 py-5 border-b border-primary/5 bg-white flex-row justify-between items-center">
          <View className="flex-1 mr-3">
            <Text className="text-text-primary text-2xl font-black tracking-tight font-inter">
              Math Arcade
            </Text>
            <Text className="text-text-secondary text-xs font-semibold font-inter mt-0.5">
              Gamified Recall & Revision Micro-Games
            </Text>
          </View>

          <TouchableOpacity
            onPress={loadGames}
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
              onRefresh={loadGames}
              tintColor="#8B5CF6"
            />
          }
        >
          {/* Arcade Stats Row */}
          <View className="bg-white rounded-3xl p-4 mb-6 border border-slate-100 shadow-sm flex-row items-center justify-between">
            <View className="items-center flex-1">
              <View className="flex-row items-center gap-1 mb-0.5">
                <Ionicons name="game-controller-outline" size={14} color="#8B5CF6" />
                <Text className="text-slate-400 text-[10px] font-black uppercase font-inter">
                  Unlocked
                </Text>
              </View>
              <Text className="text-slate-900 text-base font-black font-inter">
                {unlockedCount} / {games.length}
              </Text>
            </View>

            <View className="h-7 w-[1px] bg-slate-100" />

            <View className="items-center flex-1">
              <View className="flex-row items-center gap-1 mb-0.5">
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text className="text-slate-400 text-[10px] font-black uppercase font-inter">
                  Total Stars
                </Text>
              </View>
              <Text className="text-slate-900 text-base font-black font-inter">
                {totalStars}
              </Text>
            </View>

            <View className="h-7 w-[1px] bg-slate-100" />

            <View className="items-center flex-1">
              <View className="flex-row items-center gap-1 mb-0.5">
                <Ionicons name="flash-outline" size={14} color="#10B981" />
                <Text className="text-slate-400 text-[10px] font-black uppercase font-inter">
                  Total XP
                </Text>
              </View>
              <Text className="text-slate-900 text-base font-black font-inter">
                {user?.xp || 0}
              </Text>
            </View>
          </View>

          {/* Section Header */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-text-primary text-lg font-black font-inter">
              Micro-Game Modes
            </Text>
            <Text className="text-text-secondary text-xs font-semibold font-inter">
              Spaced Repetition
            </Text>
          </View>

          {/* Games Grid */}
          {loading && games.length === 0 ? (
            <View className="py-12 items-center justify-center">
              <ActivityIndicator size="large" color="#8B5CF6" />
              <Text className="text-slate-400 text-xs font-bold font-inter mt-3">
                Loading arcade games...
              </Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap justify-between">
              {games.map((g) => (
                <GameCard
                  key={g.gameType}
                  game={g}
                  onPress={() => handleSelectGame(g)}
                />
              ))}
            </View>
          )}
        </ScrollView>

        {/* Active Game Runner Modal */}
        <ActiveGameRunnerModal
          visible={selectedGame !== null}
          game={selectedGame}
          onClose={() => setSelectedGame(null)}
          onGameCompleted={loadGames}
        />
      </View>
    </SafeScreen>
  );
};

export default GameScreen;
