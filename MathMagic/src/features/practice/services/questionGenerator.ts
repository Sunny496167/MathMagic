import { Grade1Question } from '../../../types';

export const generateGrade1Question = (
  topic: string = 'Addition',
  difficulty: 'Easy' | 'Medium' | 'Hard' = 'Easy'
): Grade1Question => {
  let num1 = 1;
  let num2 = 1;
  let operator = '+';
  let xp = 10;

  if (difficulty === 'Easy') {
    num1 = Math.floor(Math.random() * 10) + 1;
    num2 = Math.floor(Math.random() * 10) + 1;
    xp = 10;
  } else if (difficulty === 'Medium') {
    num1 = Math.floor(Math.random() * 20) + 5;
    num2 = Math.floor(Math.random() * 20) + 5;
    xp = 20;
  } else {
    num1 = Math.floor(Math.random() * 50) + 10;
    num2 = Math.floor(Math.random() * 50) + 10;
    xp = 30;
  }

  const topicLower = topic.toLowerCase();
  let text = '';
  let answer = '';

  if (topicLower.includes('subtraction')) {
    if (num1 < num2) {
      const temp = num1;
      num1 = num2;
      num2 = temp;
    }
    operator = '-';
    text = `What is ${num1} - ${num2}?`;
    answer = (num1 - num2).toString();
  } else if (topicLower.includes('multiplication')) {
    operator = '×';
    num1 = Math.min(num1, 12);
    num2 = Math.min(num2, 10);
    text = `What is ${num1} × ${num2}?`;
    answer = (num1 * num2).toString();
  } else if (topicLower.includes('division')) {
    num2 = Math.floor(Math.random() * 9) + 2;
    const quotient = Math.floor(Math.random() * 10) + 1;
    num1 = num2 * quotient;
    operator = '÷';
    text = `What is ${num1} ÷ ${num2}?`;
    answer = quotient.toString();
  } else {
    operator = '+';
    text = `What is ${num1} + ${num2}?`;
    answer = (num1 + num2).toString();
  }

  // Generate 3 unique distractors
  const optionsSet = new Set<string>();
  optionsSet.add(answer);

  while (optionsSet.size < 4) {
    const delta = Math.floor(Math.random() * 7) - 3;
    const distractor = Math.max(1, parseInt(answer, 10) + (delta === 0 ? 1 : delta)).toString();
    optionsSet.add(distractor);
  }

  const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

  return {
    id: `q-${Date.now()}-${Math.random()}`,
    text,
    options,
    correctAnswer: answer,
    explanation: `Step-by-step: ${num1} ${operator} ${num2} equals ${answer}.`,
    xp,
  };
};

export const generatePracticeProblem = (
  topic: string,
  difficulty: 'Easy' | 'Medium' | 'Hard'
) => {
  let a = 1;
  let b = 1;
  let max = difficulty === 'Easy' ? 10 : difficulty === 'Medium' ? 50 : 100;

  if (topic === 'Addition') {
    a = Math.floor(Math.random() * max) + 1;
    b = Math.floor(Math.random() * max) + 1;
    return { text: `${a} + ${b}`, answer: a + b };
  } else if (topic === 'Subtraction') {
    a = Math.floor(Math.random() * max) + 1;
    b = Math.floor(Math.random() * a) + 1;
    return { text: `${a} - ${b}`, answer: a - b };
  } else if (topic === 'Multiplication') {
    const mMax = difficulty === 'Easy' ? 5 : difficulty === 'Medium' ? 10 : 15;
    a = Math.floor(Math.random() * mMax) + 1;
    b = Math.floor(Math.random() * mMax) + 1;
    return { text: `${a} × ${b}`, answer: a * b };
  } else if (topic === 'Division') {
    const dMax = difficulty === 'Easy' ? 5 : difficulty === 'Medium' ? 10 : 12;
    b = Math.floor(Math.random() * dMax) + 1;
    const ans = Math.floor(Math.random() * dMax) + 1;
    a = b * ans;
    return { text: `${a} ÷ ${b}`, answer: ans };
  } else {
    // Fractions (Fractions basics)
    a = Math.floor(Math.random() * 5) + 1;
    b = Math.floor(Math.random() * 5) + 1;
    return { text: `${a}/2 + ${b}/2`, answer: (a + b) / 2 };
  }
};
