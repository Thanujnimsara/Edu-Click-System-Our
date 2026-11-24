# EDU CLICK – Complete Cross-Platform LMS

> **Tagline**: *One Platform. Every Device. Every Student.*  
> **Target Region**: Sri Lanka (Grade 1–13 National Curriculum)  
> **Supported Languages**: Sinhala (සිංහල), Tamil (தமிழ்), English  
> **Platforms Supported**: Android Smartphones & Tablets, Apple iPhones & iPads, Windows 10/11 Computers, macOS, Linux, and Modern Desktop/Mobile Web Browsers.

---

## 1. Project Overview & Architecture

EDU CLICK is a commercial-grade, multi-platform Online Learning Management System engineered specifically for the Sri Lankan primary, secondary, G.C.E. O/L, and G.C.E. A/L education sectors. 

The entire ecosystem is powered by a **single centralized backend API and normalized MySQL 8.0 relational database**. Every student, teacher, and administrator uses a single account synchronized in real-time across all physical devices.

```
EDU-CLICK/
├── apps/
│   ├── web/                    # React 18 + Vite + Tailwind CSS + i18next + PWA
│   ├── mobile/                 # React Native + Expo (Android APK/AAB & iOS)
│   └── desktop/                # Windows 10/11 Desktop Launcher & Tauri Engine
├── backend/                    # Node.js + Express + TypeScript REST API + WebSockets
│   ├── src/
│   │   ├── config/             # MySQL 8.0 & pure WebAssembly relational engines
│   │   ├── controllers/        # Auth, Academics, Enroll, Pay, Exams, Live, Admin
│   │   ├── middleware/         # JWT, RBAC, Rate Limiting, Session verification
│   │   ├── routes/             # Versioned REST endpoints (/api/v1/...)
│   │   ├── utils/              # Token rotation, OTP generator, Sequential IDs
│   │   └── server.ts           # HTTP & Real-Time WebSocket Server
│   └── package.json
├── database/
│   ├── schema.sql              # Pure MySQL 8.0 DDL (36 normalized tables)
│   └── seeds/                  # Sri Lankan Grade 1-13 subjects, teachers & classes
├── shared/                     # TypeScript types, constants, and brand tokens
└── docs/                       # Complete deployment, API, mobile, and desktop guides
```

---

## 2. Official Brand Identity

| Element | Specification |
| :--- | :--- |
| **Brand Name** | **EDU CLICK** |
| **Tagline** | *One Platform. Every Device. Every Student.* |
| **Primary Color** | `#142B4F` (Deep Navy) |
| **Secondary Color** | `#2563EB` (Vibrant Blue) |
| **Accent Color** | `#14B8A6` (Modern Teal) |
| **Background Color**| `#F5F7FB` (Soft Page Tint) |
| **Card Surface** | `#FFFFFF` (Pure White) |
| **Typography** | Inter, Noto Sans Sinhala, Noto Sans Tamil |

---

## 3. Ready-To-Test Demo Accounts

The database comes pre-seeded with verified test accounts across all 3 user roles:

| Role | Username / Identifier | Password | Details |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `Admin@1234` | Full system control, bank slip approval, commission configuration. |
| **Teacher (Maths)** | `teacher_kasun` | `Teacher@1234` | Teacher ID: `TCH20260001` (Grade 10-11 Mathematics). |
| **Teacher (Science)** | `teacher_priya` | `Teacher@1234` | Teacher ID: `TCH20260002` (Grade 10-11 Science). |
| **Student (Kamal)** | `student_kamal` or `STU20260001` | `Student@1234` | Grade 11 Student (Colombo District). Enrolled in Mathematics. |
| **Student (Fatima)** | `student_fatima` or `STU20260002` | `Student@1234` | Grade 10 Student (Kandy District). |

---

## 4. Key Platform Features

1. **One Account Across All Devices**:
   - Register on an Android phone, sign in on a Windows laptop, review exam results on an iPad.
   - User profile, active device sessions, timetables, receipts, and language preferences remain 100% synchronized.
   - Device Management console lets users inspect active device logins and revoke sessions remotely.

2. **Dual Live Classroom**:
   - **Built-in WebRTC Classroom**: Full high-definition classroom with camera, microphone, screen sharing, hand-raising, participant roster, and real-time interactive text chat.
   - **External Links**: Direct 1-click integration with Zoom, Google Meet, and Microsoft Teams.

3. **Dual Payment System**:
   - **PayHere Online Gateway**: PayHere Sri Lanka integration supporting Visa, MasterCard, eZ Cash, mCash, and Internet Banking with MD5 signature validation.
   - **Bank Transfer Verification**: Students deposit directly into Bank of Ceylon (BOC), Commercial Bank of Ceylon, or Hatton National Bank (HNB), upload payment slips, and receive an instant notification upon admin verification.

4. **Official Electronic PDF Receipts**:
   - Automated electronic receipt generation with official EDU CLICK header, student registration number, class fee, transaction ID, and timestamp. Printable directly from the portal.

5. **Examination Engine**:
   - Category filtering (First Term, Second Term, Third Term, Model Papers, Revision, Past Papers).
   - Online MCQ quiz runner with live countdown timer, auto-grading, and instant score reports with grade letters (A, B, C, S, F).

6. **Teacher Commission & Attendance**:
   - Automated commission splits (e.g. 70% Teacher, 30% Platform).
   - Real-time student attendance marking (Present, Absent, Late).

7. **Multilingual Sri Lankan Support**:
   - Full trilingual support in English, Sinhala (සිංහල), and Tamil (தமிழ்) via `i18next`.

---

## 5. Quick Start Instructions

### Prerequisites
- Node.js v18+ (tested on Node.js v24 LTS)
- npm v10+

### Step 1: Start Backend Server
```powershell
cd backend
npm run dev
# Server binds to http://localhost:5000 (API at /api/v1)
```

### Step 2: Start Web Application
```powershell
cd apps/web
npm run dev
# Web application available at http://localhost:3000
```

### Step 3: Launch Windows Desktop Experience
```powershell
# In PowerShell:
.\apps\desktop\launch_windows.ps1
```

---

## 6. Testing & Verification

Run the automated integration test suite:
```powershell
powershell -ExecutionPolicy Bypass -File backend/test_server.ps1
```
Tests:
- API Health Status
- Sri Lanka National Grades 1 to 13 verification
- Available Classes catalog query
- Student JWT authentication & profile retrieval
- Enrolled classes listing
- Admin statistics & platform earnings calculation
