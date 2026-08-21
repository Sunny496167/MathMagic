require('dotenv').config();
const mongoose = require('mongoose');
const Grade = require('../modules/curriculum/models/grade.model');
const Topic = require('../modules/curriculum/models/topic.model');
const Exercise = require('../modules/curriculum/models/exercise.model');
const PracticeLevel = require('../modules/curriculum/models/practiceLevel.model');
const Question = require('../modules/question/question.model');
const User = require('../modules/user/user.model');
const config = require('../config/environment');

async function seedBatch1() {
  try {
    console.log('[Batch 1 Seeder] Connecting to MongoDB...');
    await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 8000 });
    console.log('[Batch 1 Seeder] Connected to database.');

    const admin = await User.findOne({ role: 'admin' });
    const adminId = admin ? admin._id : null;

    // 1. Find or create Grade 1
    let grade1 = await Grade.findOne({ number: 1 });
    if (!grade1) {
      grade1 = await Grade.create({
        number: 1,
        name: 'Grade 1',
        description: 'Foundational Mathematics for Early Learners',
        icon: 'shapes-outline',
        color: '#8B5CF6',
        order: 1,
        isEnabled: true,
        createdBy: adminId,
      });
    }

    console.log('[Batch 1 Seeder] Target Grade 1 ID:', grade1._id);

    // Clean old topics for Grade 1 in range order 1 to 5 to overwrite with rich content
    const existingTopics = await Topic.find({ grade: grade1._id, order: { $lte: 5 } });
    for (const t of existingTopics) {
      const exs = await Exercise.find({ topic: t._id });
      for (const ex of exs) {
        await PracticeLevel.deleteMany({ exercise: ex._id });
        await Question.deleteMany({ exercise: ex._id });
      }
      await Exercise.deleteMany({ topic: t._id });
      await Question.deleteMany({ topic: t._id });
    }
    await Topic.deleteMany({ grade: grade1._id, order: { $lte: 5 } });

    console.log('[Batch 1 Seeder] Cleaned existing Topics 1 to 5 for fresh ingestion.');

    // Helper to seed practice questions
    const seedPracticeQuestions = async (pLevel, ex, topic, count = 30, generator) => {
      const qDocs = [];
      for (let i = 1; i <= count; i++) {
        const item = generator(i);
        qDocs.push({
          context: 'practice',
          practiceLevel: pLevel._id,
          exercise: ex._id,
          topic: topic._id,
          grade: grade1._id,
          type: item.type || 'mcq',
          text: item.text,
          options: item.options || [],
          correctAnswer: item.correctAnswer,
          acceptableAnswers: item.acceptableAnswers || [],
          explanation: item.explanation || '',
          difficulty: item.difficulty || 'easy',
          xpReward: 5,
          order: i,
          createdBy: adminId,
        });
      }
      await Question.insertMany(qDocs);
    };

    // =========================================================================
    // TOPIC 1: PRE-NUMBER CONCEPT
    // =========================================================================
    console.log('[Batch 1 Seeder] Ingesting Topic 1: Pre-number Concept...');
    const t1 = await Topic.create({
      grade: grade1._id,
      title: 'Pre-number Concept',
      description: 'Understanding size, length, spatial position, and quantities before counting',
      icon: 'cube-outline',
      color: '#10B981',
      order: 1,
      isPublished: true,
      introduction: {
        summary: 'Before we start counting with numbers, we compare objects around us! We look at which object is bigger, smaller, taller, shorter, inside or outside.',
        keyTakeaways: [
          'Big and Small describe the size of objects.',
          'Top and Bottom describe where something is located.',
          'Inside and Outside describe boundaries.',
          'Heavy and Light tell us about weight.',
        ],
        blocks: [
          {
            type: 'example',
            content: 'Elephant is BIG 🐘 vs Mouse is SMALL 🐁\nGiraffe is TALL 🦒 vs Turtle is SHORT 🐢',
            order: 1,
          },
        ],
      },
      createdBy: adminId,
    });

    // Topic 1 - Subtopic 1: Size & Position
    const t1s1 = await Exercise.create({
      topic: t1._id,
      grade: grade1._id,
      subtopicNumber: 1,
      title: 'Size & Position (Big/Small, Top/Bottom, Inside/Outside)',
      description: 'Compare dimensions and relative locations of everyday objects',
      icon: 'resize-outline',
      color: '#10B981',
      order: 1,
      isPublished: true,
      learningContent: {
        summary: 'Look at objects carefully to compare their sizes and where they are placed.',
        blocks: [
          { type: 'heading', content: 'Big and Small', order: 1 },
          { type: 'text', content: 'A football is BIG compared to a small marble.', order: 2 },
          { type: 'example', content: 'Big: Watermelon 🍉\nSmall: Strawberry 🍓', order: 3 },
          { type: 'heading', content: 'Top and Bottom', order: 4 },
          { type: 'text', content: 'The bird sits at the TOP of the tree. The cat sits at the BOTTOM.', order: 5 },
          { type: 'tip', content: 'Look at two objects side-by-side to easily compare their size!', order: 6 },
        ],
      },
      completionRequirement: { minScore: 80, mustAnswerAll: true },
      createdBy: adminId,
    });

    await Question.insertMany([
      {
        context: 'learn',
        exercise: t1s1._id,
        topic: t1._id,
        grade: grade1._id,
        type: 'mcq',
        text: 'Which animal is BIGGER? Elephant or Ant?',
        options: ['Elephant', 'Ant', 'Both are equal', 'None'],
        correctAnswer: 'Elephant',
        explanation: 'An elephant is much bigger than a tiny ant.',
        difficulty: 'easy',
        xpReward: 10,
        order: 1,
      },
      {
        context: 'learn',
        exercise: t1s1._id,
        topic: t1._id,
        grade: grade1._id,
        type: 'true_false',
        text: 'A bus is smaller than a bicycle.',
        correctAnswer: 'false',
        explanation: 'A bus is much bigger than a bicycle.',
        difficulty: 'easy',
        xpReward: 10,
        order: 2,
      },
      {
        context: 'learn',
        exercise: t1s1._id,
        topic: t1._id,
        grade: grade1._id,
        type: 'mcq',
        text: 'If books are on the shelf, the roof is at the ____ of the house.',
        options: ['Top', 'Bottom', 'Inside', 'Behind'],
        correctAnswer: 'Top',
        explanation: 'The roof is at the very top of a building.',
        difficulty: 'easy',
        xpReward: 10,
        order: 3,
      },
      {
        context: 'learn',
        exercise: t1s1._id,
        topic: t1._id,
        grade: grade1._id,
        type: 'fill_blank',
        text: 'Fish live ____ the water (inside or outside).',
        correctAnswer: 'inside',
        acceptableAnswers: ['inside', 'Inside'],
        explanation: 'Fish swim inside the water.',
        difficulty: 'easy',
        xpReward: 10,
        order: 4,
      },
    ]);

    const t1s1p1 = await PracticeLevel.create({
      exercise: t1s1._id,
      topic: t1._id,
      grade: grade1._id,
      number: 1,
      title: 'Level 1: Size Identification Drills',
      description: '30 questions on comparing big vs small and long vs short',
      difficulty: 'easy',
      order: 1,
      questionCount: 30,
      passingScore: 70,
      isPublished: true,
      createdBy: adminId,
    });

    await seedPracticeQuestions(t1s1p1, t1s1, t1, 30, (i) => {
      const pairs = [
        { big: 'Truck', small: 'Car' },
        { big: 'Tree', small: 'Flower' },
        { big: 'Ship', small: 'Boat' },
        { big: 'Whale', small: 'Goldfish' },
        { big: 'Mountain', small: 'Rock' },
      ];
      const p = pairs[i % pairs.length];
      const askBig = i % 2 === 0;
      return {
        type: 'mcq',
        text: askBig ? `Which one is BIGGER: ${p.big} or ${p.small}?` : `Which one is SMALLER: ${p.big} or ${p.small}?`,
        options: [p.big, p.small, 'Both same', 'Neither'].sort(() => 0.5 - Math.random()),
        correctAnswer: askBig ? p.big : p.small,
        explanation: `${p.big} is bigger, and ${p.small} is smaller.`,
      };
    });

    const t1s1p2 = await PracticeLevel.create({
      exercise: t1s1._id,
      topic: t1._id,
      grade: grade1._id,
      number: 2,
      title: 'Level 2: Spatial Position Drills',
      description: '30 questions on top, bottom, inside, and outside',
      difficulty: 'medium',
      order: 2,
      questionCount: 30,
      passingScore: 75,
      isPublished: true,
      createdBy: adminId,
    });

    await seedPracticeQuestions(t1s1p2, t1s1, t1, 30, (i) => {
      const pos = i % 2 === 0 ? 'top' : 'bottom';
      return {
        type: 'true_false',
        text: pos === 'top' ? 'The sun and clouds are at the TOP of the sky.' : 'The roots of a plant are at the TOP of the ground.',
        correctAnswer: pos === 'top' ? 'true' : 'false',
        explanation: pos === 'top' ? 'The sky and clouds are at the top.' : 'Roots grow at the bottom underground.',
      };
    });

    // Topic 1 - Subtopic 2: Quantity Comparison
    const t1s2 = await Exercise.create({
      topic: t1._id,
      grade: grade1._id,
      subtopicNumber: 2,
      title: 'Quantity & Weight (More/Less, Heavy/Light)',
      description: 'Learn to compare collections and weight without counting',
      icon: 'scale-outline',
      color: '#3B82F6',
      order: 2,
      isPublished: true,
      learningContent: {
        summary: 'More means a greater amount. Heavy means harder to lift.',
        blocks: [
          { type: 'heading', content: 'More and Less', order: 1 },
          { type: 'text', content: 'A full basket has MORE apples than an almost empty basket.', order: 2 },
          { type: 'heading', content: 'Heavy and Light', order: 3 },
          { type: 'example', content: 'Heavy: A stone or brick 🧱\nLight: A feather or balloon 🎈', order: 4 },
        ],
      },
      completionRequirement: { minScore: 80, mustAnswerAll: true },
      createdBy: adminId,
    });

    const t1s2p1 = await PracticeLevel.create({
      exercise: t1s2._id,
      topic: t1._id,
      grade: grade1._id,
      number: 1,
      title: 'Level 1: Quantity Comparison Drills',
      description: '30 questions on more vs less and heavy vs light',
      difficulty: 'easy',
      order: 1,
      questionCount: 30,
      passingScore: 70,
      isPublished: true,
      createdBy: adminId,
    });

    await seedPracticeQuestions(t1s2p1, t1s2, t1, 30, (i) => {
      const askHeavy = i % 2 === 0;
      return {
        type: 'mcq',
        text: askHeavy ? 'Which item is HEAVIER: A rock or a leaf?' : 'Which item is LIGHTER: A feather or an anvil?',
        options: askHeavy ? ['Rock', 'Leaf', 'Same', 'None'] : ['Feather', 'Anvil', 'Same', 'None'],
        correctAnswer: askHeavy ? 'Rock' : 'Feather',
        explanation: askHeavy ? 'A rock is heavier than a light leaf.' : 'A feather is very light.',
      };
    });

    // =========================================================================
    // TOPIC 2: SHAPES (2D & 3D BASICS)
    // =========================================================================
    console.log('[Batch 1 Seeder] Ingesting Topic 2: Shapes...');
    const t2 = await Topic.create({
      grade: grade1._id,
      title: 'Shapes',
      description: 'Discover 2D shapes (Circle, Square, Triangle, Rectangle) and 3D shapes (Cube, Sphere, Cylinder)',
      icon: 'shapes-outline',
      color: '#8B5CF6',
      order: 2,
      isPublished: true,
      introduction: {
        summary: 'Shapes are everywhere! Clocks are circles, windows are squares or rectangles, and slices of pizza look like triangles.',
        keyTakeaways: [
          'A Circle has 0 straight sides (it is round).',
          'A Triangle has 3 sides and 3 corners.',
          'A Square has 4 equal sides.',
          'A Rectangle has 4 sides (opposite sides are equal).',
          'Round shapes roll; flat shapes slide.',
        ],
        blocks: [
          {
            type: 'example',
            content: '🔴 Circle (Coin, Wheel)\n🔺 Triangle (Pizza Slice)\n🟦 Square (Dice Face)\n📄 Rectangle (Door, Book)',
            order: 1,
          },
        ],
      },
      createdBy: adminId,
    });

    // Topic 2 - Subtopic 1: 2D Shapes
    const t2s1 = await Exercise.create({
      topic: t2._id,
      grade: grade1._id,
      subtopicNumber: 1,
      title: '2D Shapes (Circle, Triangle, Square, Rectangle)',
      description: 'Learn names, sides, and corners of flat 2D shapes',
      icon: 'square-outline',
      color: '#8B5CF6',
      order: 1,
      isPublished: true,
      learningContent: {
        summary: '2D shapes are flat figures with straight or curved boundaries.',
        blocks: [
          { type: 'heading', content: 'Triangle', order: 1 },
          { type: 'text', content: 'A triangle has 3 straight sides and 3 sharp corners (vertices).', order: 2 },
          { type: 'heading', content: 'Square vs Rectangle', order: 3 },
          { type: 'text', content: 'A square has 4 equal sides. A rectangle has 2 long sides and 2 short sides.', order: 4 },
          { type: 'heading', content: 'Circle', order: 5 },
          { type: 'text', content: 'A circle is completely round with no corners.', order: 6 },
          { type: 'tip', content: 'Count the corners to identify the shape easily!', order: 7 },
        ],
      },
      completionRequirement: { minScore: 80, mustAnswerAll: true },
      createdBy: adminId,
    });

    await Question.insertMany([
      {
        context: 'learn',
        exercise: t2s1._id,
        topic: t2._id,
        grade: grade1._id,
        type: 'mcq',
        text: 'How many sides does a triangle have?',
        options: ['2', '3', '4', '5'],
        correctAnswer: '3',
        explanation: 'A triangle always has exactly 3 sides.',
        difficulty: 'easy',
        xpReward: 10,
        order: 1,
      },
      {
        context: 'learn',
        exercise: t2s1._id,
        topic: t2._id,
        grade: grade1._id,
        type: 'mcq',
        text: 'Which shape has NO straight sides and NO corners?',
        options: ['Circle', 'Square', 'Triangle', 'Rectangle'],
        correctAnswer: 'Circle',
        explanation: 'A circle is smooth and round with zero straight sides.',
        difficulty: 'easy',
        xpReward: 10,
        order: 2,
      },
      {
        context: 'learn',
        exercise: t2s1._id,
        topic: t2._id,
        grade: grade1._id,
        type: 'numeric',
        text: 'How many corners does a square have?',
        correctAnswer: 4,
        explanation: 'A square has 4 corners (vertices).',
        difficulty: 'easy',
        xpReward: 10,
        order: 3,
      },
      {
        context: 'learn',
        exercise: t2s1._id,
        topic: t2._id,
        grade: grade1._id,
        type: 'true_false',
        text: 'All 4 sides of a square are equal in length.',
        correctAnswer: 'true',
        explanation: 'In a square, all four sides are exactly equal.',
        difficulty: 'easy',
        xpReward: 10,
        order: 4,
      },
    ]);

    const t2s1p1 = await PracticeLevel.create({
      exercise: t2s1._id,
      topic: t2._id,
      grade: grade1._id,
      number: 1,
      title: 'Level 1: 2D Shapes & Sides Recognition',
      description: '30 questions identifying sides, corners, and names of shapes',
      difficulty: 'easy',
      order: 1,
      questionCount: 30,
      passingScore: 70,
      isPublished: true,
      createdBy: adminId,
    });

    await seedPracticeQuestions(t2s1p1, t2s1, t2, 30, (i) => {
      const shapes = [
        { name: 'Triangle', sides: 3, corners: 3 },
        { name: 'Square', sides: 4, corners: 4 },
        { name: 'Rectangle', sides: 4, corners: 4 },
        { name: 'Circle', sides: 0, corners: 0 },
      ];
      const s = shapes[i % shapes.length];
      return {
        type: 'mcq',
        text: `How many corners does a ${s.name} have?`,
        options: [String(s.corners), String((s.corners + 1) % 5), String((s.corners + 2) % 5), String(s.corners + 3)].sort(() => 0.5 - Math.random()),
        correctAnswer: String(s.corners),
        explanation: `A ${s.name} has ${s.corners} corners.`,
      };
    });

    const t2s1p2 = await PracticeLevel.create({
      exercise: t2s1._id,
      topic: t2._id,
      grade: grade1._id,
      number: 2,
      title: 'Level 2: Real-World Shape Matching',
      description: '30 questions matching real objects to geometric shapes',
      difficulty: 'medium',
      order: 2,
      questionCount: 30,
      passingScore: 75,
      isPublished: true,
      createdBy: adminId,
    });

    await seedPracticeQuestions(t2s1p2, t2s1, t2, 30, (i) => {
      const matchItems = [
        { obj: 'A wall clock', shape: 'Circle' },
        { obj: 'A door', shape: 'Rectangle' },
        { obj: 'A slice of pizza', shape: 'Triangle' },
        { obj: 'A car tyre', shape: 'Circle' },
        { obj: 'A chessboard', shape: 'Square' },
      ];
      const m = matchItems[i % matchItems.length];
      return {
        type: 'mcq',
        text: `What shape is ${m.obj}?`,
        options: ['Circle', 'Square', 'Triangle', 'Rectangle'].sort(() => 0.5 - Math.random()),
        correctAnswer: m.shape,
        explanation: `${m.obj} has the shape of a ${m.shape}.`,
      };
    });

    // Topic 2 - Subtopic 2: 3D Shapes & Rolling vs Sliding
    const t2s2 = await Exercise.create({
      topic: t2._id,
      grade: grade1._id,
      subtopicNumber: 2,
      title: '3D Shapes (Cube, Sphere, Cylinder, Cone) & Rolling vs Sliding',
      description: 'Explore solid objects, balls, cans, boxes, and movement',
      icon: 'cube-outline',
      color: '#EC4899',
      order: 2,
      isPublished: true,
      learningContent: {
        summary: '3D shapes take up space. Round objects roll, and flat objects slide.',
        blocks: [
          { type: 'heading', content: 'Solid Shapes', order: 1 },
          { type: 'text', content: 'Sphere (like a ball ⚽), Cube (like a dice 🎲), Cylinder (like a soda can 🥫), Cone (like an ice cream cone 🍦).', order: 2 },
          { type: 'heading', content: 'Roll or Slide?', order: 3 },
          { type: 'text', content: 'A ball rolls because it has a curved surface. A book slides because it has a flat face.', order: 4 },
        ],
      },
      completionRequirement: { minScore: 80, mustAnswerAll: true },
      createdBy: adminId,
    });

    const t2s2p1 = await PracticeLevel.create({
      exercise: t2s2._id,
      topic: t2._id,
      grade: grade1._id,
      number: 1,
      title: 'Level 1: Rolling & Sliding Drills',
      description: '30 questions on which objects roll, slide, or both',
      difficulty: 'easy',
      order: 1,
      questionCount: 30,
      passingScore: 70,
      isPublished: true,
      createdBy: adminId,
    });

    await seedPracticeQuestions(t2s2p1, t2s2, t2, 30, (i) => {
      const items = [
        { name: 'A football', action: 'Roll' },
        { name: 'A wooden box', action: 'Slide' },
        { name: 'A round marble', action: 'Roll' },
        { name: 'A flat ruler', action: 'Slide' },
        { name: 'A water bottle', action: 'Both roll and slide' },
      ];
      const itm = items[i % items.length];
      return {
        type: 'mcq',
        text: `Can ${itm.name} roll or slide?`,
        options: ['Roll', 'Slide', 'Both roll and slide', 'Neither'].sort(() => 0.5 - Math.random()),
        correctAnswer: itm.action,
        explanation: `${itm.name} will ${itm.action.toLowerCase()}.`,
      };
    });

    // =========================================================================
    // TOPIC 3: NUMBERS 0 TO 9
    // =========================================================================
    console.log('[Batch 1 Seeder] Ingesting Topic 3: Numbers 0 to 9...');
    const t3 = await Topic.create({
      grade: grade1._id,
      title: 'Number 0 to 9',
      description: 'Master counting, writing, ordering, comparing numbers 0 to 9, and the concept of Zero',
      icon: 'calculator-outline',
      color: '#3B82F6',
      order: 3,
      isPublished: true,
      introduction: {
        summary: 'Numbers 0 to 9 are the building blocks of all mathematics! With just these ten digits, we can build every number in the world.',
        keyTakeaways: [
          'Zero (0) means none or empty.',
          'Counting order is: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9.',
          'Each number is 1 more than the number before it.',
          'We can compare digits using Before, After, and Between.',
        ],
        blocks: [
          {
            type: 'example',
            content: '0 = No apples 🧺\n1 = 🍎\n2 = 🍎🍎\n3 = 🍎🍎🍎\n4 = 🍎🍎🍎🍎\n5 = 🍎🍎🍎🍎🍎',
            order: 1,
          },
        ],
      },
      createdBy: adminId,
    });

    // Topic 3 - Subtopic 1: Numbers 1 to 5
    const t3s1 = await Exercise.create({
      topic: t3._id,
      grade: grade1._id,
      subtopicNumber: 1,
      title: 'Counting & Writing Digits 1 to 5',
      description: 'One-to-one counting, finger math, and number words (one, two, three, four, five)',
      icon: 'hand-left-outline',
      color: '#3B82F6',
      order: 1,
      isPublished: true,
      learningContent: {
        summary: 'Practice counting up to 5 items with one-to-one matching.',
        blocks: [
          { type: 'heading', content: 'Numbers 1 to 5', order: 1 },
          { type: 'text', content: '1 = One, 2 = Two, 3 = Three, 4 = Four, 5 = Five.', order: 2 },
          { type: 'example', content: '⭐⭐⭐ = 3 stars\n🖐️ = 5 fingers on one hand', order: 3 },
          { type: 'tip', content: 'Show fingers on your hand to match each number!', order: 4 },
        ],
      },
      completionRequirement: { minScore: 80, mustAnswerAll: true },
      createdBy: adminId,
    });

    await Question.insertMany([
      {
        context: 'learn',
        exercise: t3s1._id,
        topic: t3._id,
        grade: grade1._id,
        type: 'mcq',
        text: 'How many stars are shown: ⭐⭐⭐⭐?',
        options: ['3', '4', '5', '6'],
        correctAnswer: '4',
        explanation: 'Counting: 1, 2, 3, 4 stars.',
        difficulty: 'easy',
        xpReward: 10,
        order: 1,
      },
      {
        context: 'learn',
        exercise: t3s1._id,
        topic: t3._id,
        grade: grade1._id,
        type: 'numeric',
        text: 'What number comes directly after 2?',
        correctAnswer: 3,
        explanation: '1, 2, 3. Three comes after two.',
        difficulty: 'easy',
        xpReward: 10,
        order: 2,
      },
      {
        context: 'learn',
        exercise: t3s1._id,
        topic: t3._id,
        grade: grade1._id,
        type: 'fill_blank',
        text: 'The number word for 5 is ____.',
        correctAnswer: 'five',
        acceptableAnswers: ['five', 'Five', '5'],
        explanation: '5 is written as f-i-v-e.',
        difficulty: 'easy',
        xpReward: 10,
        order: 3,
      },
    ]);

    const t3s1p1 = await PracticeLevel.create({
      exercise: t3s1._id,
      topic: t3._id,
      grade: grade1._id,
      number: 1,
      title: 'Level 1: Counting Items 1 to 5',
      description: '30 practice drills counting objects up to 5',
      difficulty: 'easy',
      order: 1,
      questionCount: 30,
      passingScore: 70,
      isPublished: true,
      createdBy: adminId,
    });

    await seedPracticeQuestions(t3s1p1, t3s1, t3, 30, (i) => {
      const num = (i % 5) + 1;
      return {
        type: 'mcq',
        text: `Count the dots: ${'● '.repeat(num)}`,
        options: [String(num), String((num % 5) + 1), String(Math.max(1, num - 1)), String((num + 2) % 5 || 5)].sort(() => 0.5 - Math.random()),
        correctAnswer: String(num),
        explanation: `There are ${num} dots.`,
      };
    });

    // Topic 3 - Subtopic 2: Numbers 6 to 9 & Zero
    const t3s2 = await Exercise.create({
      topic: t3._id,
      grade: grade1._id,
      subtopicNumber: 2,
      title: 'Numbers 6 to 9 & The Concept of Zero (0)',
      description: 'Learn digits 6, 7, 8, 9, zero as none, and number ordering',
      icon: 'keypad-outline',
      color: '#10B981',
      order: 2,
      isPublished: true,
      learningContent: {
        summary: 'Zero means nothing is there. Numbers 6 to 9 continue the counting sequence.',
        blocks: [
          { type: 'heading', content: 'What is Zero (0)?', order: 1 },
          { type: 'text', content: 'If all 3 birds fly away from the tree, there are 0 birds left.', order: 2 },
          { type: 'heading', content: 'Numbers 6 to 9', order: 3 },
          { type: 'example', content: '6 = Six, 7 = Seven, 8 = Eight, 9 = Nine.', order: 4 },
        ],
      },
      completionRequirement: { minScore: 80, mustAnswerAll: true },
      createdBy: adminId,
    });

    const t3s2p1 = await PracticeLevel.create({
      exercise: t3s2._id,
      topic: t3._id,
      grade: grade1._id,
      number: 1,
      title: 'Level 1: Digits 6 to 9 & Zero Drills',
      description: '30 questions on counting 6–9 and understanding zero',
      difficulty: 'easy',
      order: 1,
      questionCount: 30,
      passingScore: 70,
      isPublished: true,
      createdBy: adminId,
    });

    await seedPracticeQuestions(t3s2p1, t3s2, t3, 30, (i) => {
      const num = i % 10;
      return {
        type: 'numeric',
        text: num === 0 ? 'If you have a plate with NO cookies, how many cookies do you have?' : `What number comes after ${num - 1}?`,
        correctAnswer: num,
        explanation: num === 0 ? '0 means no cookies.' : `Counting forward: ${num - 1}, ${num}.`,
      };
    });

    // =========================================================================
    // TOPIC 4: NUMBERS 10 TO 20
    // =========================================================================
    console.log('[Batch 1 Seeder] Ingesting Topic 4: Numbers 10 to 20...');
    const t4 = await Topic.create({
      grade: grade1._id,
      title: 'Number 10 to 20',
      description: 'Place value introduction, making a ten, and counting teen numbers up to twenty',
      icon: 'grid-outline',
      color: '#F59E0B',
      order: 4,
      isPublished: true,
      introduction: {
        summary: 'When we reach 10, we make our first 2-digit number! 10 represents one group of ten. Teen numbers (11 to 19) are a ten plus extra ones.',
        keyTakeaways: [
          '10 ones = 1 group of Ten (1 Ten, 0 Ones).',
          '11 = 1 Ten + 1 One (10 + 1).',
          '15 = 1 Ten + 5 Ones (10 + 5).',
          '20 = 2 groups of Ten (2 Tens, 0 Ones).',
        ],
        blocks: [
          {
            type: 'example',
            content: '10 = 🔟 (1 Ten)\n12 = 🔟 + 🍎🍎 (1 Ten, 2 Ones)\n20 = 🔟🔟 (2 Tens)',
            order: 1,
          },
        ],
      },
      createdBy: adminId,
    });

    // Topic 4 - Subtopic 1: Making a Ten & 10
    const t4s1 = await Exercise.create({
      topic: t4._id,
      grade: grade1._id,
      subtopicNumber: 1,
      title: 'The Number 10 & Making a Ten',
      description: 'Learn number pairs that make 10 (bonds to 10)',
      icon: 'apps-outline',
      color: '#F59E0B',
      order: 1,
      isPublished: true,
      learningContent: {
        summary: '10 is a friendly number. Many pairs add up to 10!',
        blocks: [
          { type: 'heading', content: 'Pairs that make 10', order: 1 },
          { type: 'text', content: '9 + 1 = 10, 8 + 2 = 10, 7 + 3 = 10, 6 + 4 = 10, 5 + 5 = 10.', order: 2 },
          { type: 'example', content: '🖐️ + 🖐️ = 10 fingers total!', order: 3 },
        ],
      },
      completionRequirement: { minScore: 80, mustAnswerAll: true },
      createdBy: adminId,
    });

    await Question.insertMany([
      {
        context: 'learn',
        exercise: t4s1._id,
        topic: t4._id,
        grade: grade1._id,
        type: 'numeric',
        text: 'What is 5 + 5?',
        correctAnswer: 10,
        explanation: '5 + 5 makes 10.',
        difficulty: 'easy',
        xpReward: 10,
        order: 1,
      },
      {
        context: 'learn',
        exercise: t4s1._id,
        topic: t4._id,
        grade: grade1._id,
        type: 'mcq',
        text: 'Which number pair makes 10?',
        options: ['7 + 3', '7 + 2', '7 + 1', '7 + 5'],
        correctAnswer: '7 + 3',
        explanation: '7 + 3 = 10.',
        difficulty: 'easy',
        xpReward: 10,
        order: 2,
      },
    ]);

    const t4s1p1 = await PracticeLevel.create({
      exercise: t4s1._id,
      topic: t4._id,
      grade: grade1._id,
      number: 1,
      title: 'Level 1: Number Bonds to 10',
      description: '30 questions finding missing numbers that make 10',
      difficulty: 'easy',
      order: 1,
      questionCount: 30,
      passingScore: 70,
      isPublished: true,
      createdBy: adminId,
    });

    await seedPracticeQuestions(t4s1p1, t4s1, t4, 30, (i) => {
      const a = (i % 9) + 1;
      const missing = 10 - a;
      return {
        type: 'numeric',
        text: `${a} + ? = 10`,
        correctAnswer: missing,
        explanation: `${a} + ${missing} = 10.`,
      };
    });

    // Topic 4 - Subtopic 2: Teen Numbers 11 to 20
    const t4s2 = await Exercise.create({
      topic: t4._id,
      grade: grade1._id,
      subtopicNumber: 2,
      title: 'Teen Numbers (11 to 20)',
      description: 'Count, write, and compare numbers from 11 up to 20',
      icon: 'list-circle-outline',
      color: '#EC4899',
      order: 2,
      isPublished: true,
      learningContent: {
        summary: 'Numbers 11 to 19 have 1 ten and some ones.',
        blocks: [
          { type: 'heading', content: 'Teen Numbers', order: 1 },
          { type: 'text', content: '11 (Eleven), 12 (Twelve), 13 (Thirteen), 14 (Fourteen), 15 (Fifteen), 16 (Sixteen), 17 (Seventeen), 18 (Eighteen), 19 (Nineteen), 20 (Twenty).', order: 2 },
          { type: 'example', content: '14 is 1 Ten and 4 Ones (10 + 4).', order: 3 },
        ],
      },
      completionRequirement: { minScore: 80, mustAnswerAll: true },
      createdBy: adminId,
    });

    const t4s2p1 = await PracticeLevel.create({
      exercise: t4s2._id,
      topic: t4._id,
      grade: grade1._id,
      number: 1,
      title: 'Level 1: 11 to 20 Ordering & Tens',
      description: '30 questions on teen numbers and tens/ones',
      difficulty: 'easy',
      order: 1,
      questionCount: 30,
      passingScore: 70,
      isPublished: true,
      createdBy: adminId,
    });

    await seedPracticeQuestions(t4s2p1, t4s2, t4, 30, (i) => {
      const num = (i % 10) + 11;
      return {
        type: 'mcq',
        text: `What is 10 + ${num - 10}?`,
        options: [String(num), String(num + 1), String(Math.max(10, num - 1)), String(num + 2)].sort(() => 0.5 - Math.random()),
        correctAnswer: String(num),
        explanation: `10 + ${num - 10} = ${num}.`,
      };
    });

    // =========================================================================
    // TOPIC 5: ADDITION AND SUBTRACTION (SINGLE DIGIT)
    // =========================================================================
    console.log('[Batch 1 Seeder] Ingesting Topic 5: Addition and Subtraction (Single Digit)...');
    const t5 = await Topic.create({
      grade: grade1._id,
      title: 'Addition and Subtraction(single digit)',
      description: 'Learn adding (+), subtracting (-), number sentences, and zero rules up to 9',
      icon: 'calculator',
      color: '#8B5CF6',
      order: 5,
      isPublished: true,
      introduction: {
        summary: 'Addition (+) means putting numbers together to make a bigger total. Subtraction (-) means taking numbers away to see what is left.',
        keyTakeaways: [
          'Plus (+) increases the number.',
          'Minus (-) decreases the number.',
          'Adding or subtracting 0 leaves the number unchanged (5 + 0 = 5, 5 - 0 = 5).',
          'Subtracting a number from itself gives zero (4 - 4 = 0).',
        ],
        blocks: [
          {
            type: 'example',
            content: 'Addition: 🍎🍎 + 🍎🍎🍎 = 5 (2 + 3 = 5)\nSubtraction: 🍎🍎🍎🍎 - 🍎 = 3 (4 - 1 = 3)',
            order: 1,
          },
        ],
      },
      createdBy: adminId,
    });

    // Topic 5 - Subtopic 1: Single Digit Addition
    const t5s1 = await Exercise.create({
      topic: t5._id,
      grade: grade1._id,
      subtopicNumber: 1,
      title: 'Single-Digit Addition (Sums to 9)',
      description: 'Combine two groups to find the sum using fingers and number lines',
      icon: 'add-circle-outline',
      color: '#8B5CF6',
      order: 1,
      isPublished: true,
      learningContent: {
        summary: 'To add two single digits, start at the bigger number and count forward.',
        blocks: [
          { type: 'heading', content: 'Adding on a Number Line', order: 1 },
          { type: 'text', content: 'For 5 + 3, start at 5 and take 3 steps forward: 6, 7, 8. So 5 + 3 = 8.', order: 2 },
          { type: 'example', content: '3 + 4 = 7\n2 + 6 = 8\n1 + 8 = 9', order: 3 },
          { type: 'tip', content: 'Start from the larger number to count faster!', order: 4 },
        ],
      },
      completionRequirement: { minScore: 80, mustAnswerAll: true },
      createdBy: adminId,
    });

    await Question.insertMany([
      {
        context: 'learn',
        exercise: t5s1._id,
        topic: t5._id,
        grade: grade1._id,
        type: 'numeric',
        text: 'Calculate: 3 + 4 = ?',
        correctAnswer: 7,
        explanation: '3 + 4 = 7.',
        difficulty: 'easy',
        xpReward: 10,
        order: 1,
      },
      {
        context: 'learn',
        exercise: t5s1._id,
        topic: t5._id,
        grade: grade1._id,
        type: 'mcq',
        text: 'What is 6 + 0?',
        options: ['0', '5', '6', '7'],
        correctAnswer: '6',
        explanation: 'Adding zero to any number keeps it the same (6 + 0 = 6).',
        difficulty: 'easy',
        xpReward: 10,
        order: 2,
      },
      {
        context: 'learn',
        exercise: t5s1._id,
        topic: t5._id,
        grade: grade1._id,
        type: 'numeric',
        text: 'What is 5 + 4?',
        correctAnswer: 9,
        explanation: '5 + 4 = 9.',
        difficulty: 'easy',
        xpReward: 10,
        order: 3,
      },
    ]);

    const t5s1p1 = await PracticeLevel.create({
      exercise: t5s1._id,
      topic: t5._id,
      grade: grade1._id,
      number: 1,
      title: 'Level 1: Addition Drills Within 5',
      description: '30 speed addition questions with totals up to 5',
      difficulty: 'easy',
      order: 1,
      questionCount: 30,
      passingScore: 70,
      isPublished: true,
      createdBy: adminId,
    });

    await seedPracticeQuestions(t5s1p1, t5s1, t5, 30, (i) => {
      const a = (i % 3) + 1;
      const b = (i % 2) + 1;
      const sum = a + b;
      return {
        type: 'numeric',
        text: `Calculate: ${a} + ${b} = ?`,
        correctAnswer: sum,
        explanation: `${a} + ${b} = ${sum}.`,
      };
    });

    const t5s1p2 = await PracticeLevel.create({
      exercise: t5s1._id,
      topic: t5._id,
      grade: grade1._id,
      number: 2,
      title: 'Level 2: Addition Drills Within 9',
      description: '30 speed addition questions with sums up to 9',
      difficulty: 'medium',
      order: 2,
      questionCount: 30,
      passingScore: 75,
      isPublished: true,
      createdBy: adminId,
    });

    await seedPracticeQuestions(t5s1p2, t5s1, t5, 30, (i) => {
      const a = (i % 5) + 1;
      const b = ((i * 2) % 4) + 1;
      const sum = a + b;
      return {
        type: 'mcq',
        text: `What is ${a} + ${b}?`,
        options: [String(sum), String(sum + 1), String(Math.max(1, sum - 1)), String(sum + 2)].sort(() => 0.5 - Math.random()),
        correctAnswer: String(sum),
        explanation: `${a} + ${b} = ${sum}.`,
      };
    });

    // Topic 5 - Subtopic 2: Single Digit Subtraction
    const t5s2 = await Exercise.create({
      topic: t5._id,
      grade: grade1._id,
      subtopicNumber: 2,
      title: 'Single-Digit Subtraction (Differences from 9)',
      description: 'Take away objects and count backwards to subtract single digits',
      icon: 'remove-circle-outline',
      color: '#EF4444',
      order: 2,
      isPublished: true,
      learningContent: {
        summary: 'Subtraction is taking away a smaller number from a bigger number.',
        blocks: [
          { type: 'heading', content: 'Subtracting / Taking Away', order: 1 },
          { type: 'text', content: 'If you have 6 apples and eat 2, you have 6 - 2 = 4 apples left.', order: 2 },
          { type: 'example', content: '8 - 3 = 5\n7 - 4 = 3\n9 - 5 = 4', order: 3 },
          { type: 'tip', content: 'Count backwards on your fingers to find the answer!', order: 4 },
        ],
      },
      completionRequirement: { minScore: 80, mustAnswerAll: true },
      createdBy: adminId,
    });

    const t5s2p1 = await PracticeLevel.create({
      exercise: t5s2._id,
      topic: t5._id,
      grade: grade1._id,
      number: 1,
      title: 'Level 1: Subtraction Drills from 9',
      description: '30 single-digit subtraction drill questions',
      difficulty: 'easy',
      order: 1,
      questionCount: 30,
      passingScore: 70,
      isPublished: true,
      createdBy: adminId,
    });

    await seedPracticeQuestions(t5s2p1, t5s2, t5, 30, (i) => {
      const a = (i % 5) + 5;
      const b = (i % 4) + 1;
      const diff = a - b;
      return {
        type: 'numeric',
        text: `Calculate: ${a} - ${b} = ?`,
        correctAnswer: diff,
        explanation: `${a} - ${b} = ${diff}.`,
      };
    });

    console.log('[Batch 1 Seeder] ✅ SUCCESS: Grade 1 Topics 1 to 5 seeded completely with all Subtopics, Learning Content, Learn Tests, and 30-Question Practice Levels!');
    process.exit(0);
  } catch (err) {
    console.error('[Batch 1 Seeder Error]:', err);
    process.exit(1);
  }
}

seedBatch1();
