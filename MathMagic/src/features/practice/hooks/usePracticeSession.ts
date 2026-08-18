import { useState, useEffect } from 'react';
import { statsStorage } from '../../../services/statsStorage';
import { useHapticFeedback } from '../../../hooks/useHapticFeedback';
import { generatePracticeProblem } from '../services/questionGenerator';
import { MathCategory, MathDifficulty, UserStats } from '../../../types';
import { PracticeQuestion } from '../types/practice.types';

export const usePracticeSession = () => {
  const [stats, setStats] = useState<UserStats>({
    xp: 0,
    streak: 0,
    highScore: 0,
    completedLessons: [],
    lastActiveDate: null,
  });

  const [activeTopic, setActiveTopic] = useState<MathCategory | null>(null);
  const [difficulty, setDifficulty] = useState<MathDifficulty>('Easy');
  const [question, setQuestion] = useState<PracticeQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [solvedCount, setSolvedCount] = useState(0);

  const { triggerLight, triggerSuccess, triggerError } = useHapticFeedback();

  useEffect(() => {
    loadUserStats();
  }, []);

  useEffect(() => {
    if (activeTopic) {
      newQuestion();
    }
  }, [activeTopic, difficulty]);

  const loadUserStats = async () => {
    const data = await statsStorage.getStats();
    setStats(data);
  };

  const newQuestion = () => {
    setUserAnswer('');
    setFeedback(null);
    if (!activeTopic) return;
    const prob = generatePracticeProblem(activeTopic, difficulty);
    setQuestion(prob);
  };

  const handleTopicSelect = (topic: MathCategory) => {
    triggerLight();
    setActiveTopic(topic);
  };

  const handleDifficultyChange = (diff: MathDifficulty) => {
    triggerLight();
    setDifficulty(diff);
  };

  const handleBackToTopics = () => {
    triggerLight();
    setActiveTopic(null);
    setQuestion(null);
    setFeedback(null);
  };

  const handleSubmitAnswer = async () => {
    if (!question || userAnswer === '') return;

    const numericInput = parseFloat(userAnswer.trim());
    if (numericInput === question.answer) {
      await triggerSuccess();
      setFeedback('correct');
      setSolvedCount((prev) => prev + 1);

      const xpEarned = difficulty === 'Easy' ? 5 : difficulty === 'Medium' ? 10 : 15;
      const updated = await statsStorage.addXp(xpEarned);
      await statsStorage.updateStreak();
      setStats(updated);

      setTimeout(() => {
        newQuestion();
      }, 1000);
    } else {
      await triggerError();
      setFeedback('incorrect');
    }
  };

  return {
    stats,
    activeTopic,
    difficulty,
    question,
    userAnswer,
    setUserAnswer,
    feedback,
    solvedCount,
    handleTopicSelect,
    handleDifficultyChange,
    handleBackToTopics,
    handleSubmitAnswer,
    newQuestion,
    loadUserStats,
  };
};
