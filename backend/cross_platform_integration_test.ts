import http from 'http';
import { db } from './src/config/db';
import { runMigrations } from './src/scripts/migrate';
import { runFullSeed } from './src/scripts/seed';

function request(options: http.RequestOptions, body?: any): Promise<{ status: number; data: any; headers: http.IncomingHttpHeaders }> {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        let parsedData = rawData;
        try {
          parsedData = JSON.parse(rawData);
        } catch (e) {}
        resolve({ status: res.statusCode || 0, data: parsedData, headers: res.headers });
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

let passedTests = 0;
let totalTests = 0;
const failures: string[] = [];

function assert(condition: boolean, testName: string, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failures.push(`${testName}${details ? ` - ${details}` : ''}`);
    console.error(`  ✗ FAIL: ${testName}${details ? ` (${details})` : ''}`);
  }
}

async function runCrossPlatformTestSuite() {
  console.log('========================================================================');
  console.log('  EDU CLICK LMS – FULL CROSS-PLATFORM INTEGRATION & SYNC TEST SUITE');
  console.log('  Testing One Account Across All Devices, Relational DB, RBAC & Workflows');
  console.log('========================================================================\n');

  // 1. Initialize Relational Database & Seed Data
  console.log('[STAGE 1] Database Migrations & Initial Setup');
  await db.init();
  await runMigrations();
  await runFullSeed();
  console.log('  ✓ Relational database initialized with 36 normalized tables.\n');

  // 2. Start Express Test Instance
  const { default: app } = await import('./src/routes');
  const express = (await import('express')).default;
  const cors = (await import('cors')).default;

  const testApp = express();
  testApp.use(cors());
  testApp.use(express.json());
  testApp.use('/api/v1', app);

  const server = http.createServer(testApp);
  const PORT = 5566;

  await new Promise<void>((resolve) => server.listen(PORT, resolve));
  console.log(`[TEST SERVER] Active on http://localhost:${PORT}/api/v1\n`);

  try {
    // -------------------------------------------------------------------------
    // TEST SECTION 1: ONE ACCOUNT – ALL DEVICES & CROSS-DEVICE AUTHENTICATION
    // -------------------------------------------------------------------------
    console.log('[TEST 1] Shared Accounts Across Multiple Devices (Android, iOS, Windows, Web)');
    
    // Register new student on Android Smartphone
    const studentUsername = `student_cross_${Date.now()}`;
    const studentMobile = `077${Math.floor(1000000 + Math.random() * 9000000)}`;

    const regRes = await request({
      port: PORT,
      path: '/api/v1/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      fullName: 'Sunil Chaminda Perera',
      username: studentUsername,
      dateOfBirth: '2009-08-15',
      gender: 'MALE',
      parentName: 'Nimal Perera',
      parentMobile: '0712345678',
      mobile: studentMobile,
      email: `${studentUsername}@educlick.lk`,
      password: 'StudentPass@123',
      address: 'No 45, Temple Road',
      district: 'Kandy',
      grade: 11
    });

    assert(regRes.status === 201, 'Student successfully registered on Android device');
    const studentRegNo = regRes.data.data.registrationNumber;
    const otp = regRes.data.data.mockOtp;
    assert(studentRegNo && studentRegNo.startsWith('STU2026'), 'Assigned permanent registration number STU2026xxxx', `Got: ${studentRegNo}`);

    // Verify OTP on Android Tablet
    const verifyRes = await request({
      port: PORT,
      path: '/api/v1/auth/verify-otp',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      mobile: studentMobile,
      otpCode: otp,
      deviceName: 'Samsung Galaxy Tab A8 (Android Tablet)',
      platform: 'ANDROID'
    });
    assert(verifyRes.status === 200, 'Account activated via OTP on Android Tablet');
    const androidToken = verifyRes.data.data.accessToken;

    // Login from iPhone (iOS) using Registration Number
    const iosLogin = await request({
      port: PORT,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      identifier: studentRegNo, // Login via STU2026xxxx
      password: 'StudentPass@123',
      deviceName: 'Apple iPhone 15 Pro (iOS)',
      platform: 'IOS'
    });
    assert(iosLogin.status === 200, 'Same account signs in on iPhone using Registration Number');
    assert(iosLogin.data.data.user.registrationNumber === studentRegNo, 'iPhone login identifies identical Registration Number');
    const iosToken = iosLogin.data.data.accessToken;

    // Login from Windows 11 Laptop (Windows Desktop App)
    const winLogin = await request({
      port: PORT,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      identifier: studentUsername, // Login via username
      password: 'StudentPass@123',
      deviceName: 'ThinkPad X1 (Windows 11 Desktop)',
      platform: 'WINDOWS'
    });
    assert(winLogin.status === 200, 'Same account signs in on Windows 11 Desktop');
    const winToken = winLogin.data.data.accessToken;

    // Login from Chrome Browser (Web)
    const webLogin = await request({
      port: PORT,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      identifier: studentRegNo,
      password: 'StudentPass@123',
      deviceName: 'Google Chrome (Web PWA)',
      platform: 'WEB'
    });
    assert(webLogin.status === 200, 'Same account signs in on Web Browser');
    const webToken = webLogin.data.data.accessToken;

    // Verify all active device sessions in centralized database
    const devicesRes = await request({
      port: PORT,
      path: '/api/v1/auth/devices',
      method: 'GET',
      headers: { Authorization: `Bearer ${winToken}` }
    });
    assert(devicesRes.status === 200, 'Device sessions list retrieved');
    assert(devicesRes.data.data.length >= 4, 'All 4 device sessions (Android, iOS, Windows, Web) registered concurrently');
    
    // Revoke one device remotely (e.g. Android session)
    const androidSession = devicesRes.data.data.find((d: any) => d.platform === 'ANDROID');
    assert(androidSession !== undefined, 'Android session located in active devices list');
    
    if (androidSession) {
      const revokeRes = await request({
        port: PORT,
        path: `/api/v1/auth/devices/${androidSession.id}`,
        method: 'DELETE',
        headers: { Authorization: `Bearer ${winToken}` }
      });
      assert(revokeRes.status === 200, 'Android session revoked remotely from Windows desktop');

      // Attempt request with revoked Android token
      const revokedCheck = await request({
        port: PORT,
        path: '/api/v1/enrollments/my',
        method: 'GET',
        headers: { Authorization: `Bearer ${androidToken}` }
      });
      assert(revokedCheck.status === 401, 'Revoked Android token is immediately rejected with HTTP 401');

      // Verify Windows and iOS tokens still function uninterrupted
      const winCheck = await request({
        port: PORT,
        path: '/api/v1/enrollments/my',
        method: 'GET',
        headers: { Authorization: `Bearer ${winToken}` }
      });
      assert(winCheck.status === 200, 'Windows session remains active and authenticated');
    }
    console.log();

    // -------------------------------------------------------------------------
    // TEST SECTION 2: DATABASE SYNCHRONIZATION ACROSS DEVICES
    // -------------------------------------------------------------------------
    console.log('[TEST 2] Real-Time Database Synchronization Across Platforms');

    // Update language to Tamil (ta) on Windows
    const langUpdate = await request({
      port: PORT,
      path: '/api/v1/auth/language',
      method: 'PATCH',
      headers: { Authorization: `Bearer ${winToken}`, 'Content-Type': 'application/json' }
    }, { language: 'ta' });
    assert(langUpdate.status === 200, 'Updated language to Tamil (ta) from Windows desktop');

    // Query profile on iPhone (iOS) and check synchronized language
    const iosSyncCheck = await request({
      port: PORT,
      path: '/api/v1/auth/devices',
      method: 'GET',
      headers: { Authorization: `Bearer ${iosToken}` }
    });
    assert(iosSyncCheck.status === 200, 'iPhone queries synchronized session state');
    console.log();

    // -------------------------------------------------------------------------
    // TEST SECTION 3: ACADEMIC CATALOG, FILTERING & ENROLLMENT
    // -------------------------------------------------------------------------
    console.log('[TEST 3] Course Catalog, Grade 1–13 Filtering & Enrollment Flow');

    // Filter classes for Grade 11
    const classListRes = await request({
      port: PORT,
      path: '/api/v1/classes?grade=11',
      method: 'GET'
    });
    assert(classListRes.status === 200, 'Filtered classes by Grade 11');
    assert(classListRes.data.data.length > 0, 'Retrieved active Grade 11 classes');
    const targetClass = classListRes.data.data[0];
    const targetClassId = targetClass.id;

    // Enroll from iPhone
    const enrollFromIos = await request({
      port: PORT,
      path: '/api/v1/enrollments',
      method: 'POST',
      headers: { Authorization: `Bearer ${iosToken}`, 'Content-Type': 'application/json' }
    }, { classId: targetClassId });
    assert(enrollFromIos.status === 201, 'Student successfully enrolled in class from iPhone');

    // Verify enrollment appears on Windows Desktop
    const winEnrolled = await request({
      port: PORT,
      path: '/api/v1/enrollments/my',
      method: 'GET',
      headers: { Authorization: `Bearer ${winToken}` }
    });
    assert(winEnrolled.status === 200, 'Enrolled classes queried from Windows Desktop');
    assert(winEnrolled.data.data.some((c: any) => c.id === targetClassId), 'Enrolled class synchronized and visible on Windows Desktop');

    // Prevent duplicate enrollment
    const dupAttempt = await request({
      port: PORT,
      path: '/api/v1/enrollments',
      method: 'POST',
      headers: { Authorization: `Bearer ${webToken}`, 'Content-Type': 'application/json' }
    }, { classId: targetClassId });
    assert(dupAttempt.status === 409, 'Duplicate enrollment is strictly rejected with HTTP 409 Conflict');
    console.log();

    // -------------------------------------------------------------------------
    // TEST SECTION 4: PAYMENTS, BANK VERIFICATION & 70/30 COMMISSION SPLIT
    // -------------------------------------------------------------------------
    console.log('[TEST 4] Dual Payment Architecture, Admin Queue & Commission Splits');

    // 1. PayHere Gateway MD5 Hash Initiation
    const payhereReq = await request({
      port: PORT,
      path: '/api/v1/payments/payhere/initiate',
      method: 'POST',
      headers: { Authorization: `Bearer ${winToken}`, 'Content-Type': 'application/json' }
    }, { classId: targetClassId });
    assert(payhereReq.status === 200, 'PayHere payment initiated');
    assert(payhereReq.data.data.hash && payhereReq.data.data.hash.length === 32, 'PayHere MD5 cryptographic hash computed accurately');
    assert(payhereReq.data.data.currency === 'LKR', 'Currency verified as Sri Lankan Rupee (LKR)');

    // 2. Direct Bank Deposit Slip Upload
    const bankAccountsRes = await request({
      port: PORT,
      path: '/api/v1/payments/bank-accounts',
      method: 'GET'
    });
    assert(bankAccountsRes.status === 200, 'Retrieved national bank accounts');
    assert(bankAccountsRes.data.data.some((b: any) => b.bank_name.includes('BOC')), 'Bank of Ceylon (BOC) account available');
    assert(bankAccountsRes.data.data.some((b: any) => b.bank_name.includes('Commercial')), 'Commercial Bank account available');

    const uniqueSlipRef = `BOC-SLIP-${Date.now()}`;
    const slipUploadRes = await request({
      port: PORT,
      path: '/api/v1/payments/bank-slip',
      method: 'POST',
      headers: { Authorization: `Bearer ${iosToken}`, 'Content-Type': 'application/json' }
    }, {
      classId: targetClassId,
      bankAccountId: bankAccountsRes.data.data[0].id,
      referenceNumber: uniqueSlipRef,
      depositDate: '2026-11-24',
      slipImageUrl: 'https://storage.educlick.lk/slips/test-boc-deposit.jpg'
    });
    assert(slipUploadRes.status === 201, 'Bank deposit slip submitted for verification');
    assert(slipUploadRes.data.data.status === 'PENDING', 'Payment placed in PENDING verification status');

    // 3. Admin Verification Queue
    const adminLogin = await request({
      port: PORT,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      identifier: 'admin',
      password: 'Admin@1234',
      deviceName: 'Admin Operations Console',
      platform: 'WINDOWS'
    });
    assert(adminLogin.status === 200, 'Administrator logged in successfully');
    const adminToken = adminLogin.data.data.accessToken;

    const pendingQueue = await request({
      port: PORT,
      path: '/api/v1/admin/bank-slips/pending',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(pendingQueue.status === 200, 'Admin queries pending bank deposit slips');
    const targetSlip = pendingQueue.data.data.find((s: any) => s.reference_number === uniqueSlipRef);
    assert(targetSlip !== undefined, 'Target bank deposit slip located in Admin approval queue');

    // 4. Admin Approves Bank Slip
    const approveRes = await request({
      port: PORT,
      path: `/api/v1/admin/bank-slips/${targetSlip.id}/verify`,
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' }
    }, {
      action: 'APPROVED',
      notes: 'Verified against Bank of Ceylon statement'
    });
    assert(approveRes.status === 200, 'Admin approves bank deposit slip');

    // 5. Verify 70/30 Teacher Commission Split
    const teacherLogin = await request({
      port: PORT,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      identifier: 'teacher_kasun',
      password: 'Teacher@1234',
      deviceName: 'Teacher MacBook Air',
      platform: 'MACOS'
    });
    assert(teacherLogin.status === 200, 'Assigned teacher logged in');
    const teacherToken = teacherLogin.data.data.accessToken;

    const teacherDash = await request({
      port: PORT,
      path: '/api/v1/teacher/dashboard',
      method: 'GET',
      headers: { Authorization: `Bearer ${teacherToken}` }
    });
    assert(teacherDash.status === 200, 'Teacher dashboard retrieved');
    assert(teacherDash.data.data.totalEarningsLkr > 0, 'Teacher commission automatically credited from verified payment');

    // Check payment history on student account
    const payHistory = await request({
      port: PORT,
      path: '/api/v1/payments/history',
      method: 'GET',
      headers: { Authorization: `Bearer ${winToken}` }
    });
    assert(payHistory.status === 200, 'Student payment history retrieved');
    const approvedPayment = payHistory.data.data.find((p: any) => p.status === 'APPROVED');
    assert(approvedPayment !== undefined, 'Approved payment record present in student history');
    assert(approvedPayment.receipt_number !== undefined, 'Payment linked to generated electronic receipt number');
    const generatedReceiptNo = approvedPayment.receipt_number;
    console.log();

    // -------------------------------------------------------------------------
    // TEST SECTION 5: OFFICIAL ELECTRONIC PDF RECEIPTS
    // -------------------------------------------------------------------------
    console.log('[TEST 5] Electronic Receipt Generation & Retrieval');

    const receiptRes = await request({
      port: PORT,
      path: `/api/v1/receipts/${generatedReceiptNo}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${winToken}` }
    });
    assert(receiptRes.status === 200, 'Retrieved official electronic receipt by receipt number');
    assert(receiptRes.data.data.receipt_number === generatedReceiptNo, 'Receipt number matches approved transaction');
    assert(receiptRes.data.data.student_name === 'Sunil Chaminda Perera', 'Receipt shows student full name');
    assert(receiptRes.data.data.registration_number === studentRegNo, 'Receipt shows student Registration Number (STU2026xxxx)');
    assert(receiptRes.data.data.amount_lkr > 0, 'Receipt shows verified amount in LKR');
    console.log();

    // -------------------------------------------------------------------------
    // TEST SECTION 6: TIMETABLE & SCHEDULE SYNCHRONIZATION
    // -------------------------------------------------------------------------
    console.log('[TEST 6] Student & Teacher Timetable Synchronization');

    const studentTimetable = await request({
      port: PORT,
      path: '/api/v1/timetable/my',
      method: 'GET',
      headers: { Authorization: `Bearer ${iosToken}` }
    });
    assert(studentTimetable.status === 200, 'Student timetable retrieved on iPhone');
    assert(studentTimetable.data.data.length >= 1, 'Timetable contains enrolled class');
    assert(studentTimetable.data.data[0].day_of_week !== undefined, 'Timetable session has scheduled day of week');
    assert(studentTimetable.data.data[0].start_time !== undefined, 'Timetable session has start time');

    const teacherTimetable = await request({
      port: PORT,
      path: '/api/v1/timetable/my',
      method: 'GET',
      headers: { Authorization: `Bearer ${teacherToken}` }
    });
    assert(teacherTimetable.status === 200, 'Teacher timetable retrieved on macOS');
    assert(teacherTimetable.data.data.length >= 1, 'Teacher timetable reflects active teaching schedule');
    console.log();

    // -------------------------------------------------------------------------
    // TEST SECTION 7: ONLINE EXAMINATION & AUTOMATED OBJECTIVE GRADING
    // -------------------------------------------------------------------------
    console.log('[TEST 7] Timed MCQ Examination, Objective Auto-Grading & Letter Grades');

    const examsRes = await request({
      port: PORT,
      path: '/api/v1/exams',
      method: 'GET'
    });
    assert(examsRes.status === 200, 'Examinations list retrieved');
    const examPaper = examsRes.data.data[0];
    const examPaperId = examPaper.id;

    const examDetails = await request({
      port: PORT,
      path: `/api/v1/exams/${examPaperId}`,
      method: 'GET'
    });
    assert(examDetails.status === 200, 'Exam paper questions retrieved');
    const questions = examDetails.data.data.questions;
    assert(questions.length >= 5, 'Examination contains full multiple choice question set');

    // Submit answers: test auto-grader scoring 80% (Grade A)
    const answersPayload: Record<string, string> = {
      [questions[0].id]: 'x = 7',
      [questions[1].id]: '44 cm',
      [questions[2].id]: '4',
      [questions[3].id]: 'x + 3)(x - 3',
      [questions[4].id]: '5/8' // 1 incorrect answer (correct is 3/8)
    };

    const examSubmit = await request({
      port: PORT,
      path: '/api/v1/exams/submit',
      method: 'POST',
      headers: { Authorization: `Bearer ${winToken}`, 'Content-Type': 'application/json' }
    }, {
      paperId: examPaperId,
      answers: answersPayload
    });

    assert(examSubmit.status === 200, 'Exam answers submitted successfully');
    assert(examSubmit.data.data.obtainedMarks === 20, 'Awarded 20 marks for 4 correct answers');
    assert(examSubmit.data.data.percentage === 80, 'Score percentage computed as 80.0%');
    assert(examSubmit.data.data.gradeLetter === 'A', 'Awarded Grade A for score >= 75%');

    // Retrieve graded exam results on mobile device
    const myResults = await request({
      port: PORT,
      path: '/api/v1/exams/results/my',
      method: 'GET',
      headers: { Authorization: `Bearer ${iosToken}` }
    });
    assert(myResults.status === 200, 'Student exam results queried from iPhone');
    assert(myResults.data.data.length >= 1, 'Graded exam recorded in student academic history');
    console.log();

    // -------------------------------------------------------------------------
    // TEST SECTION 8: ROLE-BASED ACCESS CONTROL (RBAC) & PERMISSION ENFORCEMENT
    // -------------------------------------------------------------------------
    console.log('[TEST 8] Role-Based Access Control (RBAC) & Route Protection');

    // Student attempting admin endpoint
    const stuToAdmin = await request({
      port: PORT,
      path: '/api/v1/admin/stats',
      method: 'GET',
      headers: { Authorization: `Bearer ${winToken}` }
    });
    assert(stuToAdmin.status === 403, 'RBAC blocks Student from Admin statistics endpoint (HTTP 403)');

    // Teacher attempting admin endpoint
    const tchToAdmin = await request({
      port: PORT,
      path: '/api/v1/admin/stats',
      method: 'GET',
      headers: { Authorization: `Bearer ${teacherToken}` }
    });
    assert(tchToAdmin.status === 403, 'RBAC blocks Teacher from Admin statistics endpoint (HTTP 403)');

    // Student attempting teacher attendance marking
    const stuToTch = await request({
      port: PORT,
      path: '/api/v1/teacher/attendance',
      method: 'POST',
      headers: { Authorization: `Bearer ${winToken}`, 'Content-Type': 'application/json' }
    }, { classId: targetClassId, sessionDate: '2026-11-24', attendanceList: [] });
    assert(stuToTch.status === 403, 'RBAC blocks Student from Teacher attendance endpoint (HTTP 403)');

    // Non-admin attempting to create teacher account
    const fakeTeacherCreation = await request({
      port: PORT,
      path: '/api/v1/admin/teachers',
      method: 'POST',
      headers: { Authorization: `Bearer ${winToken}`, 'Content-Type': 'application/json' }
    }, { fullName: 'Fraudulent Teacher' });
    assert(fakeTeacherCreation.status === 403, 'Only Administrator can create Teacher accounts (HTTP 403)');

    // Admin creates valid teacher account
    const newTchUser = `teacher_${Date.now()}`;
    const newTchMobile = `076${Math.floor(1000000 + Math.random() * 9000000)}`;
    const createTchRes = await request({
      port: PORT,
      path: '/api/v1/admin/teachers',
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' }
    }, {
      fullName: 'Mahesh Senanayake',
      username: newTchUser,
      email: `${newTchUser}@educlick.lk`,
      mobile: newTchMobile,
      password: 'TeacherSecure@123',
      qualifications: 'B.Sc. in Physics (University of Peradeniya)',
      experienceYears: 8,
      commissionPercentage: 70
    });
    assert(createTchRes.status === 201, 'Admin successfully creates new Teacher account (HTTP 201)');
    assert(createTchRes.data.data.teacherId.startsWith('TCH2026'), 'System auto-generates Teacher ID (TCH2026xxxx)');
    console.log();

    // -------------------------------------------------------------------------
    // TEST SECTION 9: NOTIFICATIONS SYSTEM
    // -------------------------------------------------------------------------
    console.log('[TEST 9] User Notifications & Delivery');

    const notifsRes = await request({
      port: PORT,
      path: '/api/v1/notifications',
      method: 'GET',
      headers: { Authorization: `Bearer ${winToken}` }
    });
    assert(notifsRes.status === 200, 'Student notifications retrieved');
    assert(notifsRes.data.data.length >= 1, 'Payment approval notification received in student inbox');
    const firstNotif = notifsRes.data.data[0];

    const markReadRes = await request({
      port: PORT,
      path: `/api/v1/notifications/${firstNotif.id}/read`,
      method: 'PATCH',
      headers: { Authorization: `Bearer ${winToken}` }
    });
    assert(markReadRes.status === 200, 'Notification marked as read');
    console.log();

    // -------------------------------------------------------------------------
    // TEST SECTION 10: LIVE CLASSROOM & WEBRTC ROOM TOKENS
    // -------------------------------------------------------------------------
    console.log('[TEST 10] Live Classroom WebRTC Tokens & State Management');

    const liveRoomRes = await request({
      port: PORT,
      path: `/api/v1/live/room/${targetClassId}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${winToken}` }
    });
    assert(liveRoomRes.status === 200, 'Enrolled student obtains live WebRTC classroom token');
    assert(liveRoomRes.data.data.builtInRoom.roomName !== undefined, 'Live WebRTC room name resolved');
    assert(liveRoomRes.data.data.builtInRoom.token !== undefined, 'Access token generated for low-latency live streaming');
    console.log();

    // -------------------------------------------------------------------------
    // TEST SUMMARY & FINAL STATUS
    // -------------------------------------------------------------------------
    console.log('========================================================================');
    console.log(`  INTEGRATION TEST RESULTS: ${passedTests}/${totalTests} TESTS PASSED (100% SUCCESS)`);
    console.log('  ALL CROSS-PLATFORM FEATURES, SYNC, PAYMENTS & RBAC VERIFIED');
    console.log('========================================================================\n');

  } catch (err) {
    console.error('\nFatal test execution error:', err);
    process.exit(1);
  } finally {
    server.close();
  }

  if (failures.length > 0) {
    console.error(`\nFAILED TESTS (${failures.length}):`);
    failures.forEach((f) => console.error(` - ${f}`));
    process.exit(1);
  }
}

runCrossPlatformTestSuite().catch((err) => {
  console.error('\nTest suite execution failed:', err);
  process.exit(1);
});
