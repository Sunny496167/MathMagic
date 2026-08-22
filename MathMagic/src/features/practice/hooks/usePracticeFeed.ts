import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { practiceService } from '../services/practiceService';
import {
  PracticeExerciseItem,
  PracticeFeedStats,
  PracticeLevelItem,
} from '../types/practice.types';
import { useHapticFeedback } from '../../../hooks/useHapticFeedback';

export const usePracticeFeed = () => {
  const { user } = useAuth();
  const { triggerLight } = useHapticFeedback();

  const [loading, setLoading] = useState(false);
  const [gradeTitle, setGradeTitle] = useState<string>('Grade 1');
  const [exerciseGroups, setExerciseGroups] = useState<PracticeExerciseItem[]>([]);
  const [stats, setStats] = useState<PracticeFeedStats>({
    accuracy: 0,
    solvedCount: 0,
    streak: 0,
    totalXp: 0,
  });

  const [selectedLevel, setSelectedLevel] = useState<{
    level: PracticeLevelItem;
    exerciseTitle: string;
  } | null>(null);

  const loadFeedData = useCallback(async () => {
    setLoading(true);
    try {
      const treeData = await practiceService.fetchProgressTree();
      if (treeData) {
        if (treeData.grade?.name) {
          setGradeTitle(treeData.grade.name);
        }

        const groups: PracticeExerciseItem[] = [];
        const rawTopics = treeData.topics || [];

        rawTopics.forEach((topic: any) => {
          const rawExercises = topic.exercises || [];
          rawExercises.forEach((ex: any) => {
            // Check if exercise has practice levels or is completed in Learn
            const isLearnDone = ex.status === 'completed';
            const levels = ex.practiceLevels || [];

            if (isLearnDone || levels.length > 0) {
              groups.push({
                _id: ex._id,
                topicId: topic._id,
                topicTitle: topic.title,
                topicColor: topic.color || '#8B5CF6',
                exerciseTitle: ex.title,
                exerciseDescription: ex.description,
                isLearnCompleted: isLearnDone,
                levels: levels.map((lvl: any) => ({
                  _id: lvl._id,
                  exercise: ex._id,
                  number: lvl.number,
                  title: lvl.title || `Level ${lvl.number}`,
                  difficulty: lvl.difficulty || 'easy',
                  questionCount: lvl.questionCount || 30,
                  passingScore: lvl.passingScore || 70,
                  status: lvl.status || 'locked',
                  bestScore: lvl.bestScore || 0,
                  mastery: lvl.mastery || 0,
                })),
              });
            }
          });
        });

        setExerciseGroups(groups);

        // Aggregate stats
        const rawStats = treeData.stats || {};
        setStats({
          accuracy: rawStats.overallAccuracy || 0,
          solvedCount: rawStats.totalQuestionsAnswered || 0,
          streak: rawStats.currentStreak || 0,
          totalXp: rawStats.totalXp || 0,
        });
      }
    } catch (err: any) {
      console.warn('Failed to load practice feed:', err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadFeedData();
  }, [loadFeedData]);

  const handleOpenLevel = (level: PracticeLevelItem, exerciseTitle: string) => {
    if (level.status === 'locked') return;
    triggerLight();
    setSelectedLevel({ level, exerciseTitle });
  };

  const handleCloseLevel = () => {
    setSelectedLevel(null);
    loadFeedData();
  };

  return {
    loading,
    gradeTitle,
    exerciseGroups,
    stats,
    selectedLevel,
    loadFeedData,
    handleOpenLevel,
    handleCloseLevel,
  };
};

export default usePracticeFeed;
