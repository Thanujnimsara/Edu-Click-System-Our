# EDU CLICK LMS – REST API Specification (v1)

**Base URL**: `http://localhost:5000/api/v1`  
**Authentication**: Bearer JWT Token in HTTP `Authorization` Header

---

## 1. System Health & Brand
- **`GET /health`**
  - Public endpoint returning API status, version `4.0.0`, and platform identity.

---

## 2. Authentication & Device Management
- **`POST /auth/register`**
  - **Body**: `{ fullName, username, dateOfBirth, gender, parentName, parentMobile, mobile, email, password, address, district, grade }`
  - **Response**: `{ success: true, data: { registrationNumber: "STU2026xxxx", mobile, mockOtp: "xxxxxx" } }`
- **`POST /auth/verify-otp`**
  - **Body**: `{ mobile, otpCode, deviceName, platform }`
  - **Response**: `{ success: true, data: { accessToken, refreshToken, user } }`
- **`POST /auth/login`**
  - **Body**: `{ identifier, password, deviceName, platform }`
  - **Response**: Returns tokens, role (STUDENT, TEACHER, ADMIN), and profile.
- **`POST /auth/refresh-token`**
  - **Body**: `{ refreshToken }`
  - **Response**: Returns rotated access and refresh tokens.
- **`POST /auth/logout`**
  - Revokes current device session.
- **`POST /auth/logout-all`**
  - Revokes all active sessions across all devices for the authenticated user.
- **`GET /auth/devices`**
  - Returns list of active sessions with device name, IP address, platform, and last active timestamp.
- **`DELETE /auth/devices/:sessionId`**
  - Revokes a specific device session.
- **`PATCH /auth/language`**
  - Synchronizes user preferred language (`en`, `si`, `ta`) across all devices.

---

## 3. Academic & Public Discovery
- **`GET /grades`**: List of National Curriculum Grades 1 through 13.
- **`GET /subjects`**: Available subjects (Mathematics, Science, ICT, Commerce, Physics, Biology, etc.).
- **`GET /teachers`**: Certified teachers with bio, qualifications, experience, and student ratings.
- **`GET /classes`**: Classes query supporting filters `grade`, `subjectId`, `teacherId`, `isFree`, `status`, `search`.
- **`GET /classes/:id`**: Full class details with schedule, platform, and instructor profile.

---

## 4. Enrollments & Timetable
- **`POST /enrollments`** *(Role: STUDENT)*
  - Enrolls student into a class, validates seat capacity, prevents duplicates.
- **`GET /enrollments/my`** *(Role: STUDENT)*
  - Enrolled classes for the authenticated student.
- **`GET /timetable/my`** *(Role: STUDENT, TEACHER)*
  - Weekly schedule grid synchronized in real time.

---

## 5. Payments & Receipts
- **`GET /payments/bank-accounts`**: Official bank accounts (Bank of Ceylon, Commercial Bank, HNB).
- **`POST /payments/payhere/initiate`** *(Role: STUDENT)*
  - Generates PayHere merchant order ID and MD5 verification hash.
- **`POST /payments/bank-slip`** *(Role: STUDENT)*
  - Submits bank deposit slip for administrative approval.
- **`GET /payments/history`** *(Role: STUDENT)*
  - Student's payment log and receipt links.
- **`GET /receipts/:receiptNumber`**: Electronic receipt details.

---

## 6. Examinations & Results
- **`GET /exams`**: Available term papers, model papers, and revision quizzes.
- **`GET /exams/:id`**: Exam questions (MCQ options, allocated marks).
- **`POST /exams/submit`** *(Role: STUDENT)*
  - Evaluates student answers, computes percentage score and grade letter (A, B, C, S, F).
- **`GET /exams/results/my`** *(Role: STUDENT)*
  - Student examination results history.

---

## 7. Teacher Portal
- **`GET /teacher/dashboard`**: Total classes, enrolled learners, earnings, pending commissions.
- **`GET /teacher/classes`**: Classes assigned to the teacher.
- **`POST /teacher/attendance`**: Records student attendance (PRESENT, ABSENT, LATE).

---

## 8. Administrator Console
- **`GET /admin/stats`**: Real-time LMS metrics (Students, Teachers, Classes, Revenue, Commission).
- **`GET /admin/bank-slips/pending`**: Unverified bank deposit slips.
- **`PATCH /admin/bank-slips/:submissionId/verify`**: Approve or Reject slip with notes.
- **`POST /admin/teachers`**: Creates certified teacher account and issues unique Teacher ID.

---

## 9. Live Classroom
- **`GET /live/room/:classId`**: Token for built-in WebRTC classroom or external Zoom/Meet URL.
