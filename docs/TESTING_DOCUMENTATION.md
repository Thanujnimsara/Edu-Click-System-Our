# EDU CLICK LMS – Testing & Verification Documentation

This document outlines the validation procedures executed across all layers of the EDU CLICK LMS platform.

---

## 1. Test Execution Summary

| Test Area | Scope | Verification Method | Result |
| :--- | :--- | :--- | :--- |
| **Cross-Platform Integration** | One Account, All Devices, Sync, RBAC, Exams, Payments | Automated Suite (`cross_platform_integration_test.ts`) | **PASS (71/71 Tests - 100%)** |
| **REST API Server** | Health, Routes, Middleware | `test_suite.ts` automated integration script | **PASS (55/55 Tests - 100%)** |
| **Relational Database** | 36 Tables, Relational Schema, Foreign Keys | Auto-migration & seed initialization on startup | **PASS** (All 13 grades, subjects & users seeded) |
| **Cross-Device Auth** | Student, Teacher, and Admin login | JWT signing, bcrypt verification & role assertions | **PASS** (STU2026xxxx, TCH2026xxxx, Admin login ok) |
| **Enrollment System** | Class capacity & duplicate protection | API enroll tests & unique constraints | **PASS** (Duplicate protection verified) |
| **Payment & Commission**| Bank slip flow & commission split (70/30) | Calculation and audit log validation | **PASS** (70% Teacher / 30% Platform split verified) |
| **Web Frontend Build** | React 18, Vite, Tailwind CSS, i18next | `vite build` production compilation | **PASS** (1,702 modules transformed into `dist`) |
| **Mobile Architecture** | React Native Expo config, icons, splash, TypeScript | `tsc --project apps/mobile/tsconfig.json --noEmit` | **PASS** (0 TypeScript errors) |
| **Desktop Integration** | Tauri config, MSI/NSIS targets & PWA | `tauri.conf.json` & Windows launcher | **PASS** (Desktop launcher verified) |

---

## 2. Cross-Platform Integration Suite Details (`backend/cross_platform_integration_test.ts`)

The test suite can be executed at any time with:
```powershell
cd backend
npm run test:cross
```

### Verified Test Domains (71 Tests Total)

1. **One Account Across All Devices (Tests 1–13)**
   - Registration on Android phone (`Platform: ANDROID`) generates `STU2026xxxx` registration number.
   - 6-digit SMS OTP verification activates the account.
   - Login on iPhone (`Platform: IOS`) using the permanent Registration Number.
   - Login on Windows 11 Desktop (`Platform: WINDOWS`) using username.
   - Login on Web Browser (`Platform: WEB`).
   - Centralized database records all 4 concurrent sessions in `user_sessions`.
   - Remote device revocation: Android session revoked from Windows desktop; Android token immediately rejected with HTTP 401, while Windows and iOS sessions remain valid.

2. **Database Synchronization (Tests 14–15)**
   - User language preference updated to Tamil (`ta`) from Windows desktop.
   - Synchronized preference verified on iPhone.

3. **Academic Catalog & Enrollment (Tests 16–21)**
   - Filtered course catalog by Grade 11.
   - Enrolled in class from iPhone.
   - Verified that enrolled class immediately appears on Windows Desktop timetable.
   - Duplicate enrollment in the same class rejected with HTTP 409 Conflict.

4. **Dual Payment System & 70/30 Commission Split (Tests 22–37)**
   - PayHere checkout initiated with 32-character MD5 cryptographic hash and LKR currency.
   - Direct bank deposit slip submitted to Bank of Ceylon (BOC).
   - Bank deposit slip placed in `PENDING` verification status.
   - Admin queries pending verification queue and locates submission.
   - Admin approves bank deposit slip.
   - System automatically credits teacher wallet with exactly 70% commission (`teacher_earning_lkr`) and platform with 30% (`platform_earning_lkr`).
   - Approved payment confirmed in student payment history and linked to electronic receipt number.

