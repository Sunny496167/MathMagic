require('dotenv').config();
const mongoose = require('mongoose');
const Grade = require('../modules/curriculum/models/grade.model');
const Topic = require('../modules/curriculum/models/topic.model');
const Exercise = require('../modules/curriculum/models/exercise.model');
const PracticeLevel = require('../modules/curriculum/models/practiceLevel.model');
const Question = require('../modules/question/question.model');
const User = require('../modules/user/user.model');
const config = require('../config/environment');

async function seedBatch3() {
  try {
    console.log('[Batch 3 Seeder] Connecting to MongoDB...');
    await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 8000 });
    console.log('[Batch 3 Seeder] Connected to database.');

    const admin = await User.findOne({ role: 'admin' });
    const adminId = admin ? admin._id : null;

    // Find Grade 1
    const grade1 = await Grade.findOne({ number: 1 });
    if (!grade1) {
      console.error('Grade 1 not found! Please run Batch 1 and 2 seeders first.');
      process.exit(1);
    }

    console.log('[Batch 3 Seeder] Target Grade 1 ID:', grade1._id);

    // Clean existing topics 11 to 13 for Grade 1 to ensure clean overwrite
    const existingTopics = await Topic.find({ grade: grade1._id, order: { $gte: 11, $lte: 13 } });
    for (const t of existingTopics) {
      const exs = await Exercise.find({ topic: t._id });
      for (const ex of exs) {
        await PracticeLevel.deleteMany({ exercise: ex._id });
        await Question.deleteMany({ exercise: ex._id });
      }
      await Exercise.deleteMany({ topic: t._id });
      await Question.deleteMany({ topic: t._id });
    }
    await Topic.deleteMany({ grade: grade1._id, order: { $gte: 11, $lte: 13 } });

    console.log('[Batch 3 Seeder] Cleaned existing Topics 11 to 13 for fresh ingestion.');

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
    // TOPIC 11: MULTIPLICATION
    // =========================================================================
    console.log('[Batch 3 Seeder] Ingesting Topic 11: Multiplication...');
    const t11 = await Topic.create({
      grade: grade1._id,
      title: 'Multiplication',
      description: 'Understand multiplication as equal groups, repeated addition, and simple skip counting tables',
      icon: 'close-circle-outline',
      color: '#10B981',
      order: 11,
      isPublished: true,
      introduction: {
        summary: 'Multiplication is quick counting in equal groups! Instead of adding 2 + 2 + 2 + 2, we say 4 groups of 2 (4 × 2 = 8).',
        keyTakeaways: [
          'Multiplication is repeated addition of the same number.',
          'The times sign (×) means "groups of".',
          '3 × 2 means 3 groups of 2 = 6.',
          'Skip counting by 2s, 5s, and 10s gives times table facts.',
        ],
        blocks: [
          {
            type: 'example',
            content: '2 + 2 + 2 = 6  ➔  3 × 2 = 6\n5 + 5 + 5 = 15  ➔  3 × 5 = 15\n10 + 10 = 20  ➔  2 × 10 = 20',
            order: 1,
          },
        ],
      },
      createdBy: adminId,
    });

    // Topic 11 - Subtopic 1: Equal Groups & Repeated Addition
    const t11s1 = await Exercise.create({
      topic: t11._id,
      grade: grade1._id,
      subtopicNumber: 1,
      title: 'Equal Groups & Repeated Addition',
      description: 'Count groups of objects and write multiplication sentences',
      icon: 'apps-outline',
      color: '#10B981',
      order: 1,
      isPublished: true,
      learningContent: {
        summary: 'When each group has the exact same number of items, we have equal groups.',
        blocks: [
          { type: 'heading', content: 'What are Equal Groups?', order: 1 },
          { type: 'text', content: 'If 3 plates each have 4 cookies, we have 3 equal groups of 4. Total = 4 + 4 + 4 = 12.', order: 2 },
          { type: 'example', content: '4 groups of 2 apples = 2 + 2 + 2 + 2 = 8 (4 × 2 = 8).', order: 3 },
          { type: 'tip', content: 'Count the number of groups first, then count how many in each group!', order: 4 },
        ],
      },
      completionRequirement: { minScore: 80, mustAnswerAll: true },
      createdBy: adminId,
    });

    await Question.insertMany([
      {
        context: 'learn',
        exercise: t11s1._id,
        topic: t11._id,
        grade: grade1._id,
        type: 'numeric',
        text: 'What is 3 groups of 2 (2 + 2 + 2)?',
        correctAnswer: 6,
        explanation: '3 groups of 2 equals 6.',
        difficulty: 'easy',
        xpReward: 10,
        order: 1,
      },
      {
        context: 'learn',
        exercise: t11s1._id,
        topic: t11._id,
        grade: grade1._id,
        type: 'mcq',
        text: 'Which multiplication sentence matches: 5 + 5 + 5 + 5?',
        options: ['4 × 5', '5 × 5', '3 × 5', '4 + 5'],
        correctAnswer: '4 × 5',
        explanation: 'There are 4 groups of 5, written as 4 × 5.',
        difficulty: 'easy',
        xpReward: 10,
        order: 2,
      },
      {
        context: 'learn',
        exercise: t11s1._id,
        topic: t11._id,
        grade: grade1._id,
        type: 'numeric',
        text: 'Calculate: 2 × 4 = ?',
        correctAnswer: 8,
        explanation: '2 × 4 means 4 + 4 = 8.',
        difficulty: 'easy',
        xpReward: 10,
        order: 3,
      },
    ]);

    const t11s1p1 = await PracticeLevel.create({
      exercise: t11s1._id,
      topic: t11._id,
      grade: grade1._id,
      number: 1,
      title: 'Level 1: Equal Groups & Repeated Addition Drills',
      description: '30 questions calculating total counts from equal groups',
      difficulty: 'easy',
      order: 1,
      questionCount: 30,
      passingScore: 70,
      isPublished: true,
      createdBy: adminId,
    });

    await seedPracticeQuestions(t11s1p1, t11s1, t11, 30, (i) => {
      const groups = (i % 4) + 2;
      const count = ((i + 1) % 3) + 2;
      const total = groups * count;
      return {
        type: 'numeric',
        text: `What is ${groups} groups of ${count} (${groups} × ${count})?`,
        correctAnswer: total,
        explanation: `${groups} groups of ${count} = ${total}.`,
      };
    });

    // Topic 11 - Subtopic 2: Skip Counting Times Tables
    const t11s2 = await Exercise.create({
      topic: t11._id,
      grade: grade1._id,
      subtopicNumber: 2,
      title: 'Skip Counting Times Tables (2s, 5s, 10s)',
      description: 'Use skip counting to rapidly multiply by 2, 5, and 10',
      icon: 'flash-outline',
      color: '#3B82F6',
      order: 2,
      isPublished: true,
      learningContent: {
        summary: 'Multiplying by 2 doubles the number. Multiplying by 10 adds a zero!',
        blocks: [
          { type: 'heading', content: 'Fast Multiplication Facts', order: 1 },
          { type: 'text', content: '2 × 5 = 10\n5 × 4 = 20\n10 × 6 = 60', order: 2 },
          { type: 'tip', content: 'Multiplying by 10 is magic: just put a 0 after the number! (10 × 7 = 70)', order: 3 },
        ],
      },
      completionRequirement: { minScore: 80, mustAnswerAll: true },
      createdBy: adminId,
    });

    const t11s2p1 = await PracticeLevel.create({
      exercise: t11s2._id,
      topic: t11._id,
      grade: grade1._id,
      number: 1,
      title: 'Level 1: 2x, 5x, 10x Times Tables Drills',
      description: '30 speed multiplication questions using 2s, 5s, and 10s',
      difficulty: 'easy',
      order: 1,
      questionCount: 30,
      passingScore: 70,
      isPublished: true,
      createdBy: adminId,
    });

    await seedPracticeQuestions(t11s2p1, t11s2, t11, 30, (i) => {
      const mults = [2, 5, 10];
      const m = mults[i % 3];
      const n = (i % 6) + 1;
      const product = m * n;
      return {
        type: 'numeric',
        text: `Calculate: ${m} × ${n} = ?`,
        correctAnswer: product,
        explanation: `${m} × ${n} = ${product}.`,
      };
    });

    // =========================================================================
    // TOPIC 12: MONEY
    // =========================================================================
    console.log('[Batch 3 Seeder] Ingesting Topic 12: Money...');
    const t12 = await Topic.create({
      grade: grade1._id,
      title: 'Money',
      description: 'Identify coins and currency notes, compare values, and calculate simple purchase totals',
      icon: 'cash-outline',
      color: '#F59E0B',
      order: 12,
      isPublished: true,
      introduction: {
        summary: 'Money is what we use to buy toys, books, food, and clothes! Money comes in round coins and paper currency notes.',
        keyTakeaways: [
          'Coins: 1, 2, 5, 10.',
          'Notes: 10, 20, 50, 100.',
          'A note is worth more than smaller coins (e.g. 20 note > 5 coin).',
          'Combine coins by adding their numbers together.',
        ],
        blocks: [
          {
            type: 'example',
            content: '5 coin + 2 coin = 7 total\n10 note + 10 note = 20 total\nA 50 note is worth MORE than a 10 note.',
            order: 1,
          },
        ],
      },
      createdBy: adminId,
    });

    // Topic 12 - Subtopic 1: Coins & Currency Notes Identification
    const t12s1 = await Exercise.create({
      topic: t12._id,
      grade: grade1._id,
      subtopicNumber: 1,
      title: 'Coins & Currency Notes Identification',
      description: 'Recognize values of coins and paper currency notes',
      icon: 'card-outline',
      color: '#F59E0B',
      order: 1,
      isPublished: true,
      learningContent: {
        summary: 'Look at the number printed on each coin or note to know its value.',
        blocks: [
          { type: 'heading', content: 'Coins and Notes', order: 1 },
          { type: 'text', content: 'Coins are made of metal (1, 2, 5, 10). Notes are rectangular paper bills (10, 20, 50, 100).', order: 2 },
          { type: 'example', content: 'Two 5 coins = One 10 coin or note (5 + 5 = 10).', order: 3 },
        ],
      },
      completionRequirement: { minScore: 80, mustAnswerAll: true },
      createdBy: adminId,
    });

    await Question.insertMany([
      {
        context: 'learn',
        exercise: t12s1._id,
        topic: t12._id,
        grade: grade1._id,
        type: 'mcq',
        text: 'Which is worth MORE: A 5 coin or a 20 note?',
        options: ['20 note', '5 coin', 'Both are equal', 'None'],
        correctAnswer: '20 note',
        explanation: '20 is greater than 5, so a 20 note is worth more.',
        difficulty: 'easy',
        xpReward: 10,
        order: 1,
      },
      {
        context: 'learn',
        exercise: t12s1._id,
        topic: t12._id,
        grade: grade1._id,
        type: 'numeric',
        text: 'How many 5 coins do you need to make 10?',
        correctAnswer: 2,
        explanation: '5 + 5 = 10, so you need 2 coins.',
        difficulty: 'easy',
        xpReward: 10,
        order: 2,
      },
    ]);

    const t12s1p1 = await PracticeLevel.create({
      exercise: t12s1._id,
      topic: t12._id,
      grade: grade1._id,
      number: 1,
      title: 'Level 1: Coin & Note Value Identification',
      description: '30 questions identifying and comparing money values',
      difficulty: 'easy',
      order: 1,
      questionCount: 30,
      passingScore: 70,
      isPublished: true,
      createdBy: adminId,
    });

    await seedPracticeQuestions(t12s1p1, t12s1, t12, 30, (i) => {
      const valA = [1, 2, 5, 10, 20, 50, 100][i % 7];
      const valB = [1, 2, 5, 10, 20, 50, 100][(i + 2) % 7];
      return {
        type: 'true_false',
        text: `Is a ${valA} note/coin worth MORE than a ${valB} note/coin?`,
        correctAnswer: valA > valB ? 'true' : 'false',
        explanation: `${valA} is ${valA > valB ? 'greater than' : 'less than or equal to'} ${valB}.`,
      };
    });

    // Topic 12 - Subtopic 2: Adding Money & Purchases
    const t12s2 = await Exercise.create({
      topic: t12._id,
      grade: grade1._id,
      subtopicNumber: 2,
      title: 'Adding Money & Simple Purchases',
      description: 'Add coin combinations and calculate change in shopping scenarios',
      icon: 'cart-outline',
      color: '#10B981',
      order: 2,
      isPublished: true,
      learningContent: {
        summary: 'To buy an item, add your coins together to see if you have enough.',
        blocks: [
          { type: 'heading', content: 'Shopping with Coins', order: 1 },
          { type: 'text', content: 'If a pencil costs 6 and you have a 5 coin + a 2 coin = 7, you have enough to buy it!', order: 2 },
          { type: 'example', content: '5 + 2 + 1 = 8 total money.', order: 3 },
        ],
      },
      completionRequirement: { minScore: 80, mustAnswerAll: true },
      createdBy: adminId,
    });

    const t12s2p1 = await PracticeLevel.create({
      exercise: t12s2._id,
      topic: t12._id,
      grade: grade1._id,
      number: 1,
      title: 'Level 1: Money Addition & Shopping Drills',
      description: '30 questions calculating total money and shopping prices',
      difficulty: 'easy',
      order: 1,
      questionCount: 30,
      passingScore: 70,
      isPublished: true,
      createdBy: adminId,
    });

    await seedPracticeQuestions(t12s2p1, t12s2, t12, 30, (i) => {
      const c1 = (i % 5) + 1;
      const c2 = ((i * 2) % 5) + 1;
      const sum = c1 + c2;
      return {
        type: 'numeric',
        text: `You have a ${c1} coin and a ${c2} coin. How much total money do you have?`,
        correctAnswer: sum,
        explanation: `${c1} + ${c2} = ${sum}.`,
      };
    });

    // =========================================================================
    // TOPIC 13: DATA HANDLING
    // =========================================================================
    console.log('[Batch 3 Seeder] Ingesting Topic 13: Data Handling...');
    const t13 = await Topic.create({
      grade: grade1._id,
      title: 'Data Handling',
      description: 'Sort and classify collections, read pictographs (picture graphs), and count with tally marks',
      icon: 'pie-chart-outline',
      color: '#EC4899',
      order: 13,
      isPublished: true,
      introduction: {
        summary: 'Data handling means organizing information with pictures and counts so we can answer questions like: Which fruit is most popular? How many red cars are there?',
        keyTakeaways: [
          'Sorting organizes objects into categories by shape, color, or type.',
          'In a Pictograph, pictures represent numbers (1 picture = 1 item).',
          'We can easily see which item has the MOST and which has the LEAST.',
        ],
        blocks: [
          {
            type: 'example',
            content: 'Apples: 🍎🍎🍎 (3)\nBananas: 🍌🍌🍌🍌🍌 (5)\nBananas have the MOST! Apples have the LEAST.',
            order: 1,
          },
        ],
      },
      createdBy: adminId,
    });

    // Topic 13 - Subtopic 1: Sorting & Classifying Objects
    const t13s1 = await Exercise.create({
      topic: t13._id,
      grade: grade1._id,
      subtopicNumber: 1,
      title: 'Sorting & Classifying Objects',
      description: 'Group collections of items by color, shape, and type',
      icon: 'filter-outline',
      color: '#EC4899',
      order: 1,
      isPublished: true,
      learningContent: {
        summary: 'Group similar items together to count and compare easily.',
        blocks: [
          { type: 'heading', content: 'Sorting Objects', order: 1 },
          { type: 'text', content: 'We can sort a basket of mixed fruits into apples, oranges, and bananas.', order: 2 },
          { type: 'example', content: '3 Red Balls, 5 Blue Balls ➔ There are MORE Blue Balls.', order: 3 },
        ],
      },
      completionRequirement: { minScore: 80, mustAnswerAll: true },
      createdBy: adminId,
    });

    await Question.insertMany([
      {
        context: 'learn',
        exercise: t13s1._id,
        topic: t13._id,
        grade: grade1._id,
        type: 'mcq',
        text: 'If there are 4 cats and 7 dogs in a park, which animal is MORE?',
        options: ['Dogs', 'Cats', 'Both same', 'None'],
        correctAnswer: 'Dogs',
        explanation: '7 is greater than 4, so there are more dogs.',
        difficulty: 'easy',
        xpReward: 10,
        order: 1,
      },
      {
        context: 'learn',
        exercise: t13s1._id,
        topic: t13._id,
        grade: grade1._id,
        type: 'numeric',
        text: 'A box has 3 red pencils and 4 green pencils. How many total pencils are in the box?',
        correctAnswer: 7,
        explanation: '3 + 4 = 7 pencils.',
        difficulty: 'easy',
        xpReward: 10,
        order: 2,
      },
    ]);

    const t13s1p1 = await PracticeLevel.create({
      exercise: t13s1._id,
      topic: t13._id,
      grade: grade1._id,
      number: 1,
      title: 'Level 1: Category Counting & Sorting Drills',
      description: '30 questions counting and comparing sorted categories',
      difficulty: 'easy',
      order: 1,
      questionCount: 30,
      passingScore: 70,
      isPublished: true,
      createdBy: adminId,
    });

    await seedPracticeQuestions(t13s1p1, t13s1, t13, 30, (i) => {
      const red = (i % 5) + 2;
      const blue = ((i + 2) % 5) + 2;
      const askRed = i % 2 === 0;
      return {
        type: 'numeric',
        text: `In a box of ${red} red blocks and ${blue} blue blocks, what is the TOTAL number of blocks?`,
        correctAnswer: red + blue,
        explanation: `${red} + ${blue} = ${red + blue}.`,
      };
    });

    // Topic 13 - Subtopic 2: Reading Pictographs
    const t13s2 = await Exercise.create({
      topic: t13._id,
      grade: grade1._id,
      subtopicNumber: 2,
      title: 'Reading Pictographs (Picture Graphs) & Tally Marks',
      description: 'Interpret picture charts to find most, least, and total frequencies',
      icon: 'bar-chart-outline',
      color: '#8B5CF6',
      order: 2,
      isPublished: true,
      learningContent: {
        summary: 'A pictograph uses pictures to represent data. Count the pictures to find the answer.',
        blocks: [
          { type: 'heading', content: 'Reading a Picture Chart', order: 1 },
          { type: 'text', content: 'Each picture counts as 1 item unless a key says otherwise.', order: 2 },
          { type: 'example', content: 'Stars collected:\nAlice: ⭐⭐⭐⭐ (4)\nBob: ⭐⭐ (2)\nAlice collected MORE stars!', order: 3 },
          { type: 'tip', content: 'Look at which row is longest to quickly spot the most popular item!', order: 4 },
        ],
      },
      completionRequirement: { minScore: 80, mustAnswerAll: true },
      createdBy: adminId,
    });

    const t13s2p1 = await PracticeLevel.create({
      exercise: t13s2._id,
      topic: t13._id,
      grade: grade1._id,
      number: 1,
      title: 'Level 1: Picture Graph Interpretation Drills',
      description: '30 questions reading picture charts to find most, least, and totals',
      difficulty: 'easy',
      order: 1,
      questionCount: 30,
      passingScore: 70,
      isPublished: true,
      createdBy: adminId,
    });

    await seedPracticeQuestions(t13s2p1, t13s2, t13, 30, (i) => {
      const appleCount = (i % 6) + 2;
      const orangeCount = ((i + 3) % 6) + 2;
      return {
        type: 'mcq',
        text: `Chart: Apples = ${appleCount}, Oranges = ${orangeCount}. Which fruit has MORE?`,
        options: ['Apples', 'Oranges', 'Both are equal'].sort(() => 0.5 - Math.random()),
        correctAnswer: appleCount > orangeCount ? 'Apples' : 'Oranges',
        explanation: `${appleCount > orangeCount ? 'Apples' : 'Oranges'} has a higher count.`,
      };
    });

    console.log('[Batch 3 Seeder] ✅ SUCCESS: Grade 1 Topics 11, 12, 13 seeded completely! ALL 13 TOPICS ARE NOW FULLY LIVE IN DATABASE!');
    process.exit(0);
  } catch (err) {
    console.error('[Batch 3 Seeder Error]:', err);
    process.exit(1);
  }
}

seedBatch3();
