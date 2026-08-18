export interface Lesson {
  id: string;
  title: string;
  category: string;
  formula: string;
  description: string;
  exampleProblem: string;
  exampleStep: string;
  quizQuestion: string;
  quizAnswer: string;
}

export type LessonCategoryFilter = 'All' | 'Basics' | 'Algebra' | 'Fractions' | 'Geometry';
