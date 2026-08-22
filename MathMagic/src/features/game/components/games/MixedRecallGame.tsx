import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LearnQuestion } from '../../../learn/types/learn.types';
import { GameAnswerRecord, GameSubmissionPayload } from '../../types/game.types';
import GameHUD from '../GameHUD';
import { useHapticFeedback } from '../../../../hooks/useHapticFeedback';

interface MixedRecallGameProps {
  questions: LearnQuestion[];
  onFinishGame: (payload: GameSubmissionPayload) => void;
}

export const MixedRecallGame: React.FC<MixedRecallGameProps> = ({
  questions,
  onFinishGame,
}) => {
  const { triggerSuccess, triggerError } = useHapticFeedback();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [maxCombo, setMaxCombo] = useState(1);
  const [lives, setLives] = useState(3);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [answers, setAnswers] = useState<GameAnswerRecord[]>([]);

  const [textInputVal, setTextInputVal] = useState('');

  const timerRef = useRef<any>(null);
  const startTimeRef = useRef<number>(Date.now());
  const qStartTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    startTimeRef.current = Date.now();
    qStartTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const finishGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const totalTimeMs = Date.now() - startTimeRef.current;
    const totalQuestions = answers.length;
    const correctCount = answers.filter((a) => a.isCorrect).length;
    const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    onFinishGame({
      gameType: 'mixed_recall',
      score,
      accuracy,
      maxCombo,
      totalTimeMs,
      answers,
    });
  };

  const handleAnswerSubmit = (userAnswer: any) => {
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
    setTextInputVal('');

    if (isCorrect) {
      triggerSuccess();
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      if (nextCombo > maxCombo) setMaxCombo(nextCombo);
      setScore((prev) => prev + 150 * combo);
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

    if (currentIdx + 1 < questions.length && lives > (isCorrect ? 0 : 1)) {
      setCurrentIdx((prev) => prev + 1);
      qStartTimeRef.current = Date.now();
    } else {
      finishGame();
    }
  };

  const currentQ = questions[currentIdx] || questions[0];

  const renderInputs = () => {
    const type = currentQ?.type || 'mcq';

    if (type === 'true_false') {
      return (
        <View className="flex-row gap-3 mt-4">
          {['True', 'False'].map((opt) => (
            <TouchableOpacity
              key={opt}
              onPress={() => handleAnswerSubmit(opt)}
              activeOpacity={0.8}
              className="flex-1 py-4 rounded-2xl border-2 border-slate-200 bg-white items-center justify-center shadow-xs active:bg-purple-50 active:border-primary"
            >
              <Text className="text-base font-black text-slate-800 font-inter">{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    if (type === 'numeric' || type === 'fill_blank') {
      return (
        <View className="mt-4 gap-y-3">
          <TextInput
            value={textInputVal}
            onChangeText={setTextInputVal}
            placeholder={type === 'numeric' ? 'Enter number...' : 'Type answer...'}
            placeholderTextColor="#94A3B8"
            keyboardType={type === 'numeric' ? 'numeric' : 'default'}
            autoFocus
            className="bg-white border-2 border-slate-200 rounded-2xl px-5 py-4 text-center text-xl font-bold text-slate-800 font-inter"
          />
          <TouchableOpacity
            onPress={() => handleAnswerSubmit(textInputVal.trim())}
            disabled={!textInputVal.trim()}
            activeOpacity={0.85}
            className={`py-4 rounded-2xl items-center justify-center flex-row gap-2 ${
              textInputVal.trim() ? 'bg-primary' : 'bg-slate-300'
            }`}
          >
            <Text className="text-white font-bold text-sm font-inter">Submit Answer</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>
      );
    }

    const options = currentQ?.options && currentQ.options.length > 0 ? currentQ.options : ['A', 'B', 'C', 'D'];
    return (
      <View className="gap-y-3 mt-4">
        {options.map((opt: string, oIdx: number) => (
          <TouchableOpacity
            key={oIdx}
            onPress={() => handleAnswerSubmit(opt)}
            activeOpacity={0.8}
            className="p-4 rounded-2xl border-2 border-slate-200 bg-white flex-row items-center justify-between shadow-xs active:bg-purple-50 active:border-primary"
          >
            <View className="flex-row items-center gap-3 flex-1 pr-2">
              <View className="w-8 h-8 rounded-xl bg-slate-100 items-center justify-center">
                <Text className="font-black text-xs text-slate-700">{String.fromCharCode(65 + oIdx)}</Text>
              </View>
              <Text className="text-base font-bold text-slate-800 font-inter flex-1">{opt}</Text>
            </View>
            <Ionicons name="trophy-outline" size={16} color="#D97706" />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View className="flex-1">
      {/* Game HUD */}
      <GameHUD
        score={score}
        combo={combo}
        lives={lives}
        maxLives={3}
        elapsedSeconds={elapsedSeconds}
      />

      <View className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-4">
        <View className="flex-row items-center justify-between mb-3">
          <View className="bg-rose-100 px-3 py-1 rounded-full flex-row items-center gap-1">
            <Ionicons name="shield" size={12} color="#E11D48" />
            <Text className="text-rose-700 font-black text-xs font-inter">
              Boss Round {currentIdx + 1} of {questions.length}
            </Text>
          </View>
        </View>

        <Text className="text-slate-900 text-xl font-black font-inter leading-snug">
          {currentQ?.text || 'Mixed Recall Challenge'}
        </Text>

        {renderInputs()}
      </View>
    </View>
  );
};

export default MixedRecallGame;
