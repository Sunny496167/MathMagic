import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { learnService } from '../services/learnService';
import { TopicItem, ExerciseItem } from '../types/learn.types';
import { useHapticFeedback } from '../../../hooks/useHapticFeedback';

export const useLearnCurriculum = () => {
  const { user } = useAuth();
  const { triggerLight } = useHapticFeedback();

  const [loadingTopics, setLoadingTopics] = useState(false);
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [activeTopic, setActiveTopic] = useState<TopicItem | null>(null);

  const [loadingExercises, setLoadingExercises] = useState(false);
  const [exercises, setExercises] = useState<ExerciseItem[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseItem | null>(null);

  const loadTopics = useCallback(async () => {
    if (!user) return;
    setLoadingTopics(true);
    try {
      const gradeId = user.selectedGrade?._id || user.selectedGrade || '';
      if (!gradeId) {
        setTopics([]);
        return;
      }
      const data = await learnService.fetchTopicsForGrade(gradeId);
      setTopics(data);
    } catch (err: any) {
      console.warn('Failed to load topics for grade:', err.message);
    } finally {
      setLoadingTopics(false);
    }
  }, [user]);

  useEffect(() => {
    loadTopics();
  }, [loadTopics]);

  const handleSelectTopic = async (topic: TopicItem) => {
    if (topic.status === 'locked') return;
    triggerLight();
    setActiveTopic(topic);
    setLoadingExercises(true);
    try {
      const exData = await learnService.fetchExercisesForTopic(topic._id);
      setExercises(exData);
    } catch (err: any) {
      console.warn('Failed to load exercises for topic:', err.message);
    } finally {
      setLoadingExercises(false);
    }
  };

  const handleBackToTopics = () => {
    triggerLight();
    setActiveTopic(null);
    setExercises([]);
    loadTopics();
  };

  const handleSelectExercise = (exercise: ExerciseItem) => {
    if (exercise.status === 'locked') return;
    triggerLight();
    setSelectedExercise(exercise);
  };

  const handleCloseExercise = async () => {
    setSelectedExercise(null);
    if (activeTopic) {
      // Reload exercises to update unlock states
      const exData = await learnService.fetchExercisesForTopic(activeTopic._id);
      setExercises(exData);
    }
    loadTopics();
  };

  return {
    loadingTopics,
    topics,
    activeTopic,
    loadingExercises,
    exercises,
    selectedExercise,
    loadTopics,
    handleSelectTopic,
    handleBackToTopics,
    handleSelectExercise,
    handleCloseExercise,
  };
};

export default useLearnCurriculum;
