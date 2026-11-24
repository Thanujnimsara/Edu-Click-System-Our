import { Router } from 'express';
import * as authCtrl from '../controllers/authController';
import * as academicCtrl from '../controllers/academicController';
import * as enrollCtrl from '../controllers/enrollmentController';
import * as payCtrl from '../controllers/paymentController';
import * as adminCtrl from '../controllers/adminController';
import * as teacherCtrl from '../controllers/teacherController';
import * as examCtrl from '../controllers/examController';
import * as liveCtrl from '../controllers/liveClassController';
import * as notifCtrl from '../controllers/notificationController';
import openApiSpec from '../docs/openapi.json';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

// 1. Health check & Brand Information
router.get('/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'EDU CLICK LMS API',
    tagline: 'One Platform. Every Device. Every Student.',
    version: '4.0.0',
    timestamp: new Date().toISOString()
  });
});

router.get('/docs', (req, res) => {
  res.json(openApiSpec);
});

// 2. Authentication Routes
router.post('/auth/register', authCtrl.registerStudent);
router.post('/auth/verify-otp', authCtrl.verifyOTP);
router.post('/auth/student-login-otp', authCtrl.requestStudentLoginOtp);
router.post('/auth/login', authCtrl.login);
router.post('/auth/refresh-token', authCtrl.refreshToken);
router.post('/auth/logout', authenticate, authCtrl.logout);
router.post('/auth/logout-all', authenticate, authCtrl.logoutAllDevices);
router.get('/auth/devices', authenticate, authCtrl.getDevices);
router.delete('/auth/devices/:sessionId', authenticate, authCtrl.revokeDevice);
router.patch('/auth/language', authenticate, authCtrl.updateLanguagePreference);

// 3. Academic & Public Discovery
router.get('/grades', academicCtrl.getGrades);
router.get('/subjects', academicCtrl.getSubjects);
router.get('/teachers', academicCtrl.getTeachers);
router.get('/classes', academicCtrl.getClasses);
router.get('/classes/:id', academicCtrl.getClassDetails);

// 4. Enrollments & Timetable
router.post('/enrollments', authenticate, requireRole('STUDENT'), enrollCtrl.enrollClass);
router.get('/enrollments/my', authenticate, requireRole('STUDENT'), enrollCtrl.getMyEnrolledClasses);
router.get('/timetable/my', authenticate, enrollCtrl.getMyTimetable);

// 5. Payments & Receipts
router.get('/payments/bank-accounts', payCtrl.getBankAccounts);
router.post('/payments/payhere/initiate', authenticate, requireRole('STUDENT'), payCtrl.initiatePayHere);
router.post('/payments/bank-slip', authenticate, requireRole('STUDENT'), payCtrl.submitBankSlip);
router.get('/payments/history', authenticate, requireRole('STUDENT'), payCtrl.getMyPaymentHistory);
router.get('/receipts/:receiptNumber', authenticate, payCtrl.getReceipt);

// 6. Teacher Portal
router.get('/teacher/dashboard', authenticate, requireRole('TEACHER'), teacherCtrl.getTeacherDashboard);
router.get('/teacher/classes', authenticate, requireRole('TEACHER'), teacherCtrl.getTeacherClasses);
router.post('/teacher/attendance', authenticate, requireRole('TEACHER'), teacherCtrl.markAttendance);

// 7. Admin Control Console
router.get('/admin/stats', authenticate, requireRole('ADMIN'), adminCtrl.getAdminStats);
router.get('/admin/bank-slips/pending', authenticate, requireRole('ADMIN'), adminCtrl.getPendingBankSlips);
router.patch('/admin/bank-slips/:submissionId/verify', authenticate, requireRole('ADMIN'), adminCtrl.verifyBankSlip);
router.post('/admin/teachers', authenticate, requireRole('ADMIN'), adminCtrl.createTeacherAccount);

// 8. Examinations & Results
router.get('/exams', examCtrl.getExams);
router.get('/exams/:id', examCtrl.getExamDetails);
router.post('/exams/submit', authenticate, requireRole('STUDENT'), examCtrl.submitExam);
router.get('/exams/results/my', authenticate, requireRole('STUDENT'), examCtrl.getMyResults);

// 9. Live Classes & Built-in Classroom
router.get('/live/room/:classId', authenticate, liveCtrl.getLiveRoomToken);

// 10. Notifications
router.get('/notifications', authenticate, notifCtrl.getMyNotifications);
router.patch('/notifications/:id/read', authenticate, notifCtrl.markNotificationAsRead);

export default router;
