import { Grade1Question } from "./statsStorage";

export const generateQuestion = (
  topic: string = "Addition",
  difficulty: "Easy" | "Medium" | "Hard" = "Easy"
): Grade1Question => {
  let num1 = 1;
  let num2 = 1;
  let operator = "+";
  let xp = 10;

  if (difficulty === "Easy") {
    num1 = Math.floor(Math.random() * 10) + 1;
    num2 = Math.floor(Math.random() * 10) + 1;
    xp = 10;
  } else if (difficulty === "Medium") {
    num1 = Math.floor(Math.random() * 20) + 5;
    num2 = Math.floor(Math.random() * 20) + 5;
    xp = 20;
  } else {
    num1 = Math.floor(Math.random() * 50) + 10;
    num2 = Math.floor(Math.random() * 50) + 10;
    xp = 30;
  }

  const topicLower = topic.toLowerCase();
  let text = "";
  let answer = "";

  if (topicLower.includes("subtraction")) {
    operator = "-";
    if (num1 < num2) {
      const temp = num1;
      num1 = num2;
      num2 = temp;
    }
    answer = String(num1 - num2);
    text = `What is ${num1} - ${num2}?`;
  } else if (topicLower.includes("shapes")) {
    const shapes = [
      { text: "How many sides does a triangle have?", ans: "3", opts: ["3", "4", "5", "6"] },
      { text: "How many sides does a square have?", ans: "4", opts: ["3", "4", "5", "6"] },
      { text: "Which shape has no corners?", ans: "Circle", opts: ["Square", "Circle", "Triangle", "Rectangle"] },
    ];
    const picked = shapes[Math.floor(Math.random() * shapes.length)];
    return {
      id: `gen-${Date.now()}-${Math.random()}`,
      grade: 1,
      level: 1,
      topic: "Shapes",
      subtopic: "Geometry",
      skill: "shape_recognition",
      difficulty,
      questionType: "multiple-choice",
      questionText: picked.text,
      options: picked.opts,
      correctAnswer: picked.ans,
      explanation: `The correct answer is ${picked.ans}.`,
      hint: "Count the sides or corners carefully!",
      xpValue: xp,
      estimatedTimeSec: 15,
    };
  } else if (topicLower.includes("money")) {
    const moneyQs = [
      { text: "How many cents is 1 nickel worth?", ans: "5", opts: ["1", "5", "10", "25"] },
      { text: "How many cents is 1 dime worth?", ans: "10", opts: ["1", "5", "10", "25"] },
      { text: "How many cents is 1 quarter worth?", ans: "25", opts: ["5", "10", "25", "50"] },
    ];
    const picked = moneyQs[Math.floor(Math.random() * moneyQs.length)];
    return {
      id: `gen-${Date.now()}-${Math.random()}`,
      grade: 1,
      level: 1,
      topic: "Money",
      subtopic: "Coins",
      skill: "money_math",
      difficulty,
      questionType: "multiple-choice",
      questionText: picked.text,
      options: picked.opts,
      correctAnswer: picked.ans,
      explanation: `The correct answer is ${picked.ans}.`,
      hint: "Think about coin values!",
      xpValue: xp,
      estimatedTimeSec: 15,
    };
  } else {
    // Default Addition or Numbers
    operator = "+";
    answer = String(num1 + num2);
    text = `What is ${num1} + ${num2}?`;
  }

  const correctVal = parseInt(answer);
  const optionsSet = new Set<string>();
  optionsSet.add(answer);
  while (optionsSet.size < 4) {
    const wrong = Math.max(0, correctVal + (Math.floor(Math.random() * 9) - 4));
    optionsSet.add(String(wrong));
  }
  const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

  return {
    id: `gen-${Date.now()}-${Math.random()}`,
    grade: 1,
    level: 1,
    topic,
    subtopic: topic,
    skill: topicLower,
    difficulty,
    questionType: "multiple-choice",
    questionText: text,
    options,
    correctAnswer: answer,
    explanation: `${num1} ${operator} ${num2} = ${answer}`,
    hint: "Use your fingers or count up!",
    xpValue: xp,
    estimatedTimeSec: 15,
  };
};
