import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LearnQuestion } from '../../../learn/types/learn.types';
import { GameAnswerRecord, GameSubmissionPayload } from '../../types/game.types';
import GameHUD from '../GameHUD';
import { useHapticFeedback } from '../../../../hooks/useHapticFeedback';

interface QuickMathGameProps {
  questions: LearnQuestion[];
  onFinishGame: (payload: GameSubmissionPayload) => void;
}

export const QuickMathGame: React.FC<QuickMathGameProps> = ({
  questions,
  onFinishGame,
}) => {
  const { triggerSuccess, triggerError } = useHapticFeedback();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [maxCombo, setMaxCombo] = useState(1);
  const [lives, setLives] = useState(3);
  const [timeRemaining, setTimeRemaining] = useState(60); // 60s speed challenge
  const [answers, setAnswers] = useState<GameAnswerRecord[]>([]);

  const timerRef = useRef<any>(null);
  const startTimeRef = useRef<number>(Date.now());
  const qStartTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    startTimeRef.current = Date.now();
    qStartTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // End game on time-out or zero lives
  useEffect(() => {
    if (timeRemaining === 0 || lives === 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      finishGame();
    }
  }, [timeRemaining, lives]);

  const finishGame = () => {
    const totalTimeMs = Date.now() - startTimeRef.current;
    const totalQuestions = answers.length;
    const correctCount = answers.filter((a) => a.isCorrect).length;
    const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    onFinishGame({
      gameType: 'quick_math',
      score,
      accuracy,
      maxCombo,
      totalTimeMs,
      answers,
    });
  };

  const handleAnswer = (userAnswer: any) => {
    const currentQ = questions[currentIdx];
    if (!currentQ) return;

    const timeSpent = Date.now() - qStartTimeRef.current;
    let isCorrect = false;

    if (currentQ.type === 'fill_blank') {
      const userStr = String(userAnswer).trim().toLowerCase();
      const acceptable = [currentQ.correctAnswer, ...(currentQ.acceptableAnswers || [])].map((a) =>
        String(a).trim().toLowerCase()
      );
      isCorrect = acceptable.includes(userStr);
    } else if (currentQ.type === 'numeric') {
      isCorrect = Number(userAnswer) === Number(currentQ.correctAnswer);
    } else {
      isCorrect = String(userAnswer).trim().toLowerCase() === String(currentQ.correctAnswer).trim().toLowerCase();
    }

    const newRecord: GameAnswerRecord = {
      questionId: currentQ._id,
      userAnswer,
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
      // Base score 100 * combo multiplier
      const points = 100 * combo;
      setScore((prev) => prev + points);
    } else {
      triggerError();
      setCombo(1);
      setLives((prev) => Math.max(prev - 1, 0));
    }

    if (currentIdx + 1 < questions.length && lives > (isCorrect ? 0 : 1) && timeRemaining > 0) {
      setCurrentIdx((prev) => prev + 1);
      qStartTimeRef.current = Date.now();
    } else {
      finishGame();
    }
  };

  const currentQ = questions[currentIdx] || questions[0];

  return (
    <View className="flex-1">
      {/* Arcade HUD */}
      <GameHUD
        score={score}
        combo={combo}
        lives={lives}
        maxLives={3}
        timeRemaining={timeRemaining}
        totalTimeLimit={60}
      />

      {/* Question Presentation Card */}
      <View className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-4">
        <View className="flex-row items-center justify-between mb-3">
          <View className="bg-purple-100 px-3 py-1 rounded-full">
            <Text className="text-primary font-black text-xs font-inter">
              Question {currentIdx + 1} of {questions.length}
            </Text>
          </View>
        </View>

        <Text className="text-slate-900 text-xl font-black font-inter leading-snug">
          {currentQ?.text || 'Math Challenge'}
        </Text>

        {/* Options Grid */}
        <View className="gap-y-3 mt-6">
          {(currentQ?.options && currentQ.options.length > 0
            ? currentQ.options
            : currentQ?.type === 'true_false'
            ? ['True', 'False']
            : ['A', 'B', 'C', 'D']
          ).map((opt: string, oIdx: number) => (
            <TouchableOpacity
              key={oIdx}
              onPress={() => handleAnswer(opt)}
              activeOpacity={0.8}
              className="p-4 rounded-2xl border-2 border-slate-200 bg-white flex-row items-center justify-between shadow-xs active:bg-purple-50 active:border-primary"
            >
              <View className="flex-row items-center gap-3 flex-1 pr-2">
                <View className="w-8 h-8 rounded-xl bg-slate-100 items-center justify-center">
                  <Text className="font-black text-xs text-slate-700">
                    {String.fromCharCode(65 + oIdx)}
                  </Text>
                </View>
                <Text className="text-base font-bold text-slate-800 font-inter flex-1">
                  {opt}
                </Text>
              </View>
              <Ionicons name="flash-outline" size={16} color="#8B5CF6" />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

export default QuickMathGame;
