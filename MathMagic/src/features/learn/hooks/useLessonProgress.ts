import { useState, useEffect } from 'react';
import { statsStorage } from '../../../services/statsStorage';
import { useHapticFeedback } from '../../../hooks/useHapticFeedback';
import { LESSONS } from '../constants/lessonsData';
import { Lesson, LessonCategoryFilter } from '../types/learn.types';
import { UserStats } from '../../../types';

export const useLessonProgress = () => {
  const [stats, setStats] = useState<UserStats>({
    xp: 0,
    streak: 0,
    highScore: 0,
    completedLessons: [],
    lastActiveDate: null,
  });

  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<LessonCategoryFilter>('All');
  const [quizInput, setQuizInput] = useState('');
  const [quizFeedback, setQuizFeedback] = useState<'correct' | 'incorrect' | null>(null);

  const { triggerLight, triggerSuccess, triggerError } = useHapticFeedback();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const s = await statsStorage.getStats();
    setStats(s);
  };

  const handleOpenLesson = (lesson: Lesson) => {
    triggerLight();
    setSelectedLesson(lesson);
    setQuizInput('');
    setQuizFeedback(null);
  };

  const handleCloseLesson = () => {
    setSelectedLesson(null);
    setQuizInput('');
    setQuizFeedback(null);
  };

  const handleCategorySelect = (cat: LessonCategoryFilter) => {
    triggerLight();
    setSelectedCategory(cat);
  };

  const handleQuizSubmit = async () => {
    if (!selectedLesson || !quizInput.trim()) return;

    if (quizInput.trim().toLowerCase() === selectedLesson.quizAnswer.trim().toLowerCase()) {
      await triggerSuccess();
      setQuizFeedback('correct');
      const updated = await statsStorage.markLessonComplete(selectedLesson.id);
      setStats(updated);
    } else {
      await triggerError();
      setQuizFeedback('incorrect');
    }
  };

  const filteredLessons =
    selectedCategory === 'All'
      ? LESSONS
      : LESSONS.filter((l) => l.category === selectedCategory);

  return {
    stats,
    selectedLesson,
    selectedCategory,
    quizInput,
    setQuizInput,
    quizFeedback,
    filteredLessons,
    handleOpenLesson,
    handleCloseLesson,
    handleCategorySelect,
    handleQuizSubmit,
    loadStats,
  };
};
