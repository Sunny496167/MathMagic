import { useState, useEffect, useRef } from 'react';
import { practiceService } from '../services/practiceService';
import {
  PracticeLevelItem,
  DrillQuestionAnswer,
  DrillResultData,
} from '../types/practice.types';
import { LearnQuestion } from '../../learn/types/learn.types';
import { useHapticFeedback } from '../../../hooks/useHapticFeedback';

export const useDrillSession = (
  level: PracticeLevelItem | null,
  onFinished?: () => void
) => {
  const { triggerSuccess, triggerError } = useHapticFeedback();

  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [levelData, setLevelData] = useState<PracticeLevelItem | null>(null);
  const [questions, setQuestions] = useState<LearnQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);

  const [answers, setAnswers] = useState<DrillQuestionAnswer[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<DrillResultData | null>(null);

  const timerRef = useRef<any>(null);
  const questionStartTimeRef = useRef<number>(Date.now());
  const sessionStartTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (level) {
      loadDrill();
    } else {
      resetSession();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [level]);

  const resetSession = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setLevelData(null);
    setQuestions([]);
    setCurrentIdx(0);
    setAnswers([]);
    setElapsedSeconds(0);
    setResult(null);
    setSubmitting(false);
  };

  const loadDrill = async () => {
    if (!level) return;
    setLoadingQuestions(true);
    resetSession();

    try {
      const data = await practiceService.fetchPracticeLevelQuestions(level._id);
      setLevelData(data.practiceLevel || level);
      setQuestions(data.questions || []);
      setCurrentIdx(0);
      setAnswers([]);
      setElapsedSeconds(0);
      setResult(null);

      // Start timers
      sessionStartTimeRef.current = Date.now();
      questionStartTimeRef.current = Date.now();

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.warn('Failed to load drill questions:', err.message);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleRecordAnswerAndNext = async (userAnswer: any) => {
    if (questions.length === 0) return;
    const currentQ = questions[currentIdx];
    if (!currentQ) return;

    const timeSpent = Math.max(Date.now() - questionStartTimeRef.current, 400);

    const newAnswer: DrillQuestionAnswer = {
      questionId: currentQ._id,
      userAnswer,
      timeSpentMs: timeSpent,
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
      questionStartTimeRef.current = Date.now();
    } else {
      // Completed all questions in the drill!
      await finishAndSubmitDrill(updatedAnswers);
    }
  };

  const finishAndSubmitDrill = async (finalAnswers: DrillQuestionAnswer[]) => {
    if (!level) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setSubmitting(true);

    const totalTimeMs = Date.now() - sessionStartTimeRef.current;

    try {
      const res = await practiceService.submitPracticeDrill(level._id, {
        answers: finalAnswers,
        totalTimeMs,
      });

      if (res.passed) {
        await triggerSuccess();
      } else {
        await triggerError();
      }

      setResult(res);
    } catch (err: any) {
      console.warn('Failed to submit drill session:', err.message);
      // Fallback calculation
      const correctEstimate = finalAnswers.length;
      const score = Math.round((correctEstimate / Math.max(questions.length, 1)) * 100);
      setResult({
        score,
        totalCorrect: correctEstimate,
        totalQuestions: questions.length,
        accuracy: score,
        totalTimeMs,
        xpEarned: score * 2,
        passed: score >= (level.passingScore || 70),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    loadDrill();
  };

  return {
    loadingQuestions,
    levelData,
    questions,
    currentIdx,
    currentQuestion: questions[currentIdx] || null,
    totalQuestions: questions.length,
    elapsedSeconds,
    submitting,
    result,
    handleRecordAnswerAndNext,
    handleRetry,
  };
};

export default useDrillSession;
