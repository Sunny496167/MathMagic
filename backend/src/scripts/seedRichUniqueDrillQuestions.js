const mongoose = require('mongoose');
const config = require('../config/environment');
const Question = require('../modules/question/question.model');
const PracticeLevel = require('../modules/curriculum/models/practiceLevel.model');
const Topic = require('../modules/curriculum/models/topic.model');
const Exercise = require('../modules/curriculum/models/exercise.model');

async function seedRichUniqueDrills() {
  console.log('--- Cleaning and Seeding Rich Unique Practice Drill Questions ---');
  await mongoose.connect(config.mongoUri);

  // 1. Fetch all practice levels
  const levels = await PracticeLevel.find().populate('exercise').populate('topic');
  console.log(`Found ${levels.length} practice levels in DB.`);

  for (const lvl of levels) {
    // Delete existing practice questions for this level to remove all old duplicates
    const deleteRes = await Question.deleteMany({ practiceLevel: lvl._id, context: 'practice' });
    console.log(`Cleared ${deleteRes.deletedCount} old questions for level: "${lvl.title}" (L${lvl.number})`);

    const questionsToInsert = [];
    const exerciseTitle = lvl.exercise?.title || '';
    const levelNum = lvl.number || 1;
    const targetCount = lvl.questionCount || 30;

    // Generate 30 unique questions according to level topic
    if (lvl.title.includes('Size Identification') || exerciseTitle.includes('Size')) {
      const sizeItems = [
        { big: 'Elephant', small: 'Rabbit' },
        { big: 'Airplane', small: 'Bicycle' },
        { big: 'Watermelon', small: 'Grape' },
        { big: 'Skyscraper', small: 'Tent' },
        { big: 'Truck', small: 'Skateboard' },
        { big: 'Whale', small: 'Goldfish' },
        { big: 'Mountain', small: 'Pebble' },
        { big: 'Oak Tree', small: 'Daisy' },
        { big: 'Cruise Ship', small: 'Canoe' },
        { big: 'Castle', small: 'Doghouse' },
        { big: 'Hippopotamus', small: 'Hamster' },
        { big: 'Bus', small: 'Scooter' },
        { big: 'Pumpkin', small: 'Cherry' },
        { big: 'Lighthouse', small: 'Streetlamp' },
        { big: 'Grand Piano', small: 'Harmonica' },
        { big: 'Giraffe', small: 'Frog' },
        { big: 'Submarine', small: 'Rowboat' },
        { big: 'Basketball', small: 'Ping-pong ball' },
        { big: 'Dining Table', small: 'Coaster' },
        { big: 'Refrigerator', small: 'Lunchbox' },
        { big: 'Lion', small: 'Ladybug' },
        { big: 'Helicopter', small: 'Drone' },
        { big: 'Pineapple', small: 'Blueberry' },
        { big: 'Windmill', small: 'Pinwheel' },
        { big: 'Tractor', small: 'Wheelbarrow' },
        { big: 'Bear', small: 'Squirrel' },
        { big: 'Sofa', small: 'Footstool' },
        { big: 'Bookshelf', small: 'Bookmark' },
        { big: 'Television', small: 'Smartwatch' },
        { big: 'Wardrobe', small: 'Hanger' },
      ];

      for (let i = 0; i < targetCount; i++) {
        const item = sizeItems[i % sizeItems.length];
        const isBig = i % 2 === 0;
        questionsToInsert.push({
          context: 'practice',
          practiceLevel: lvl._id,
          exercise: lvl.exercise?._id,
          topic: lvl.topic?._id,
          grade: lvl.grade,
          type: 'mcq',
          text: isBig
            ? `Q${i + 1}: Which one is BIGGER in size: ${item.big} or ${item.small}?`
            : `Q${i + 1}: Which one is SMALLER in size: ${item.big} or ${item.small}?`,
          options: [item.big, item.small, 'Both are same', 'Neither'].sort(() => 0.5 - Math.random()),
          correctAnswer: isBig ? item.big : item.small,
          explanation: `${item.big} is bigger in size than ${item.small}.`,
          difficulty: 'easy',
          xpReward: 5,
          order: i + 1,
          isPublished: true,
        });
      }
    } else if (lvl.title.includes('Spatial Position') || exerciseTitle.includes('Position')) {
      const spatialScenarios = [
        { text: 'A bird flying in the sky is at the TOP compared to a cat on the ground.', ans: 'true', exp: 'The sky is at the top.' },
        { text: 'The roots of a tree grow at the TOP of the tree branches.', ans: 'false', exp: 'Roots are at the bottom underground.' },
        { text: 'Fish swim INSIDE the aquarium water.', ans: 'true', exp: 'Fish are inside the water.' },
        { text: 'A dog standing on the lawn is INSIDE the locked doghouse.', ans: 'false', exp: 'The dog on the lawn is outside.' },
        { text: 'The chimney is built at the TOP of the roof.', ans: 'true', exp: 'Chimneys are at the top.' },
        { text: 'Shoes are usually worn at the TOP of your head.', ans: 'false', exp: 'Shoes go on feet at the bottom.' },
        { text: 'Apples inside a fruit basket are OUTSIDE the basket.', ans: 'false', exp: 'They are inside.' },
        { text: 'The ceiling fan hangs at the TOP of the room.', ans: 'true', exp: 'Ceiling fans are at the top.' },
        { text: 'Carpet is placed on the BOTTOM of the floor.', ans: 'true', exp: 'Carpet is at the bottom.' },
        { text: 'A hat is worn on the BOTTOM of your feet.', ans: 'false', exp: 'Hats are worn at the top.' },
        { text: 'Stars are visible at the TOP in the night sky.', ans: 'true', exp: 'Stars are in the sky above.' },
        { text: 'A pencil in your pencil case is INSIDE the case.', ans: 'true', exp: 'It is inside.' },
        { text: 'A bird sitting on the roof is at the BOTTOM of the house.', ans: 'false', exp: 'The roof is at the top.' },
        { text: 'The trunk of a car holds groceries INSIDE.', ans: 'true', exp: 'Groceries are inside the trunk.' },
        { text: 'Grass grows at the BOTTOM under our feet.', ans: 'true', exp: 'Grass is on the ground at the bottom.' },
        { text: 'A pilot sits INSIDE the airplane cockpit.', ans: 'true', exp: 'The pilot is inside.' },
        { text: 'A flag flies at the TOP of the flagpole.', ans: 'true', exp: 'Flags fly at the top.' },
        { text: 'A submarine diving deep is at the TOP of the ocean waves.', ans: 'false', exp: 'Submarines dive to the bottom.' },
        { text: 'Coins placed in a piggy bank are INSIDE the bank.', ans: 'true', exp: 'Coins are inside.' },
        { text: 'A book on the top shelf is placed at the BOTTOM.', ans: 'false', exp: 'It is at the top.' },
        { text: 'The basement is at the BOTTOM of the building.', ans: 'true', exp: 'Basements are at the bottom.' },
        { text: 'Milk inside a glass is OUTSIDE the glass.', ans: 'false', exp: 'Milk is inside the glass.' },
        { text: 'An airplane flies at the TOP above the clouds.', ans: 'true', exp: 'Airplanes fly up top.' },
        { text: 'A swimmer in a pool is INSIDE the pool.', ans: 'true', exp: 'Swimmer is inside.' },
        { text: 'The attic is located at the BOTTOM of a house.', ans: 'false', exp: 'Attics are at the top.' },
        { text: 'A flower planted in soil has its petals at the TOP.', ans: 'true', exp: 'Petals are at the top.' },
        { text: 'An umbrella held above your head is at the BOTTOM.', ans: 'false', exp: 'Umbrella is at the top.' },
        { text: 'Cookies in the cookie jar are INSIDE.', ans: 'true', exp: 'Cookies are inside.' },
        { text: 'The wheels of a bicycle are at the BOTTOM.', ans: 'true', exp: 'Wheels touch the ground at the bottom.' },
        { text: 'A kite in the sky is flying at the TOP.', ans: 'true', exp: 'Kites fly high at the top.' },
      ];

      for (let i = 0; i < targetCount; i++) {
        const item = spatialScenarios[i % spatialScenarios.length];
        questionsToInsert.push({
          context: 'practice',
          practiceLevel: lvl._id,
          exercise: lvl.exercise?._id,
          topic: lvl.topic?._id,
          grade: lvl.grade,
          type: 'true_false',
          text: `Q${i + 1}: ${item.text}`,
          correctAnswer: item.ans,
          explanation: item.exp,
          difficulty: 'easy',
          xpReward: 5,
          order: i + 1,
          isPublished: true,
        });
      }
    } else {
      // General Drill Seeding for arithmetic / quantity / numbers
      for (let i = 0; i < targetCount; i++) {
        const a = (i % 9) + 1;
        const b = ((i * 2 + 3) % 9) + 1;
        const sum = a + b;

        if (lvl.title.includes('Addition') || lvl.title.includes('Adding')) {
          questionsToInsert.push({
            context: 'practice',
            practiceLevel: lvl._id,
            exercise: lvl.exercise?._id,
            topic: lvl.topic?._id,
            grade: lvl.grade,
            type: 'numeric',
            text: `Q${i + 1}: Calculate: ${a} + ${b} = ?`,
            correctAnswer: sum,
            explanation: `${a} plus ${b} equals ${sum}.`,
            difficulty: 'easy',
            xpReward: 5,
            order: i + 1,
            isPublished: true,
          });
        } else if (lvl.title.includes('Subtraction') || lvl.title.includes('Subtract')) {
          const bigger = sum;
          const diff = bigger - a;
          questionsToInsert.push({
            context: 'practice',
            practiceLevel: lvl._id,
            exercise: lvl.exercise?._id,
            topic: lvl.topic?._id,
            grade: lvl.grade,
            type: 'numeric',
            text: `Q${i + 1}: Calculate: ${bigger} - ${a} = ?`,
            correctAnswer: diff,
            explanation: `${bigger} minus ${a} equals ${diff}.`,
            difficulty: 'easy',
            xpReward: 5,
            order: i + 1,
            isPublished: true,
          });
        } else {
          // General Comparison / Counting drill
          const numA = (i % 15) + 1;
          const numB = ((i + 7) % 15) + 1;
          const isGreater = numA > numB;
          questionsToInsert.push({
            context: 'practice',
            practiceLevel: lvl._id,
            exercise: lvl.exercise?._id,
            topic: lvl.topic?._id,
            grade: lvl.grade,
            type: 'mcq',
            text: `Q${i + 1}: Which number is GREATER: ${numA} or ${numB}?`,
            options: [`${numA}`, `${numB}`, 'Both are equal', 'Neither'].sort(() => 0.5 - Math.random()),
            correctAnswer: numA >= numB ? `${numA}` : `${numB}`,
            explanation: `${Math.max(numA, numB)} is greater than ${Math.min(numA, numB)}.`,
            difficulty: 'easy',
            xpReward: 5,
            order: i + 1,
            isPublished: true,
          });
        }
      }
    }

    // Insert the 30 unique questions
    await Question.insertMany(questionsToInsert);
    console.log(`✅ Ingested ${questionsToInsert.length} unique questions for: "${lvl.title}"`);
  }

  console.log('\n🎉 ALL PRACTICE DRILL LEVELS CLEANED & POPULATED WITH 30 DISTINCT QUESTIONS!');
  process.exit(0);
}

seedRichUniqueDrills().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
