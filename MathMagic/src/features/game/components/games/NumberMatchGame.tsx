import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GamePairItem, GameSubmissionPayload, GameAnswerRecord } from '../../types/game.types';
import GameHUD from '../GameHUD';
import { useHapticFeedback } from '../../../../hooks/useHapticFeedback';

interface NumberMatchGameProps {
  pairs: GamePairItem[];
  onFinishGame: (payload: GameSubmissionPayload) => void;
}

export const NumberMatchGame: React.FC<NumberMatchGameProps> = ({
  pairs,
  onFinishGame,
}) => {
  const { triggerSuccess, triggerError, triggerLight } = useHapticFeedback();

  const [leftTiles, setLeftTiles] = useState<{ id: string; text: string }[]>([]);
  const [rightTiles, setRightTiles] = useState<{ id: string; text: string }[]>([]);

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);

  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [maxCombo, setMaxCombo] = useState(1);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [answers, setAnswers] = useState<GameAnswerRecord[]>([]);

  const timerRef = useRef<any>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    startTimeRef.current = Date.now();

    // Prepare left (questions) and shuffled right (answers)
    const validPairs = pairs.length > 0 ? pairs.slice(0, 6) : [
      { id: 'p1', left: '3 + 4', right: '7' },
      { id: 'p2', left: '10 - 2', right: '8' },
      { id: 'p3', left: '5 + 5', right: '10' },
      { id: 'p4', left: '9 - 3', right: '6' },
      { id: 'p5', left: '2 + 7', right: '9' },
      { id: 'p6', left: '8 - 4', right: '4' },
    ];

    setLeftTiles(validPairs.map((p) => ({ id: p.id, text: p.left })));
    setRightTiles(
      validPairs
        .map((p) => ({ id: p.id, text: p.right }))
        .sort(() => 0.5 - Math.random())
    );

    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [pairs]);

  // Evaluate pair selection
  useEffect(() => {
    if (selectedLeft && selectedRight) {
      if (selectedLeft === selectedRight) {
        // Correct Match!
        triggerSuccess();
        const nextCombo = combo + 1;
        setCombo(nextCombo);
        if (nextCombo > maxCombo) setMaxCombo(nextCombo);

        setScore((prev) => prev + 150 * combo);

        const newMatched = new Set(matchedIds);
        newMatched.add(selectedLeft);
        setMatchedIds(newMatched);

        setAnswers((prev) => [
          ...prev,
          {
            userAnswer: selectedRight,
            isCorrect: true,
            timeSpentMs: 2000,
          },
        ]);

        setSelectedLeft(null);
        setSelectedRight(null);

        // Check if all cleared
        if (newMatched.size >= leftTiles.length && leftTiles.length > 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          setTimeout(() => {
            finishGame(newMatched.size);
          }, 500);
        }
      } else {
        // Incorrect match
        triggerError();
        setCombo(1);
        setAnswers((prev) => [
          ...prev,
          {
            userAnswer: selectedRight,
            isCorrect: false,
            timeSpentMs: 2000,
          },
        ]);
        setTimeout(() => {
          setSelectedLeft(null);
          setSelectedRight(null);
        }, 400);
      }
    }
  }, [selectedLeft, selectedRight]);

  const finishGame = (matchedCount: number) => {
    const totalTimeMs = Date.now() - startTimeRef.current;
    const accuracy = answers.length > 0 ? Math.round((matchedCount / answers.length) * 100) : 100;

    onFinishGame({
      gameType: 'number_match',
      score,
      accuracy,
      maxCombo,
      totalTimeMs,
      answers,
    });
  };

  return (
    <View className="flex-1">
      {/* Game HUD */}
      <GameHUD score={score} combo={combo} elapsedSeconds={elapsedSeconds} />

      <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm mb-4">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-slate-900 font-black text-base font-inter">
            Match Pairs ({matchedIds.size} / {leftTiles.length})
          </Text>
          <Text className="text-slate-400 text-xs font-bold font-inter">
            Tap a problem & its answer
          </Text>
        </View>

        {/* Two-Column Matching Grid */}
        <View className="flex-row gap-3">
          {/* Left Column: Questions */}
          <View className="flex-1 gap-y-2.5">
            {leftTiles.map((tile) => {
              const isMatched = matchedIds.has(tile.id);
              const isSelected = selectedLeft === tile.id;
              if (isMatched) {
                return (
                  <View
                    key={tile.id}
                    className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 items-center opacity-40"
                  >
                    <Ionicons name="checkmark" size={18} color="#059669" />
                  </View>
                );
              }
              return (
                <TouchableOpacity
                  key={tile.id}
                  onPress={() => {
                    triggerLight();
                    setSelectedLeft(tile.id);
                  }}
                  activeOpacity={0.8}
                  className={`p-4 rounded-2xl border-2 items-center justify-center shadow-xs ${
                    isSelected
                      ? 'bg-purple-100 border-primary'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <Text className="text-base font-black text-slate-800 font-inter">
                    {tile.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Right Column: Answers */}
          <View className="flex-1 gap-y-2.5">
            {rightTiles.map((tile) => {
              const isMatched = matchedIds.has(tile.id);
              const isSelected = selectedRight === tile.id;
              if (isMatched) {
                return (
                  <View
                    key={tile.id}
                    className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 items-center opacity-40"
                  >
                    <Ionicons name="checkmark" size={18} color="#059669" />
                  </View>
                );
              }
              return (
                <TouchableOpacity
                  key={tile.id}
                  onPress={() => {
                    triggerLight();
                    setSelectedRight(tile.id);
                  }}
                  activeOpacity={0.8}
                  className={`p-4 rounded-2xl border-2 items-center justify-center shadow-xs ${
                    isSelected
                      ? 'bg-purple-100 border-primary'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <Text className="text-base font-black text-slate-800 font-inter">
                    {tile.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
};

export default NumberMatchGame;
