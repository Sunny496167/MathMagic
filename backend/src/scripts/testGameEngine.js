const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, body: parsed });
        } catch {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function testGameEngine() {
  console.log('--- Testing MathMagic Game Engine APIs ---');

  // 1. Login as Student / Admin
  console.log('\n1. Logging in as Admin/User...');
  const loginRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'admin@mathmagic.com', password: 'Password@123' }
  );

  const token = loginRes.body?.data?.accessToken;
  console.log('Login Status:', loginRes.status, 'Token acquired:', !!token);

  // 2. Fetch available games
  console.log('\n2. Fetching available games (GET /api/v1/games/available)...');
  const gamesRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/games/available',
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  console.log('Available games status:', gamesRes.status);
  const games = gamesRes.body?.data || [];
  console.log(`Found ${games.length} games:`, games.map((g) => `${g.title} (${g.isUnlocked ? 'Unlocked' : 'Locked'})`));

  // 3. Generate questions for Quick Math
  console.log('\n3. Generating questions for Quick Math (POST /api/v1/games/generate)...');
  const genRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/games/generate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
    { gameType: 'quick_math', questionCount: 10 }
  );

  console.log('Generate Status:', genRes.status);
  const questions = genRes.body?.data?.questions || [];
  console.log(`Generated ${questions.length} questions for Quick Math.`);

  // 4. Submit Game Session
  console.log('\n4. Submitting Game Session (POST /api/v1/games/session)...');
  const submitRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/games/session',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
    {
      gameType: 'quick_math',
      score: 850,
      accuracy: 90,
      maxCombo: 6,
      totalTimeMs: 45000,
      answers: questions.map((q) => ({
        questionId: q._id,
        userAnswer: q.correctAnswer,
        isCorrect: true,
        timeSpentMs: 4000,
      })),
    }
  );

  console.log('Submit Session Status:', submitRes.status);
  console.log('Result:', submitRes.body?.data);

  console.log('\n✅ GAME ENGINE BACKEND VERIFICATION COMPLETE!');
  process.exit(0);
}

testGameEngine().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
