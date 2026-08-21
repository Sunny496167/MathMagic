require('dotenv').config();
const mongoose = require('mongoose');
const Grade = require('../modules/curriculum/models/grade.model');
const Topic = require('../modules/curriculum/models/topic.model');
const Exercise = require('../modules/curriculum/models/exercise.model');
const PracticeLevel = require('../modules/curriculum/models/practiceLevel.model');
const Question = require('../modules/question/question.model');
const User = require('../modules/user/user.model');
const config = require('../config/environment');
const { ROLES } = require('../constants/roles');

async function seed() {
  try {
    console.log('[Seeder] Connecting to MongoDB...');
    await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 8000 });
    console.log('[Seeder] Connected.');

    // 1. Create or ensure Admin user
    let admin = await User.findOne({ email: 'admin@mathmagic.com' });
    if (!admin) {
      admin = await User.create({
        name: 'Admin Master',
        email: 'admin@mathmagic.com',
        password: 'Password@123',
        role: ROLES.ADMIN,
        isEmailVerified: true,
      });
      console.log('[Seeder] Created admin user: admin@mathmagic.com / Password@123');
    } else {
      admin.role = ROLES.ADMIN;
      await admin.save();
      console.log('[Seeder] Admin user exists and verified.');
    }

    // 2. Clean old curriculum data
    console.log('[Seeder] Resetting curriculum collections...');
    await Promise.all([
      Grade.deleteMany({}),
      Topic.deleteMany({}),
      Exercise.deleteMany({}),
      PracticeLevel.deleteMany({}),
      Question.deleteMany({}),
    ]);

    // 3. Seed Grades
    const grade1 = await Grade.create({
      number: 1,
      name: 'Grade 1',
      description: 'Foundational Numbers, Counting, Basic Addition & Subtraction',
      icon: 'shapes-outline',
      color: '#8B5CF6',
      order: 1,
      isEnabled: true, // Enabled
      createdBy: admin._id,
    });

    const grade2 = await Grade.create({
      number: 2,
      name: 'Grade 2',
      description: 'Double Digit Math, Multiplication Basics, Geometry (Admin Toggleable)',
      icon: 'calculator-outline',
      color: '#3B82F6',
      order: 2,
      isEnabled: false, // Disabled initially for admin testing
      createdBy: admin._id,
    });

    console.log('[Seeder] Seeded Grades: Grade 1 (Enabled), Grade 2 (Disabled)');

    // 4. Seed Topics under Grade 1
    const topic1 = await Topic.create({
      grade: grade1._id,
      title: 'Numbers & Counting',
      description: 'Learn to recognize, count, and order numbers 1 to 20',
      icon: 'calculator-outline',
      color: '#10B981',
      order: 1,
      isPublished: true,
      createdBy: admin._id,
    });

    const topic2 = await Topic.create({
      grade: grade1._id,
      title: 'Addition Basics',
      description: 'Combining sets of objects and single-digit sums',
      icon: 'add-circle-outline',
      color: '#8B5CF6',
      order: 2,
      isPublished: true,
      createdBy: admin._id,
    });

    const topic3 = await Topic.create({
      grade: grade1._id,
      title: 'Subtraction Basics',
      description: 'Taking away objects and finding what remains',
      icon: 'remove-circle-outline',
      color: '#EF4444',
      order: 3,
      isPublished: true,
      createdBy: admin._id,
    });

    // 5. Seed Exercises under Topic 1 (Numbers & Counting)
    const ex1 = await Exercise.create({
      topic: topic1._id,
      grade: grade1._id,
      title: 'Counting 1 to 10',
      description: 'Master numbers from one to ten with visual objects',
      icon: 'happy-outline',
      color: '#10B981',
      order: 1,
      isPublished: true,
      learningContent: {
        blocks: [
          {
            type: 'heading',
            content: 'Numbers Are All Around Us!',
            order: 1,
          },
          {
            type: 'text',
            content: 'Numbers help us count objects, tell age, and understand quantities.',
            order: 2,
          },
          {
            type: 'example',
            content: '🍎 = 1 Apple\n🍎🍎 = 2 Apples\n🍎🍎🍎 = 3 Apples\n⭐⭐⭐⭐⭐ = 5 Stars',
            order: 3,
          },
          {
            type: 'tip',
            content: 'Always point with your index finger to each item as you count aloud: 1, 2, 3!',
            order: 4,
          },
        ],
      },
      completionRequirement: {
        minScore: 80,
        mustAnswerAll: true,
      },
      createdBy: admin._id,
    });

    const ex2 = await Exercise.create({
      topic: topic1._id,
      grade: grade1._id,
      title: 'Counting 11 to 20',
      description: 'Count teen numbers up to twenty with grouping',
      icon: 'star-outline',
      color: '#3B82F6',
      order: 2,
      isPublished: true,
      learningContent: {
        blocks: [
          {
            type: 'heading',
            content: 'Moving Beyond Ten: 11 to 20',
            order: 1,
          },
          {
            type: 'text',
            content: 'Eleven (11) is one group of ten plus 1 more: 10 + 1 = 11.',
            order: 2,
          },
        ],
      },
      completionRequirement: {
        minScore: 80,
        mustAnswerAll: true,
      },
      createdBy: admin._id,
    });

    // Seed Exercise under Topic 2 (Addition)
    const ex3 = await Exercise.create({
      topic: topic2._id,
      grade: grade1._id,
      title: 'Addition Within 10',
      description: 'Combine two groups to find the total sum',
      icon: 'add-outline',
      color: '#8B5CF6',
      order: 1,
      isPublished: true,
      learningContent: {
        blocks: [
          {
            type: 'heading',
            content: 'What is Addition?',
            order: 1,
          },
          {
            type: 'text',
            content: 'Addition means putting groups together to make a bigger group (+).',
            order: 2,
          },
          {
            type: 'example',
            content: '2 apples + 3 apples = 5 apples total!',
            order: 3,
          },
        ],
      },
      completionRequirement: {
        minScore: 80,
        mustAnswerAll: true,
      },
      createdBy: admin._id,
    });

    console.log('[Seeder] Seeded Topics and Exercises.');

    // 6. Seed Learn Questions for Exercise 1 (Counting 1 to 10)
    const learnQuestionsEx1 = [
      {
        context: 'learn',
        exercise: ex1._id,
        grade: grade1._id,
        topic: topic1._id,
        type: 'mcq',
        text: 'How many apples are here? 🍎🍎🍎',
        options: ['2', '3', '4', '5'],
        correctAnswer: '3',
        explanation: 'Counting 1, 2, 3 gives exactly 3 apples.',
        difficulty: 'easy',
        xpReward: 10,
        order: 1,
      },
      {
        context: 'learn',
        exercise: ex1._id,
        grade: grade1._id,
        topic: topic1._id,
        type: 'numeric',
        text: 'What number comes immediately after 4?',
        correctAnswer: 5,
        explanation: 'Counting up: 1, 2, 3, 4, 5. Five comes after four.',
        difficulty: 'easy',
        xpReward: 10,
        order: 2,
      },
      {
        context: 'learn',
        exercise: ex1._id,
        grade: grade1._id,
        topic: topic1._id,
        type: 'fill_blank',
        text: 'The word for the number 7 is ____.',
        correctAnswer: 'seven',
        acceptableAnswers: ['7', 'seven', 'Seven'],
        explanation: '7 is spelled s-e-v-e-n.',
        difficulty: 'easy',
        xpReward: 10,
        order: 3,
      },
      {
        context: 'learn',
        exercise: ex1._id,
        grade: grade1._id,
        topic: topic1._id,
        type: 'true_false',
        text: '9 is smaller than 4.',
        correctAnswer: 'false',
        explanation: '9 is greater than 4 because nine comes after four when counting.',
        difficulty: 'easy',
        xpReward: 10,
        order: 4,
      },
      {
        context: 'learn',
        exercise: ex1._id,
        grade: grade1._id,
        topic: topic1._id,
        type: 'mcq',
        text: 'Which group has the most stars? ⭐⭐ or ⭐⭐⭐⭐⭐?',
        options: ['2 stars', '5 stars', 'They are equal', 'None'],
        correctAnswer: '5 stars',
        explanation: '5 is larger than 2, so 5 stars is more.',
        difficulty: 'easy',
        xpReward: 10,
        order: 5,
      },
    ];

    await Question.insertMany(learnQuestionsEx1);
    console.log('[Seeder] Seeded Learn Questions for Exercise 1.');

    // 7. Seed Practice Levels for Exercise 1
    const pLevel1 = await PracticeLevel.create({
      exercise: ex1._id,
      topic: topic1._id,
      grade: grade1._id,
      number: 1,
      title: 'Level 1: Quick Recognition',
      description: '30 questions on instant number identification',
      difficulty: 'easy',
      order: 1,
      questionCount: 30,
      passingScore: 70,
      isPublished: true,
      createdBy: admin._id,
    });

    const pLevel2 = await PracticeLevel.create({
      exercise: ex1._id,
      topic: topic1._id,
      grade: grade1._id,
      number: 2,
      title: 'Level 2: Speed Counting & Matching',
      description: '30 questions testing rapid comparison and word matching',
      difficulty: 'medium',
      order: 2,
      questionCount: 30,
      passingScore: 80,
      isPublished: true,
      createdBy: admin._id,
    });

    // 8. Generate 30 Practice Questions for Practice Level 1
    const practiceQuestionsL1 = [];
    for (let i = 1; i <= 30; i++) {
      const num = (i % 10) + 1;
      practiceQuestionsL1.push({
        context: 'practice',
        practiceLevel: pLevel1._id,
        exercise: ex1._id,
        topic: topic1._id,
        grade: grade1._id,
        type: 'mcq',
        text: `Practice Question #${i}: What number is represented by ${num} dots?`,
        options: [
          String(num),
          String((num % 10) + 1),
          String(Math.max(1, num - 1)),
          String((num + 2) % 10 || 10),
        ].sort(() => 0.5 - Math.random()),
        correctAnswer: String(num),
        explanation: `Counting the dots gives exactly ${num}.`,
        difficulty: 'easy',
        xpReward: 5,
        order: i,
        createdBy: admin._id,
      });
    }

    await Question.insertMany(practiceQuestionsL1);
    console.log(`[Seeder] Seeded 30 Practice Questions for Level 1.`);

    // 9. Assign Grade 1 to any existing students
    await User.updateMany(
      { role: { $ne: 'admin' }, selectedGrade: null },
      { $set: { selectedGrade: grade1._id } }
    );

    console.log('[Seeder] All curriculum, practice levels, and questions seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seeder Error]:', error);
    process.exit(1);
  }
}

seed();
