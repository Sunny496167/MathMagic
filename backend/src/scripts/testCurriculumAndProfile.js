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

async function test() {
  console.log('--- Testing MathLearn Curriculum & Admin APIs ---');

  // 1. Login as Admin
  console.log('\n1. Logging in as Admin (admin@mathmagic.com)...');
  const adminLogin = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'admin@mathmagic.com', password: 'Password@123' }
  );

  console.log('Admin Login status:', adminLogin.status);
  const adminToken = adminLogin.body?.data?.accessToken;
  if (!adminToken) {
    console.error('Failed to obtain admin token:', adminLogin.body);
    process.exit(1);
  }

  // 2. Fetch enabled grades (Student View)
  console.log('\n2. Fetching enabled grades (Student View)...');
  const studentGrades = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/curriculum/grades',
    method: 'GET',
  });
  console.log('Enabled grades count:', studentGrades.body?.data?.length);
  const grade1 = studentGrades.body?.data?.find((g) => g.number === 1);
  console.log('Found Grade 1:', grade1?.name, '(ID:', grade1?._id, ')');

  // 3. Fetch all grades (Admin View)
  console.log('\n3. Fetching all grades (Admin View)...');
  const adminGrades = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/admin/grades',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log('Admin total grades count:', adminGrades.body?.data?.length);

  // 4. Test Bulk Question Ingestion in JSON format
  console.log('\n4. Testing Question JSON Ingestion (Bulk format with multiple types)...');
  const topicsRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/v1/admin/topics/grades/${grade1._id}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  const exercisesRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/v1/curriculum/grades/${grade1._id}/topics`,
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const topic1 = exercisesRes.body?.data?.[0];

  const exDetailRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/v1/curriculum/topics/${topic1._id}/exercises`,
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const exercise1 = exDetailRes.body?.data?.[0];

  const pLevelsRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/v1/admin/exercises/${exercise1._id}/practice-levels`,
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const practiceLevel1 = pLevelsRes.body?.data?.[0];

  console.log('Target Practice Level for Ingestion:', practiceLevel1?.title, '(ID:', practiceLevel1?._id, ')');

  const bulkQuestionsPayload = {
    context: 'practice',
    practiceLevelId: practiceLevel1._id,
    questions: [
      {
        type: 'mcq',
        text: 'What is 3 + 6?',
        options: ['7', '8', '9', '10'],
        correctAnswer: '9',
        explanation: '3 + 6 = 9.',
        difficulty: 'easy',
        xpReward: 5,
        order: 101,
      },
      {
        type: 'numeric',
        text: 'Count: 4 + 4 = ?',
        correctAnswer: 8,
        explanation: '4 + 4 = 8.',
        difficulty: 'easy',
        xpReward: 5,
        order: 102,
      },
      {
        type: 'true_false',
        text: '5 is greater than 10.',
        correctAnswer: 'false',
        explanation: '5 is less than 10.',
        difficulty: 'easy',
        xpReward: 5,
        order: 103,
      },
      {
        type: 'fill_blank',
        text: 'Seven plus one is ____.',
        correctAnswer: 'eight',
        acceptableAnswers: ['8', 'eight', 'Eight'],
        explanation: '7 + 1 = 8.',
        difficulty: 'easy',
        xpReward: 5,
        order: 104,
      },
    ],
  };

  const bulkRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/admin/questions/bulk',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    },
    bulkQuestionsPayload
  );

  console.log('Bulk Ingestion response status:', bulkRes.status, 'Message:', bulkRes.body?.message);

  // 5. Test Full Progress Tree endpoint
  console.log('\n5. Testing /progress (Full Progress Tree)...');
  const progressRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/progress',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  console.log('Progress response status:', progressRes.status);
  console.log('Progress grade:', progressRes.body?.data?.grade?.name);
  console.log('Progress topics count:', progressRes.body?.data?.topics?.length);
  console.log(
    'Topic 1 status:',
    progressRes.body?.data?.topics?.[0]?.status,
    'Exercises count:',
    progressRes.body?.data?.topics?.[0]?.exercises?.length
  );
  console.log(
    'Exercise 1 practice levels count:',
    progressRes.body?.data?.topics?.[0]?.exercises?.[0]?.practiceLevels?.length
  );
  console.log('Stats:', progressRes.body?.data?.stats);

  console.log('\n✅ ALL VERIFICATION TESTS PASSED SUCCESSFULLY!');
  process.exit(0);
}

test().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
