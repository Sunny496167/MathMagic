export interface DailyMission {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  target: number;
  current: number;
  isCompleted: boolean;
  targetTab: 'learn' | 'practice' | 'game' | 'profile';
}

export interface ContinueLessonData {
  exerciseId: string;
  exerciseTitle: string;
  subtopicNumber: number;
  topicId: string;
  topicTitle: string;
  color: string;
  icon: string;
  isCompleted: boolean;
}

export interface WeeklyActivityDay {
  day: string;
  date: string;
  isToday: boolean;
  isActive: boolean;
  questionsCount: number;
}

export interface DailyMathFact {
  title: string;
  fact: string;
  icon: string;
  color: string;
}

export interface HomeDashboardData {
  user: {
    _id: string;
    name: string;
    email: string;
    xp: number;
    streak: number;
  };
  grade: {
    _id: string;
    name: string;
    number: number;
    icon: string;
    color: string;
  } | null;
  continueLesson: ContinueLessonData | null;
  dailyMissions: {
    missions: DailyMission[];
    allCompleted: boolean;
    rewardClaimed: boolean;
    bonusXp: number;
  };
  weeklyActivity: WeeklyActivityDay[];
  dailyMathFact: DailyMathFact;
  curriculumProgress: {
    completedTopics: number;
    totalTopics: number;
    overallAccuracy: number;
    totalQuestionsAnswered: number;
  };
}
