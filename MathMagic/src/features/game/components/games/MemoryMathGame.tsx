import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GamePairItem, GameSubmissionPayload, GameAnswerRecord } from '../../types/game.types';
import GameHUD from '../GameHUD';
import { useHapticFeedback } from '../../../../hooks/useHapticFeedback';

interface MemoryCard {
  cardId: string;
  pairId: string;
  text: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryMathGameProps {
  pairs: GamePairItem[];
  onFinishGame: (payload: GameSubmissionPayload) => void;
}

export const MemoryMathGame: React.FC<MemoryMathGameProps> = ({
  pairs,
  onFinishGame,
}) => {
  const { triggerSuccess, triggerError, triggerLight } = useHapticFeedback();

  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [maxCombo, setMaxCombo] = useState(1);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [answers, setAnswers] = useState<GameAnswerRecord[]>([]);

  const timerRef = useRef<any>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    startTimeRef.current = Date.now();

    const validPairs = pairs.length >= 4 ? pairs.slice(0, 6) : [
      { id: 'p1', left: '2 + 3', right: '5' },
      { id: 'p2', left: '6 - 2', right: '4' },
      { id: 'p3', left: '4 + 4', right: '8' },
      { id: 'p4', left: '9 - 6', right: '3' },
      { id: 'p5', left: '1 + 6', right: '7' },
      { id: 'p6', left: '10 - 4', right: '6' },
    ];

    const deck: MemoryCard[] = [];
    validPairs.forEach((p, idx) => {
      deck.push({
        cardId: `c_${idx}_left`,
        pairId: p.id,
        text: p.left,
        isFlipped: false,
        isMatched: false,
      });
      deck.push({
        cardId: `c_${idx}_right`,
        pairId: p.id,
        text: p.right,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle deck
    setCards(deck.sort(() => 0.5 - Math.random()));

    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [pairs]);

  const handleCardTap = (index: number) => {
    if (flippedIndices.length >= 2) return;
    if (cards[index].isFlipped || cards[index].isMatched) return;

    triggerLight();

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      const idx1 = newFlipped[0];
      const idx2 = newFlipped[1];

      if (cards[idx1].pairId === cards[idx2].pairId) {
        // Matched!
        triggerSuccess();
        const nextCombo = combo + 1;
        setCombo(nextCombo);
        if (nextCombo > maxCombo) setMaxCombo(nextCombo);

        setScore((prev) => prev + 200 * combo);

        setTimeout(() => {
          const updatedCards = [...cards];
          updatedCards[idx1].isMatched = true;
          updatedCards[idx2].isMatched = true;
          setCards(updatedCards);
          setFlippedIndices([]);

          setAnswers((prev) => [
            ...prev,
            { userAnswer: cards[idx2].text, isCorrect: true, timeSpentMs: 2000 },
          ]);

          const remaining = updatedCards.filter((c) => !c.isMatched).length;
          if (remaining === 0) {
            if (timerRef.current) clearInterval(timerRef.current);
            finishGame();
          }
        }, 300);
      } else {
        // Missed
        triggerError();
        setCombo(1);
        setAnswers((prev) => [
          ...prev,
          { userAnswer: cards[idx2].text, isCorrect: false, timeSpentMs: 2000 },
        ]);

        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[idx1].isFlipped = false;
          resetCards[idx2].isFlipped = false;
          setCards(resetCards);
          setFlippedIndices([]);
        }, 900);
      }
    }
  };

  const finishGame = () => {
    const totalTimeMs = Date.now() - startTimeRef.current;
    const correctCount = answers.filter((a) => a.isCorrect).length;
    const accuracy = answers.length > 0 ? Math.round((correctCount / answers.length) * 100) : 100;

    onFinishGame({
      gameType: 'memory_math',
      score,
      accuracy,
      maxCombo,
      totalTimeMs,
      answers,
    });
  };

  const matchedPairsCount = cards.filter((c) => c.isMatched).length / 2;
  const totalPairsCount = cards.length / 2;

  return (
    <View className="flex-1">
      {/* Game HUD */}
      <GameHUD score={score} combo={combo} elapsedSeconds={elapsedSeconds} />

      <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm mb-4">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-slate-900 font-black text-base font-inter">
            Memory Grid ({matchedPairsCount} / {totalPairsCount} Pairs)
          </Text>
          <Text className="text-slate-400 text-xs font-bold font-inter">
            Flip 2 cards to match
          </Text>
        </View>

        {/* 3x4 or 4x3 Grid */}
        <View className="flex-row flex-wrap justify-between gap-y-3">
          {cards.map((card, idx) => {
            const isVisible = card.isFlipped || card.isMatched;
            return (
              <TouchableOpacity
                key={card.cardId}
                onPress={() => handleCardTap(idx)}
                activeOpacity={0.8}
                disabled={card.isMatched}
                style={{ width: '31%', aspectRatio: 1 }}
                className={`rounded-2xl items-center justify-center border-2 shadow-xs ${
                  card.isMatched
                    ? 'bg-emerald-50 border-emerald-300 opacity-60'
                    : isVisible
                    ? 'bg-purple-100 border-primary'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                {isVisible ? (
                  <Text className="text-base font-black text-slate-800 font-inter text-center px-1">
                    {card.text}
                  </Text>
                ) : (
                  <Ionicons name="help" size={24} color="#A78BFA" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

export default MemoryMathGame;
