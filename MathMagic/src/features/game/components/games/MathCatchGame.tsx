import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LearnQuestion } from '../../../learn/types/learn.types';
import { GameAnswerRecord, GameSubmissionPayload } from '../../types/game.types';
import GameHUD from '../GameHUD';
import { useHapticFeedback } from '../../../../hooks/useHapticFeedback';

interface MathCatchGameProps {
  questions: LearnQuestion[];
  onFinishGame: (payload: GameSubmissionPayload) => void;
}

export const MathCatchGame: React.FC<MathCatchGameProps> = ({
  questions,
  onFinishGame,
}) => {
  const { triggerSuccess, triggerError } = useHapticFeedback();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [maxCombo, setMaxCombo] = useState(1);
  const [lives, setLives] = useState(3);
  const [answers, setAnswers] = useState<GameAnswerRecord[]>([]);

  const startTimeRef = useRef<number>(Date.now());
  const qStartTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    startTimeRef.current = Date.now();
    qStartTimeRef.current = Date.now();
  }, []);

  const finishGame = () => {
    const totalTimeMs = Date.now() - startTimeRef.current;
    const totalQuestions = answers.length;
    const correctCount = answers.filter((a) => a.isCorrect).length;
    const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    onFinishGame({
      gameType: 'math_catch',
      score,
      accuracy,
      maxCombo,
      totalTimeMs,
      answers,
    });
  };

  const handleCatchOption = (opt: string) => {
    const currentQ = questions[currentIdx];
    if (!currentQ) return;

    const timeSpent = Date.now() - qStartTimeRef.current;
    const isCorrect = String(opt).trim().toLowerCase() === String(currentQ.correctAnswer).trim().toLowerCase();

    const newRecord: GameAnswerRecord = {
      questionId: currentQ._id,
      userAnswer: opt,
      isCorrect,
      timeSpentMs: timeSpent,
    };

    const updatedAnswers = [...answers, newRecord];
    setAnswers(updatedAnswers);

    if (isCorrect) {
      triggerSuccess();
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      if (nextCombo > maxCombo) setMaxCombo(nextCombo);
      setScore((prev) => prev + 120 * combo);
    } else {
      triggerError();
      setCombo(1);
      const nextLives = Math.max(lives - 1, 0);
      setLives(nextLives);
      if (nextLives === 0) {
        finishGame();
        return;
      }
    }

    if (currentIdx + 1 < questions.length && lives > 0) {
      setCurrentIdx((prev) => prev + 1);
      qStartTimeRef.current = Date.now();
    } else {
      finishGame();
    }
  };

  const currentQ = questions[currentIdx] || questions[0];
  const options = currentQ?.options && currentQ.options.length > 0 ? currentQ.options : ['2', '5', '8', '10'];

  return (
    <View className="flex-1">
      {/* Game HUD */}
      <GameHUD score={score} combo={combo} lives={lives} maxLives={3} />

      {/* Target Rule Banner */}
      <View className="bg-amber-400/15 rounded-3xl p-5 border border-amber-300 mb-4 items-center">
        <Text className="text-amber-800 text-xs font-black uppercase tracking-wider font-inter">
          Catch the Target Answer!
        </Text>
        <Text className="text-slate-900 text-xl font-black font-inter text-center mt-1">
          {currentQ?.text || 'Find matching number'}
        </Text>
      </View>

      {/* Falling Catch Bubble Grid */}
      <View className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex-1 justify-center">
        <View className="flex-row flex-wrap justify-between gap-y-4">
          {options.map((opt: string, idx: number) => (
            <TouchableOpacity
              key={idx}
              onPress={() => handleCatchOption(opt)}
              activeOpacity={0.75}
              style={{ width: '47%' }}
              className="p-5 rounded-3xl bg-amber-50/70 border-2 border-amber-200 items-center justify-center shadow-xs active:bg-amber-100 active:border-amber-400"
            >
              <View className="w-12 h-12 rounded-full bg-amber-100 items-center justify-center mb-2">
                <Ionicons name="sparkles-outline" size={20} color="#D97706" />
              </View>
              <Text className="text-xl font-black text-slate-800 font-inter text-center">
                {opt}
              </Text>
              <Text className="text-amber-700 text-[10px] font-bold font-inter mt-1">
                Tap to Catch
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

export default MathCatchGame;
