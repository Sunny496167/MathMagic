import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GameCardConfig, GameResultData, GameSubmissionPayload } from '../types/game.types';
import { gameService } from '../services/gameService';
import GameCountdown from './GameCountdown';
import GameResultModal from './GameResultModal';
import QuickMathGame from './games/QuickMathGame';
import NumberMatchGame from './games/NumberMatchGame';
import MemoryMathGame from './games/MemoryMathGame';
import MathCatchGame from './games/MathCatchGame';
import MixedRecallGame from './games/MixedRecallGame';

interface ActiveGameRunnerModalProps {
  visible: boolean;
  game: GameCardConfig | null;
  onClose: () => void;
  onGameCompleted?: () => void;
}

export const ActiveGameRunnerModal: React.FC<ActiveGameRunnerModalProps> = ({
  visible,
  game,
  onClose,
  onGameCompleted,
}) => {
  const [stage, setStage] = useState<'loading' | 'countdown' | 'playing' | 'result'>('loading');
  const [questions, setQuestions] = useState<any[]>([]);
  const [pairs, setPairs] = useState<any[]>([]);
  const [result, setResult] = useState<GameResultData | null>(null);

  useEffect(() => {
    if (visible && game) {
      startNewGame();
    } else {
      resetGame();
    }
  }, [visible, game]);

  const resetGame = () => {
    setStage('loading');
    setQuestions([]);
    setPairs([]);
    setResult(null);
  };

  const startNewGame = async () => {
    if (!game) return;
    resetGame();

    try {
      const data = await gameService.generateGameQuestions(
        game.gameType,
        game.defaultQuestionCount || 10
      );
      setQuestions(data.questions || []);
      setPairs(data.pairs || []);
      setStage('countdown');
    } catch (err: any) {
      console.warn('Failed to start game:', err.message);
      setStage('playing');
    }
  };

  const handleFinishGame = async (payload: GameSubmissionPayload) => {
    try {
      const res = await gameService.submitGameSession(payload);
      setResult(res);
    } catch (err: any) {
      console.warn('Failed to submit game session:', err.message);
      setResult({
        gameType: payload.gameType,
        score: payload.score,
        accuracy: payload.accuracy,
        maxCombo: payload.maxCombo,
        totalTimeMs: payload.totalTimeMs,
        totalCorrect: payload.answers.filter((a) => a.isCorrect).length,
        totalQuestions: payload.answers.length,
        starsEarned: 2,
        xpEarned: Math.round(payload.score / 5) + 30,
        isHighScore: false,
      });
    } finally {
      setStage('result');
      if (onGameCompleted) onGameCompleted();
    }
  };

  if (!visible || !game) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View className="flex-1 bg-background">
        {/* Header (During playing stage) */}
        {stage === 'playing' && (
          <View className="px-5 py-4 border-b border-slate-100 bg-white flex-row items-center justify-between">
            <TouchableOpacity
              onPress={onClose}
              className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center border border-slate-100"
            >
              <Ionicons name="close" size={20} color="#475569" />
            </TouchableOpacity>

            <View className="items-center flex-1 mx-3">
              <Text className="text-slate-900 font-black text-base font-inter">
                {game.title}
              </Text>
              <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider font-inter">
                {game.subtitle}
              </Text>
            </View>

            <View className="w-10 h-10 items-center justify-center">
              <View
                className="w-8 h-8 rounded-full items-center justify-center"
                style={{ backgroundColor: `${game.color}20` }}
              >
                <Ionicons name={game.icon as any} size={14} color={game.color} />
              </View>
            </View>
          </View>
        )}

        {/* Modal Stage Content */}
        {stage === 'loading' && (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={game.color || '#8B5CF6'} />
            <Text className="text-slate-400 text-xs font-bold font-inter mt-3">
              Assembling adaptive game pool...
            </Text>
          </View>
        )}

        {stage === 'countdown' && (
          <GameCountdown onComplete={() => setStage('playing')} />
        )}

        {stage === 'playing' && (
          <ScrollView
            className="flex-1 px-5 py-4"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 50 }}
          >
            {game.gameType === 'number_match' ? (
              <NumberMatchGame pairs={pairs} onFinishGame={handleFinishGame} />
            ) : game.gameType === 'memory_math' ? (
              <MemoryMathGame pairs={pairs} onFinishGame={handleFinishGame} />
            ) : game.gameType === 'math_catch' ? (
              <MathCatchGame questions={questions} onFinishGame={handleFinishGame} />
            ) : game.gameType === 'mixed_recall' ? (
              <MixedRecallGame questions={questions} onFinishGame={handleFinishGame} />
            ) : (
              <QuickMathGame questions={questions} onFinishGame={handleFinishGame} />
            )}
          </ScrollView>
        )}

        {stage === 'result' && (
          <ScrollView
            className="flex-1 px-5 py-6"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 50 }}
          >
            <GameResultModal
              result={result}
              gameTitle={game.title}
              onReplay={startNewGame}
              onClose={onClose}
            />
          </ScrollView>
        )}
      </View>
    </Modal>
  );
};

export default ActiveGameRunnerModal;