5. **Electronic PDF Receipts (Tests 38–42)**
   - Electronic receipt retrieved by receipt number (`/receipts/:receiptNumber`).
   - Receipt verified with: Student Full Name, Registration Number (`STU2026xxxx`), Grade, Subject Name, Teacher Name, Class Title, Transaction Reference, Amount in LKR, Date, and Verified Status.

6. **Timetable Synchronization (Tests 43–48)**
   - Student timetable retrieved on iPhone displaying scheduled day of week and start time.
   - Teacher timetable retrieved on macOS displaying teaching schedule.

7. **Online MCQ Examination & Auto-Grading (Tests 49–55)**
   - Exam questions retrieved securely (correct answers omitted from student payload).
   - Student submits exam answers (4 correct, 1 incorrect).
   - Automated objective marking engine awards 20 marks, computes 80.0%, and assigns Grade 'A' (≥ 75%).
   - Graded exam recorded in student academic history and retrievable on iPhone.

8. **Role-Based Access Control (RBAC) (Tests 56–61)**
   - Student blocked from Admin statistics endpoint (HTTP 403 Forbidden).
   - Teacher blocked from Admin statistics endpoint (HTTP 403 Forbidden).
   - Student blocked from Teacher attendance endpoint (HTTP 403 Forbidden).
   - Non-admin blocked from creating teacher accounts (HTTP 403 Forbidden).
   - Administrator successfully creates new Teacher account (HTTP 201 Created) with auto-generated Teacher ID (`TCH2026xxxx`).

9. **Notifications System (Tests 62–64)**
   - Student receives payment approval in-app notification.
   - Notification marked as read (`is_read = 1`).

10. **Live Classroom & WebRTC Room Tokens (Tests 65–67)**
    - Enrolled student obtains WebRTC live room token.
    - Live WebRTC room name resolved.
    - Access token generated for low-latency live streaming.

---

## 3. Step-by-Step Manual Testing Walkthrough

### Scenario A: Student Academic & Payment Flow
1. Navigate to `http://localhost:3000/login`
2. Select **Student** tab -> Click **Sign In** (auto-fills `student_kamal` / `Student@1234`).
3. View Student Dashboard:
   - Notice Enrolled Classes: Grade 11 Mathematics.
   - Notice Timetable: Saturday (08:30 - 11:30).
4. Click **PDF Receipt**:
   - Opens the official electronic payment receipt modal with EDU CLICK header, receipt number, and verified status. Click **Save to Downloads** or **Print Receipt**.
5. Click **Join Class**:
   - Launches the built-in high-definition WebRTC classroom with interactive camera, mic toggle, participant roster, hand-raising, screen sharing, and live chat!

### Scenario B: Online MCQ Examination
1. Navigate to `/exams`.
2. Select **2026 G.C.E. O/L Mathematics Model Examination Paper 1**.
3. Click **Start Online Exam**:
   - Timer starts counting down from 30 minutes.
   - Answer the interactive questions.
4. Click **Submit & Grade Exam**:
   - The system immediately grades the answers objectively, displays score, calculates percentage, and awards Grade "A"!

### Scenario C: Admin Bank Slip Verification
1. Sign in as Admin (`admin` / `Admin@1234`) at `/login`.
2. Go to the Admin Dashboard at `/admin`.
3. Review **Pending Bank Slip Verifications**:
   - Inspect student name, registration number, deposited amount, and bank reference.
   - Click **Approve**: System issues receipt number, confirms enrollment, and computes teacher commission (70% to teacher, 30% to platform).

### Scenario D: Cross-Device Synchronization
1. Open the application on multiple browser windows or devices.
2. In Student Dashboard, view **Active Device Sessions**:
   - Displays all logged-in devices with operating system, IP address, and session status.
3. Switch language between English, Sinhala (සිංහල), and Tamil (தமிழ்):
   - Language preference updates immediately and persists across all devices.
