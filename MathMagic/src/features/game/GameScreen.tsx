import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import SafeScreen from '../../components/common/SafeScreen';
import { GameIdleView } from './components/GameIdleView';
import { GamePlayingView } from './components/GamePlayingView';
import { GameOverModal } from './components/GameOverModal';
import { useMathGame } from './hooks/useMathGame';

export const GameScreen = () => {
  const {
    stats,
    gameState,
    score,
    timeLeft,
    question,
    userAnswer,
    shake,
    startGame,
    endGame,
    handleKeyPress,
    handleDelete,
    loadStats,
  } = useMathGame();

  useFocusEffect(
    React.useCallback(() => {
      loadStats();
    }, [])
  );

  return (
    <SafeScreen>
      <View className="flex-1 bg-background">
        {/* Header */}
        <View className="px-6 py-5 border-b border-primary/5 bg-white flex-row justify-between items-center">
          <View>
            <Text className="text-text-primary text-2xl font-bold tracking-tight">
              Math Game
            </Text>
            <Text className="text-text-secondary text-xs mt-0.5">
              Speed & accuracy training
            </Text>
          </View>
          <TouchableOpacity className="w-10 h-10 bg-slate-50 border border-primary/5 rounded-full justify-center items-center">
            <Ionicons name="trophy-outline" size={18} color="#8B5CF6" />
          </TouchableOpacity>
        </View>

        {/* Content based on state */}
        {gameState === 'idle' || gameState === 'gameover' ? (
          <GameIdleView stats={stats} onStartGame={startGame} />
        ) : (
          <GamePlayingView
            score={score}
            timeLeft={timeLeft}
            question={question}
            userAnswer={userAnswer}
            shake={shake}
            onKeyPress={handleKeyPress}
            onDelete={handleDelete}
          />
        )}

        {/* Game Over Modal */}
        <GameOverModal
          visible={gameState === 'gameover'}
          score={score}
          stats={stats}
          onPlayAgain={startGame}
          onClose={() => {}}
        />
      </View>
    </SafeScreen>
  );
};

export default GameScreen;
