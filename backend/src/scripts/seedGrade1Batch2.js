require('dotenv').config();
const mongoose = require('mongoose');
const Grade = require('../modules/curriculum/models/grade.model');
const Topic = require('../modules/curriculum/models/topic.model');
const Exercise = require('../modules/curriculum/models/exercise.model');
const PracticeLevel = require('../modules/curriculum/models/practiceLevel.model');
const Question = require('../modules/question/question.model');
const User = require('../modules/user/user.model');
const config = require('../config/environment');

async function seedBatch2() {
  try {
    console.log('[Batch 2 Seeder] Connecting to MongoDB...');
    await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 8000 });
    console.log('[Batch 2 Seeder] Connected to database.');

    const admin = await User.findOne({ role: 'admin' });
    const adminId = admin ? admin._id : null;

    // Find Grade 1
    const grade1 = await Grade.findOne({ number: 1 });
    if (!grade1) {
      console.error('Grade 1 not found! Please run Batch 1 seeder first.');
      process.exit(1);
    }

    console.log('[Batch 2 Seeder] Target Grade 1 ID:', grade1._id);

    // Clean existing topics 6 to 10 for Grade 1 to ensure clean overwrite
    const existingTopics = await Topic.find({ grade: grade1._id, order: { $gte: 6, $lte: 10 } });
    for (const t of existingTopics) {
      const exs = await Exercise.find({ topic: t._id });
      for (const ex of exs) {
        await PracticeLevel.deleteMany({ exercise: ex._id });
        await Question.deleteMany({ exercise: ex._id });
      }
      await Exercise.deleteMany({ topic: t._id });
      await Question.deleteMany({ topic: t._id });
    }
    await Topic.deleteMany({ grade: grade1._id, order: { $gte: 6, $lte: 10 } });

    console.log('[Batch 2 Seeder] Cleaned existing Topics 6 to 10 for fresh ingestion.');

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
    // TOPIC 6: ADDITION AND SUBTRACTION (UP TO 20)
    // =========================================================================
    console.log('[Batch 2 Seeder] Ingesting Topic 6: Addition and Subtraction (up to 20)...');
    const t6 = await Topic.create({
      grade: grade1._id,
      title: 'Addition and Subtraction(up to 20)',
      description: 'Add and subtract teen numbers using tens, doubles facts, and number lines',
      icon: 'add-circle-outline',
      color: '#3B82F6',
      order: 6,
      isPublished: true,
      introduction: {
        summary: 'Now we take addition and subtraction up to 20! We can add a ten plus ones (10 + 4 = 14) and use double facts like 6 + 6 = 12.',
        keyTakeaways: [
          '10 + single digit is easy: 10 + 7 = 17.',
          'Doubles are pairs of the same number: 5 + 5 = 10, 6 + 6 = 12, 7 + 7 = 14.',
          'When subtracting from a teen number, subtract the ones: 15 - 3 = 12.',
        ],
        blocks: [
          {
            type: 'example',
            content: '10 + 5 = 15\n6 + 6 = 12 (Doubles!)\n18 - 6 = 12\n14 - 4 = 10',
            order: 1,
          },
        ],
      },
      createdBy: adminId,
    });

    // Topic 6 - Subtopic 1: Addition Within 20
    const t6s1 = await Exercise.create({
      topic: t6._id,
      grade: grade1._id,
      subtopicNumber: 1,
      title: 'Addition Within 20 (Making 10 & Doubles)',
      description: 'Add numbers up to 20 using tens frames and double facts',
      icon: 'calculator-outline',
      color: '#3B82F6',
      order: 1,
      isPublished: true,
      learningContent: {
        summary: 'Add by making a ten first, or by using known double facts.',
        blocks: [
          { type: 'heading', content: '10 Plus Ones', order: 1 },
          { type: 'text', content: '10 + 3 = 13, 10 + 8 = 18. The tens digit stays 1 and the ones digit is added.', order: 2 },
          { type: 'heading', content: 'Double Facts', order: 3 },
          { type: 'example', content: '5 + 5 = 10\n6 + 6 = 12\n7 + 7 = 14\n8 + 8 = 16\n9 + 9 = 18\n10 + 10 = 20', order: 4 },
          { type: 'tip', content: 'Memorize your doubles to add fast!', order: 5 },
        ],
      },
      completionRequirement: { minScore: 80, mustAnswerAll: true },
      createdBy: adminId,
    });

    await Question.insertMany([
      {
        context: 'learn',
        exercise: t6s1._id,
        topic: t6._id,
        grade: grade1._id,
        type: 'numeric',
        text: 'What is 10 + 7?',
        correctAnswer: 17,
        explanation: '10 + 7 = 17.',
        difficulty: 'easy',
        xpReward: 10,
        order: 1,
      },
      {
        context: 'learn',
        exercise: t6s1._id,
        topic: t6._id,
        grade: grade1._id,
        type: 'numeric',
        text: 'Calculate the double: 6 + 6 = ?',
        correctAnswer: 12,
        explanation: '6 + 6 = 12.',
        difficulty: 'easy',
        xpReward: 10,
        order: 2,
      },
      {
        context: 'learn',
        exercise: t6s1._id,
        topic: t6._id,
        grade: grade1._id,
        type: 'mcq',
        text: 'What is 8 + 8?',
        options: ['14', '15', '16', '18'],
        correctAnswer: '16',
        explanation: '8 + 8 = 16.',
        difficulty: 'easy',
        xpReward: 10,
        order: 3,
      },
    ]);

    const t6s1p1 = await PracticeLevel.create({
      exercise: t6s1._id,
      topic: t6._id,
      grade: grade1._id,
      number: 1,
      title: 'Level 1: 10+ and Doubles Drills',
      description: '30 questions on 10 + ones and double facts up to 20',
      difficulty: 'easy',
      order: 1,
      questionCount: 30,
      passingScore: 70,
      isPublished: true,
      createdBy: adminId,
    });

    await seedPracticeQuestions(t6s1p1, t6s1, t6, 30, (i) => {
      if (i % 2 === 0) {
        const d = (i % 5) + 5;
        return {
          type: 'numeric',
          text: `Double: ${d} + ${d} = ?`,
          correctAnswer: d * 2,
          explanation: `${d} + ${d} = ${d * 2}.`,
        };
      }
      const ones = (i % 9) + 1;
      return {
        type: 'numeric',
        text: `Calculate: 10 + ${ones} = ?`,
        correctAnswer: 10 + ones,
        explanation: `10 + ${ones} = ${10 + ones}.`,
      };
    });

    // Topic 6 - Subtopic 2: Subtraction Within 20
    const t6s2 = await Exercise.create({
      topic: t6._id,
      grade: grade1._id,
      subtopicNumber: 2,
      title: 'Subtraction Within 20 (Subtracting from Teen Numbers)',
      description: 'Subtract single digits from numbers up to 20',
      icon: 'remove-circle-outline',
      color: '#EF4444',
      order: 2,
      isPublished: true,
      learningContent: {
        summary: 'Subtracting from a teen number reduces the ones or crosses back to 10.',
        blocks: [
          { type: 'heading', content: 'Subtracting from Teens', order: 1 },
          { type: 'text', content: 'For 17 - 4, think: 7 - 4 = 3, so 17 - 4 = 13.', order: 2 },
          { type: 'example', content: '19 - 5 = 14\n16 - 3 = 13\n15 - 5 = 10', order: 3 },
          { type: 'tip', content: 'If you subtract the ones digit, you get exactly 10! (18 - 8 = 10)', order: 4 },
        ],
      },
      completionRequirement: { minScore: 80, mustAnswerAll: true },
      createdBy: adminId,
    });

    const t6s2p1 = await PracticeLevel.create({
      exercise: t6s2._id,
      topic: t6._id,
      grade: grade1._id,
      number: 1,
      title: 'Level 1: Teen Subtraction Drills',
      description: '30 speed subtraction questions within 20',
      difficulty: 'easy',
      order: 1,
      questionCount: 30,
      passingScore: 70,
      isPublished: true,
      createdBy: adminId,
    });

    await seedPracticeQuestions(t6s2p1, t6s2, t6, 30, (i) => {
      const teen = (i % 9) + 11;
      const sub = (i % 5) + 1;
      const diff = teen - sub;
      return {
        type: 'numeric',
        text: `Calculate: ${teen} - ${sub} = ?`,
        correctAnswer: diff,
        explanation: `${teen} - ${sub} = ${diff}.`,
      };
    });

    // =========================================================================
    // TOPIC 7: MEASUREMENT
    // =========================================================================
    console.log('[Batch 2 Seeder] Ingesting Topic 7: Measurement...');
    const t7 = await Topic.create({
      grade: grade1._id,
      title: 'Measurement',
      description: 'Compare and measure length, height, weight, and liquid capacity with non-standard units',
      icon: 'resize-outline',
      color: '#10B981',
      order: 7,
      isPublished: true,
      introduction: {
        summary: 'Measurement tells us how long, tall, heavy, or full something is. We can measure using our steps, hands, paperclips, and balances.',
        keyTakeaways: [
          'Longer and Shorter compare horizontal lengths.',
          'Taller and Shorter compare vertical heights.',
          'A balance scale goes down on the heavier side.',
          'A bigger bucket holds MORE water than a small cup.',
        ],
        blocks: [
          {
            type: 'example',
            content: 'Longer: Bus 🚌 vs Car 🚗\nTaller: Tree 🌲 vs Bush 🌿\nHeavier: Watermelon 🍉 vs Apple 🍎\nHolds More: Bucket 🪣 vs Cup 🥛',
            order: 1,
          },
        ],
      },
      createdBy: adminId,
    });

    // Topic 7 - Subtopic 1: Length & Height
    const t7s1 = await Exercise.create({
      topic: t7._id,
      grade: grade1._id,
      subtopicNumber: 1,
      title: 'Length & Height (Long/Short, Tall/Short)',
      description: 'Compare and measure lengths using paperclips and blocks',
      icon: 'git-commit-outline',
      color: '#10B981',
      order: 1,
      isPublished: true,
      learningContent: {
        summary: 'Place objects end-to-end starting at the same baseline to compare lengths accurately.',
        blocks: [
          { type: 'heading', content: 'Measuring Length', order: 1 },
          { type: 'text', content: 'We can count how many paperclips long a pencil is.', order: 2 },
          { type: 'example', content: 'Pencil A = 5 paperclips long\nPencil B = 3 paperclips long\nPencil A is LONGER!', order: 3 },
          { type: 'tip', content: 'Always start measuring from the exact same starting point!', order: 4 },
        ],
      },
      completionRequirement: { minScore: 80, mustAnswerAll: true },
      createdBy: adminId,
    });

    await Question.insertMany([
      {
        context: 'learn',
        exercise: t7s1._id,
        topic: t7._id,
        grade: grade1._id,
        type: 'mcq',
        text: 'Which is LONGER: A train or a bicycle?',
        options: ['Train', 'Bicycle', 'Both are equal', 'None'],
        correctAnswer: 'Train',
        explanation: 'A train has many carriages and is much longer than a bicycle.',
        difficulty: 'easy',
        xpReward: 10,
        order: 1,
      },
      {
        context: 'learn',
        exercise: t7s1._id,
        topic: t7._id,
        grade: grade1._id,
        type: 'mcq',
        text: 'If a ribbon is 6 blocks long and a string is 4 blocks long, which one is SHORTER?',
        options: ['String', 'Ribbon', 'Both same', 'Neither'],
        correctAnswer: 'String',
        explanation: '4 blocks is less than 6 blocks, so the string is shorter.',
        difficulty: 'easy',
        xpReward: 10,
        order: 2,
      },
    ]);

    const t7s1p1 = await PracticeLevel.create({
      exercise: t7s1._id,
      topic: t7._id,
      grade: grade1._id,
      number: 1,
      title: 'Level 1: Length & Height Comparisons',
      description: '30 questions identifying longest, shortest, tallest objects',
      difficulty: 'easy',
      order: 1,
      questionCount: 30,
      passingScore: 70,
      isPublished: true,
      createdBy: adminId,
    });

    await seedPracticeQuestions(t7s1p1, t7s1, t7, 30, (i) => {
      const lenA = (i % 6) + 2;
      const lenB = ((i + 3) % 6) + 2;
      const askLonger = i % 2 === 0;
      return {
        type: 'mcq',
        text: `Object A is ${lenA} clips long. Object B is ${lenB} clips long. Which is ${askLonger ? 'LONGER' : 'SHORTER'}?`,
        options: ['Object A', 'Object B', 'Both are same'].sort(() => 0.5 - Math.random()),
        correctAnswer: askLonger ? (lenA > lenB ? 'Object A' : 'Object B') : (lenA < lenB ? 'Object A' : 'Object B'),
        explanation: `${lenA > lenB ? 'Object A' : 'Object B'} is longer.`,
      };
    });

    // Topic 7 - Subtopic 2: Weight & Capacity
    const t7s2 = await Exercise.create({
      topic: t7._id,
      grade: grade1._id,
      subtopicNumber: 2,
      title: 'Weight & Capacity (Heavy/Light & Holds More/Less)',
      description: 'Understand balance scales and container volumes',
      icon: 'scale-outline',
      color: '#F59E0B',
      order: 2,
      isPublished: true,
      learningContent: {
        summary: 'Capacity is how much liquid a container can hold. Weight is how heavy an object is.',
        blocks: [
          { type: 'heading', content: 'Capacity (Liquid Volume)', order: 1 },
          { type: 'text', content: 'A big swimming pool holds MORE water than a bathtub.', order: 2 },
          { type: 'heading', content: 'Balance Scale', order: 3 },
          { type: 'text', content: 'The side with the heavier object tilts DOWN.', order: 4 },
        ],
      },
      completionRequirement: { minScore: 80, mustAnswerAll: true },
      createdBy: adminId,
    });

    const t7s2p1 = await PracticeLevel.create({
      exercise: t7s2._id,
      topic: t7._id,
      grade: grade1._id,
      number: 1,
      title: 'Level 1: Capacity & Balance Scale Drills',
      description: '30 questions on container capacity and weight balance',
      difficulty: 'easy',
      order: 1,
      questionCount: 30,
      passingScore: 70,
      isPublished: true,
      createdBy: adminId,
    });

    await seedPracticeQuestions(t7s2p1, t7s2, t7, 30, (i) => {
      const askMore = i % 2 === 0;
      return {
        type: 'mcq',
        text: askMore ? 'Which container HOLDS MORE water: A bucket or a spoon?' : 'Which container HOLDS LESS water: A bottle or a teacup?',
        options: askMore ? ['Bucket', 'Spoon', 'Same', 'None'] : ['Teacup', 'Bottle', 'Same', 'None'],
        correctAnswer: askMore ? 'Bucket' : 'Teacup',
        explanation: askMore ? 'A bucket has much greater capacity than a spoon.' : 'A teacup holds less liquid than a bottle.',
      };
    });

    // =========================================================================
    // TOPIC 8: NUMBERS (21 TO 99)
    // =========================================================================
    console.log('[Batch 2 Seeder] Ingesting Topic 8: Numbers (21 to 99)...');
    const t8 = await Topic.create({
      grade: grade1._id,
      title: 'Numbers(21 to 99)',
      description: 'Master 2-digit numbers, counting by tens, place value (Tens & Ones), and number comparison',
      icon: 'keypad-outline',
      color: '#8B5CF6',
      order: 8,
      isPublished: true,
      introduction: {
        summary: 'Numbers 21 to 99 are made of Tens and Ones. 34 is 3 tens and 4 ones (30 + 4). Learning place value makes big numbers easy!',
        keyTakeaways: [
          'Tens are bundles of 10 (10, 20, 30, 40, 50, 60, 70, 80, 90).',
          'The first digit is Tens, the second digit is Ones.',
          'Compare numbers by looking at the Tens digit first.',
        ],
        blocks: [
          {
            type: 'example',
            content: '25 = 2 Tens + 5 Ones (20 + 5)\n58 = 5 Tens + 8 Ones (50 + 8)\n90 = 9 Tens + 0 Ones',
            order: 1,
          },
        ],
      },
      createdBy: adminId,
    });

    // Topic 8 - Subtopic 1: Tens & Ones Place Value
    const t8s1 = await Exercise.create({
      topic: t8._id,
      grade: grade1._id,
      subtopicNumber: 1,
      title: 'Counting by Tens & Place Value (Tens & Ones)',
      description: 'Break down 2-digit numbers into tens and ones',
      icon: 'layers-outline',
      color: '#8B5CF6',
      order: 1,
      isPublished: true,
      learningContent: {
        summary: 'Every 2-digit number has a Tens place and a Ones place.',
        blocks: [
          { type: 'heading', content: 'Tens and Ones', order: 1 },
          { type: 'text', content: 'In the number 46, 4 is in the Tens place (value 40) and 6 is in the Ones place (value 6).', order: 2 },
          { type: 'example', content: '30 + 7 = 37\n60 + 2 = 62\n80 + 9 = 89', order: 3 },
        ],
      },
      completionRequirement: { minScore: 80, mustAnswerAll: true },
      createdBy: adminId,
    });

    await Question.insertMany([
      {
        context: 'learn',
        exercise: t8s1._id,
        topic: t8._id,
        grade: grade1._id,
        type: 'numeric',
        text: 'How many TENS are in the number 54?',
        correctAnswer: 5,
        explanation: 'In 54, the tens digit is 5.',
        difficulty: 'easy',
        xpReward: 10,
        order: 1,
      },
      {
        context: 'learn',
        exercise: t8s1._id,
        topic: t8._id,
        grade: grade1._id,
        type: 'numeric',
        text: 'How many ONES are in the number 78?',
        correctAnswer: 8,
        explanation: 'In 78, the ones digit is 8.',
        difficulty: 'easy',
        xpReward: 10,
        order: 2,
      },
    ]);

    const t8s1p1 = await PracticeLevel.create({
      exercise: t8s1._id,
      topic: t8._id,
      grade: grade1._id,
      number: 1,
      title: 'Level 1: Tens and Ones Decomposition',
      description: '30 questions finding tens and ones in numbers 21–99',
      difficulty: 'easy',
      order: 1,
      questionCount: 30,
      passingScore: 70,
      isPublished: true,
      createdBy: adminId,
    });

    await seedPracticeQuestions(t8s1p1, t8s1, t8, 30, (i) => {
      const tens = (i % 7) + 2;
      const ones = (i % 9) + 1;
      const num = tens * 10 + ones;
      return {
        type: 'numeric',
        text: `What is ${tens} Tens and ${ones} Ones (${tens * 10} + ${ones})?`,
        correctAnswer: num,
        explanation: `${tens} tens and ${ones} ones = ${num}.`,
      };
    });

    // Topic 8 - Subtopic 2: Comparing & Ordering Numbers 21 to 99
    const t8s2 = await Exercise.create({
      topic: t8._id,
      grade: grade1._id,
      subtopicNumber: 2,
      title: 'Comparing & Ordering Numbers (21 to 99)',
      description: 'Greater than, less than, before, after, and between for 2-digit numbers',
      icon: 'swap-horizontal-outline',
      color: '#EC4899',
      order: 2,
      isPublished: true,
      learningContent: {
        summary: 'To compare two 2-digit numbers, look at the Tens digit first. If tens are equal, compare ones.',
        blocks: [
          { type: 'heading', content: 'Comparing 2 Digits', order: 1 },
          { type: 'text', content: '52 > 38 because 5 tens is greater than 3 tens.', order: 2 },
          { type: 'example', content: '45 > 42\n67 < 81\n99 is the largest 2-digit number!', order: 3 },
        ],
      },
      completionRequirement: { minScore: 80, mustAnswerAll: true },
      createdBy: adminId,
    });

    const t8s2p1 = await PracticeLevel.create({
      exercise: t8s2._id,
      topic: t8._id,
      grade: grade1._id,
      number: 1,
      title: 'Level 1: 2-Digit Number Comparison Drills',
      description: '30 questions comparing 2-digit numbers (> / < / =)',
      difficulty: 'easy',
      order: 1,
      questionCount: 30,
      passingScore: 70,
      isPublished: true,
      createdBy: adminId,
    });

    await seedPracticeQuestions(t8s2p1, t8s2, t8, 30, (i) => {
      const numA = (i * 3) % 70 + 20;
      const numB = (i * 2) % 60 + 25;
      return {
        type: 'true_false',
        text: `Is ${numA} greater than ${numB}?`,
        correctAnswer: numA > numB ? 'true' : 'false',
        explanation: `${numA} is ${numA > numB ? 'greater than' : 'less than or equal to'} ${numB}.`,
      };
    });

    // =========================================================================
    // TOPIC 9: PATTERNS
    // =========================================================================
    console.log('[Batch 2 Seeder] Ingesting Topic 9: Patterns...');
    const t9 = await Topic.create({
      grade: grade1._id,
      title: 'Patterns',
      description: 'Identify, extend, and create repeating shape, color, and skip-counting number patterns',
      icon: 'sparkles-outline',
      color: '#EC4899',
      order: 9,
      isPublished: true,
      introduction: {
        summary: 'A pattern is an arrangement of shapes, colors, or numbers that repeats in a predictable way. Patterns help us predict what comes next!',
        keyTakeaways: [
          'Repeating patterns follow rules like AB, AAB, ABC.',
          'Look for the core part of the pattern that repeats.',
          'Skip counting creates number patterns (2, 4, 6... 5, 10, 15...).',
        ],
        blocks: [
          {
            type: 'example',
            content: 'Shape Pattern: 🔴 🟦 🔴 🟦 🔴 ___ (Next is 🟦)\nNumber Pattern: 2, 4, 6, 8, ___ (Next is 10)',
            order: 1,
          },
        ],
      },
      createdBy: adminId,
    });

    // Topic 9 - Subtopic 1: Shape & Color Patterns
    const t9s1 = await Exercise.create({
      topic: t9._id,
      grade: grade1._id,
      subtopicNumber: 1,
      title: 'Shape & Color Repeating Patterns',
      description: 'Predict next elements in AB, AAB, and ABC patterns',
      icon: 'color-palette-outline',
      color: '#EC4899',
      order: 1,
      isPublished: true,
      learningContent: {
        summary: 'Find the repeating unit to know what comes next.',
        blocks: [
          { type: 'heading', content: 'Repeating Patterns', order: 1 },
          { type: 'text', content: 'In Circle, Square, Circle, Square... the rule is AB. The next shape is Circle.', order: 2 },
          { type: 'example', content: 'Sun, Moon, Sun, Moon, [Sun]\nStar, Star, Heart, Star, Star, [Heart]', order: 3 },
        ],
      },
      completionRequirement: { minScore: 80, mustAnswerAll: true },
      createdBy: adminId,
    });

    await Question.insertMany([
      {
        context: 'learn',
        exercise: t9s1._id,
        topic: t9._id,
        grade: grade1._id,
        type: 'mcq',
        text: 'What comes next in the pattern: Circle, Square, Circle, Square, ____?',
        options: ['Circle', 'Square', 'Triangle', 'Star'],
        correctAnswer: 'Circle',
        explanation: 'The pattern alternates between Circle and Square.',
        difficulty: 'easy',
        xpReward: 10,
        order: 1,
      },
    ]);

    const t9s1p1 = await PracticeLevel.create({
      exercise: t9s1._id,
      topic: t9._id,
      grade: grade1._id,
      number: 1,
      title: 'Level 1: Shape & Color Pattern Drills',
      description: '30 questions extending repeating shape patterns',
      difficulty: 'easy',
      order: 1,
      questionCount: 30,
      passingScore: 70,
      isPublished: true,
      createdBy: adminId,
    });

    await seedPracticeQuestions(t9s1p1, t9s1, t9, 30, (i) => {
      const items = ['Triangle', 'Square', 'Circle', 'Star'];
      const a = items[i % 4];
      const b = items[(i + 1) % 4];
      return {
        type: 'mcq',
        text: `Complete the pattern: ${a}, ${b}, ${a}, ${b}, ${a}, ____`,
        options: [b, a, 'Heart', 'Diamond'].sort(() => 0.5 - Math.random()),
        correctAnswer: b,
        explanation: `The pattern repeats (${a}, ${b}), so ${b} comes next.`,
      };
    });

    // Topic 9 - Subtopic 2: Number Patterns & Skip Counting
    const t9s2 = await Exercise.create({
      topic: t9._id,
      grade: grade1._id,
      subtopicNumber: 2,
      title: 'Number Patterns & Skip Counting (2s, 5s, 10s)',
      description: 'Skip count forward by 2s, 5s, and 10s up to 100',
      icon: 'trending-up-outline',
      color: '#10B981',
      order: 2,
      isPublished: true,
      learningContent: {
        summary: 'Skip counting jumps by the same amount each time.',
        blocks: [
          { type: 'heading', content: 'Skip Counting by 2s, 5s, 10s', order: 1 },
          { type: 'text', content: 'By 2s: 2, 4, 6, 8, 10...\nBy 5s: 5, 10, 15, 20, 25...\nBy 10s: 10, 20, 30, 40, 50...', order: 2 },
        ],
      },
      completionRequirement: { minScore: 80, mustAnswerAll: true },
      createdBy: adminId,
    });

    const t9s2p1 = await PracticeLevel.create({
      exercise: t9s2._id,
      topic: t9._id,
      grade: grade1._id,
      number: 1,
      title: 'Level 1: Skip Counting Sequences',
      description: '30 questions finding missing numbers in 2s, 5s, and 10s patterns',
      difficulty: 'easy',
      order: 1,
      questionCount: 30,
      passingScore: 70,
      isPublished: true,
      createdBy: adminId,
    });

    await seedPracticeQuestions(t9s2p1, t9s2, t9, 30, (i) => {
      const step = [2, 5, 10][i % 3];
      const start = (i % 4) + 1;
      const val1 = start * step;
      const val2 = val1 + step;
      const val3 = val2 + step;
      const nextVal = val3 + step;
      return {
        type: 'numeric',
        text: `Find the next number: ${val1}, ${val2}, ${val3}, ?`,
        correctAnswer: nextVal,
        explanation: `The pattern adds ${step} each time: ${val3} + ${step} = ${nextVal}.`,
      };
    });

    // =========================================================================
    // TOPIC 10: TIME
    // =========================================================================
    console.log('[Batch 2 Seeder] Ingesting Topic 10: Time...');
    const t10 = await Topic.create({
      grade: grade1._id,
      title: 'Time',
      description: 'Read the clock hour (O\'clock), sequence parts of the day, and learn the 7 days of the week',
      icon: 'time-outline',
      color: '#F59E0B',
      order: 10,
      isPublished: true,
      introduction: {
        summary: 'Time tells us when things happen. We wake up in the Morning, go to school, eat lunch in the Afternoon, and sleep at Night.',
        keyTakeaways: [
          'Parts of the Day: Morning 🌅, Afternoon ☀️, Evening 🌇, Night 🌙.',
          'There are 7 Days in a Week (Monday through Sunday).',
          'On a clock: Short hand = Hour, Long hand at 12 = O\'clock.',
        ],
        blocks: [
          {
            type: 'example',
            content: 'Short hand at 3, long hand at 12 ➔ 3:00 (3 O\'clock)\nShort hand at 7, long hand at 12 ➔ 7:00 (7 O\'clock)',
            order: 1,
          },
        ],
      },
      createdBy: adminId,
    });

    // Topic 10 - Subtopic 1: Days of the Week & Daily Routine
    const t10s1 = await Exercise.create({
      topic: t10._id,
      grade: grade1._id,
      subtopicNumber: 1,
      title: 'Sequence of the Day & 7 Days of the Week',
      description: 'Order daily events and memorize the 7 days of the week',
      icon: 'calendar-outline',
      color: '#F59E0B',
      order: 1,
      isPublished: true,
      learningContent: {
        summary: 'The 7 days of the week repeat in the same order every week.',
        blocks: [
          { type: 'heading', content: '7 Days of the Week', order: 1 },
          { type: 'text', content: 'Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.', order: 2 },
          { type: 'heading', content: 'Routine Order', order: 3 },
          { type: 'example', content: '1. Wake up & Breakfast (Morning)\n2. School & Lunch (Afternoon)\n3. Play & Homework (Evening)\n4. Sleep (Night)', order: 4 },
        ],
      },
      completionRequirement: { minScore: 80, mustAnswerAll: true },
      createdBy: adminId,
    });

    await Question.insertMany([
      {
        context: 'learn',
        exercise: t10s1._id,
        topic: t10._id,
        grade: grade1._id,
        type: 'numeric',
        text: 'How many days are in a full week?',
        correctAnswer: 7,
        explanation: 'There are 7 days in a week.',
        difficulty: 'easy',
        xpReward: 10,
        order: 1,
      },
      {
        context: 'learn',
        exercise: t10s1._id,
        topic: t10._id,
        grade: grade1._id,
        type: 'mcq',
        text: 'Which day comes right AFTER Monday?',
        options: ['Sunday', 'Tuesday', 'Wednesday', 'Friday'],
        correctAnswer: 'Tuesday',
        explanation: 'Tuesday comes directly after Monday.',
        difficulty: 'easy',
        xpReward: 10,
        order: 2,
      },
    ]);

    const t10s1p1 = await PracticeLevel.create({
      exercise: t10s1._id,
      topic: t10._id,
      grade: grade1._id,
      number: 1,
      title: 'Level 1: Days of the Week & Routine Drills',
      description: '30 questions on days of the week and parts of the day',
      difficulty: 'easy',
      order: 1,
      questionCount: 30,
      passingScore: 70,
      isPublished: true,
      createdBy: adminId,
    });

    await seedPracticeQuestions(t10s1p1, t10s1, t10, 30, (i) => {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const curIdx = i % 7;
      const nextDay = days[(curIdx + 1) % 7];
      return {
        type: 'mcq',
        text: `Which day comes after ${days[curIdx]}?`,
        options: [nextDay, days[(curIdx + 2) % 7], days[(curIdx + 3) % 7], days[(curIdx + 4) % 7]].sort(() => 0.5 - Math.random()),
        correctAnswer: nextDay,
        explanation: `${nextDay} comes right after ${days[curIdx]}.`,
      };
    });

    // Topic 10 - Subtopic 2: Reading the Clock (Hours & O'clock)
    const t10s2 = await Exercise.create({
      topic: t10._id,
      grade: grade1._id,
      subtopicNumber: 2,
      title: 'Reading the Clock (Hours & O\'clock)',
      description: 'Identify the short hour hand and read exact hour times (e.g. 4:00, 8:00)',
      icon: 'alarm-outline',
      color: '#3B82F6',
      order: 2,
      isPublished: true,
      learningContent: {
        summary: 'The short hand points to the hour. When the long hand is at 12, it is an exact hour (O\'clock).',
        blocks: [
          { type: 'heading', content: 'Hands on a Clock', order: 1 },
          { type: 'text', content: 'Short hand = Hour Hand\nLong hand = Minute Hand.', order: 2 },
          { type: 'example', content: 'Short hand on 4, Long hand on 12 = 4 o\'clock (4:00).', order: 3 },
          { type: 'tip', content: 'Always read the short hand first to find the hour!', order: 4 },
        ],
      },
      completionRequirement: { minScore: 80, mustAnswerAll: true },
      createdBy: adminId,
    });

    const t10s2p1 = await PracticeLevel.create({
      exercise: t10s2._id,
      topic: t10._id,
      grade: grade1._id,
      number: 1,
      title: 'Level 1: Hour & O\'clock Reading Drills',
      description: '30 practice drills reading analog clock hours',
      difficulty: 'easy',
      order: 1,
      questionCount: 30,
      passingScore: 70,
      isPublished: true,
      createdBy: adminId,
    });

    await seedPracticeQuestions(t10s2p1, t10s2, t10, 30, (i) => {
      const hr = (i % 12) + 1;
      return {
        type: 'numeric',
        text: `If the short hand is on ${hr} and the long hand is on 12, what hour is it?`,
        correctAnswer: hr,
        explanation: `It is ${hr} o'clock (${hr}:00).`,
      };
    });

    console.log('[Batch 2 Seeder] ✅ SUCCESS: Grade 1 Topics 6 to 10 seeded completely with all Subtopics, Learning Content, Learn Tests, and 30-Question Practice Levels!');
    process.exit(0);
  } catch (err) {
    console.error('[Batch 2 Seeder Error]:', err);
    process.exit(1);
  }
}

seedBatch2();
