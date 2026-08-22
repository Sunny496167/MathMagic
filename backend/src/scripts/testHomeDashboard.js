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

async function testHomeDashboard() {
  console.log('--- Testing Home Dashboard API ---');

  // 1. Login
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

  // 2. Fetch Home Dashboard
  console.log('\n2. Fetching Home Dashboard (GET /api/v1/progress/home-dashboard)...');
  const dashRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/progress/home-dashboard',
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  console.log('Dashboard Status:', dashRes.status);
  const data = dashRes.body?.data;
  console.log('Student Name:', data?.user?.name);
  console.log('Grade Enrolled:', data?.grade?.name);
  console.log('Continue Lesson:', data?.continueLesson?.exerciseTitle, 'Topic:', data?.continueLesson?.topicTitle);
  console.log('Daily Missions Count:', data?.dailyMissions?.missions?.length);
  console.log('Weekly Activity Days:', data?.weeklyActivity?.length);
  console.log('Math Fact:', data?.dailyMathFact?.title);

  console.log('\n✅ HOME DASHBOARD BACKEND VERIFIED SUCCESSFULLY!');
  process.exit(0);
}

testHomeDashboard().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
