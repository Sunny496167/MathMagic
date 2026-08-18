import { useState, useEffect, useRef } from 'react';
import { Vibration } from 'react-native';
import { statsStorage } from '../../../services/statsStorage';
import { useHapticFeedback } from '../../../hooks/useHapticFeedback';
import { GameState } from '../types/game.types';
import { UserStats } from '../../../types';

export const useMathGame = () => {
  const [stats, setStats] = useState<UserStats>({
    xp: 0,
    streak: 0,
    highScore: 0,
    completedLessons: [],
    lastActiveDate: null,
  });

  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [question, setQuestion] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [shake, setShake] = useState(false);

  const timerRef = useRef<any>(null);
  const { triggerSuccess, triggerError } = useHapticFeedback();

  useEffect(() => {
    loadStats();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const loadStats = async () => {
    const s = await statsStorage.getStats();
    setStats(s);
  };

  const nextQuestion = () => {
    setUserAnswer('');
    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a = Math.floor(Math.random() * 12) + 1;
    let b = Math.floor(Math.random() * 12) + 1;

    let ans = 0;
    if (op === '+') {
      ans = a + b;
    } else if (op === '-') {
      if (a < b) {
        const temp = a;
        a = b;
        b = temp;
      }
      ans = a - b;
    } else {
      a = Math.floor(Math.random() * 9) + 1;
      b = Math.floor(Math.random() * 9) + 1;
      ans = a * b;
    }

    setQuestion(`${a} ${op} ${b}`);
    setCorrectAnswer(ans);
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setUserAnswer('');
    setGameState('playing');
    nextQuestion();

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const endGame = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameState('gameover');

    const xpEarned = score * 5;
    if (xpEarned > 0) {
      await statsStorage.addXp(xpEarned);
    }
    const updatedStats = await statsStorage.updateHighScore(score);
    setStats(updatedStats);
  };

  const handleKeyPress = (numStr: string) => {
    if (gameState !== 'playing') return;
    if (userAnswer.length < 4) {
      const nextAns = userAnswer + numStr;
      setUserAnswer(nextAns);
      checkLiveAnswer(nextAns);
    }
  };

  const handleDelete = () => {
    if (gameState !== 'playing') return;
    setUserAnswer((prev) => prev.slice(0, -1));
  };

  const checkLiveAnswer = async (inputStr: string) => {
    const val = parseInt(inputStr, 10);
    if (val === correctAnswer) {
      await triggerSuccess();
      setScore((prev) => prev + 1);
      nextQuestion();
    } else if (inputStr.length >= correctAnswer.toString().length) {
      await triggerError();
      Vibration.vibrate(50);
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setUserAnswer('');
      }, 400);
    }
  };

  return {
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
  };
};
