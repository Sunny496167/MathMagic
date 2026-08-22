import { useState, useEffect, useRef } from 'react';
import { learnService } from '../services/learnService';
import {
  ExerciseItem,
  LearnQuestion,
  AnswerSubmissionResult,
  ExerciseCompletionResult,
} from '../types/learn.types';
import { useHapticFeedback } from '../../../hooks/useHapticFeedback';

export const useExercisePlayer = (
  exercise: ExerciseItem | null,
  onFinished?: () => void
) => {
  const { triggerSuccess, triggerError } = useHapticFeedback();

  const [loadingDetail, setLoadingDetail] = useState(false);
  const [exerciseData, setExerciseData] = useState<ExerciseItem | null>(null);
  const [questions, setQuestions] = useState<LearnQuestion[]>([]);
  const [mode, setMode] = useState<'content' | 'player' | 'completed'>('content');

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [completionResult, setCompletionResult] = useState<ExerciseCompletionResult | null>(null);
  const [submittingCompletion, setSubmittingCompletion] = useState(false);

  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (exercise) {
      loadExercise();
    } else {
      resetState();
    }
  }, [exercise]);

  const resetState = () => {
    setExerciseData(null);
    setQuestions([]);
    setMode('content');
    setCurrentQuestionIndex(0);
    setScore(0);
    setCompletionResult(null);
  };

  const loadExercise = async () => {
    if (!exercise) return;
    setLoadingDetail(true);
    try {
      const data = await learnService.fetchExerciseDetail(exercise._id);
      setExerciseData(data.exercise || exercise);
      setQuestions(data.questions || []);
      setMode('content');
      setCurrentQuestionIndex(0);
      setScore(0);
      setCompletionResult(null);
    } catch (err: any) {
      console.warn('Failed to load exercise details:', err.message);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleStartQuestions = () => {
    if (questions.length === 0) return;
    setMode('player');
    setCurrentQuestionIndex(0);
    setScore(0);
    startTimeRef.current = Date.now();
  };

  const handleAnswerSubmit = async (
    userAnswer: any
  ): Promise<AnswerSubmissionResult | null> => {
    if (!exercise || questions.length === 0) return null;
    const currentQ = questions[currentQuestionIndex];
    if (!currentQ) return null;

    const timeSpent = Math.max(Date.now() - startTimeRef.current, 500);

    try {
      const result = await learnService.submitLearnAnswer(
        exercise._id,
        currentQ._id,
        userAnswer,
        timeSpent
      );

      if (result.isCorrect) {
        await triggerSuccess();
        setScore((prev) => prev + 1);
      } else {
        await triggerError();
      }

      return result;
    } catch (err: any) {
      console.warn('Failed to submit answer:', err.message);
      return null;
    }
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      startTimeRef.current = Date.now();
    } else {
      // Finished all questions -> complete exercise!
      await handleCompleteExercise();
    }
  };

  const handleCompleteExercise = async () => {
    if (!exercise) return;
    setSubmittingCompletion(true);
    const localScorePercent = questions.length > 0 ? Math.round((score / questions.length) * 100) : 100;
    const reqScore = exercise.completionRequirement?.minScore || 80;

    try {
      const res = await learnService.completeLearnExercise(exercise._id);
      const computedScore = typeof res.score === 'number' && !isNaN(res.score) ? res.score : localScorePercent;
      const isPassed = res.passed !== undefined ? res.passed : computedScore >= reqScore;

      setCompletionResult({
        success: res.success !== undefined ? res.success : true,
        score: computedScore,
        requiredScore: res.requiredScore || reqScore,
        passed: isPassed,
        reason: res.reason,
      });
      setMode('completed');
    } catch (err: any) {
      console.warn('Failed to complete exercise:', err.message);
      setCompletionResult({
        success: false,
        score: localScorePercent,
        requiredScore: reqScore,
        passed: localScorePercent >= reqScore,
        reason: err.message,
      });
      setMode('completed');
    } finally {
      setSubmittingCompletion(false);
    }
  };

  const handleRetry = () => {
    setMode('player');
    setCurrentQuestionIndex(0);
    setScore(0);
    setCompletionResult(null);
    startTimeRef.current = Date.now();
  };

  const handleBackToContent = () => {
    setMode('content');
    setCurrentQuestionIndex(0);
    setScore(0);
    setCompletionResult(null);
  };

  return {
    loadingDetail,
    exerciseData,
    questions,
    mode,
    currentQuestionIndex,
    currentQuestion: questions[currentQuestionIndex] || null,
    isLastQuestion: currentQuestionIndex === questions.length - 1,
    score,
    completionResult,
    submittingCompletion,
    handleStartQuestions,
    handleAnswerSubmit,
    handleNextQuestion,
    handleRetry,
    handleBackToContent,
  };
};

export default useExercisePlayer;
