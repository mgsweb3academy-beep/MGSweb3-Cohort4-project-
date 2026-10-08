const assert = require('assert');

async function runTests() {
  console.log('Running API Integration Tests...\n');
  const baseUrl = 'http://localhost:3001';

  try {
    // Test 1: Fetch Courses
    const coursesRes = await fetch(`${baseUrl}/courses`);
    assert(coursesRes.ok, 'Failed to fetch courses');
    const courses = await coursesRes.json();
    assert(Array.isArray(courses), 'Courses should be an array');
    console.log('✅ GET /courses passed');

    // Test 2: Fetch Programs
    const programsRes = await fetch(`${baseUrl}/programs`);
    assert(programsRes.ok, 'Failed to fetch programs');
    const programs = await programsRes.json();
    assert(Array.isArray(programs), 'Programs should be an array');
    console.log('✅ GET /programs passed');

    // Test 3: Admin Access (AuthGuard Dev Bypass)
    const adminRes = await fetch(`${baseUrl}/admin/users`);
    assert(adminRes.ok, 'Should return 200 OK for admin with dev bypass');
    console.log('✅ GET /admin/users (Dev Bypass) passed');

    // Test 4: Webhook Push Mock
    const pushRes = await fetch(`${baseUrl}/webhooks/github`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-github-event': 'push'
      },
      body: JSON.stringify({ ref: 'refs/heads/task-fakeid', commits: [1, 2] })
    });
    assert(pushRes.ok, 'Webhook push should return 200');
    console.log('✅ POST /webhooks/github passed');

    console.log('\nAll tests passed successfully! 🎉');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

runTests();
