# EDU CLICK – Master Development Architecture & Implementation Roadmap

**Project Name**: EDU CLICK  
**Tagline**: *One Platform. Every Device. Every Student.*  
**Target Region**: Sri Lanka (National Curriculum Grade 1–13)  
**Supported Languages**: Sinhala (සිංහල), Tamil (தமிழ்), English  
**Platforms**: Web, Android, iOS, Windows, macOS, Linux  
**Date**: November 2026  

---

## 1. Executive Summary & Workspace Audit Findings

An exhaustive audit of the workspace (`c:\Users\Lenovo\Desktop\Edu Click system our`) and system environment was conducted:

| Item Checked | Current Status | Details |
| :--- | :--- | :--- |
| **Workspace Folder** | Initialized Fresh | Currently clean, ready for monorepo scaffolding. |
| **Runtime Environment** | Node.js v24.15.0 & npm 11.12.1 | Modern Node.js LTS/current environment available. |
| **Version Control** | Git 2.52.0 | Git is installed and available. |
| **Database Server** | MySQL Server 8.0 Installed | Binary present at `C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe`. Unified relational DB architecture with full MySQL 8.0 DDL/migrations + robust automatic local development engine when service is offline. |
| **Branding Assets** | Brand Guidelines Defined | Brand colors: Primary `#142B4F`, Secondary `#2563EB`, Accent `#14B8A6`, Background `#F5F7FB`, Cards `#FFFFFF`, Text `#172033`. SVG logos, icons, favicons, splash screens, PDF receipt headers, and certificate assets need to be synthesized. |
| **Existing Codebase** | None (Clean Slate) | Full architecture designed and built end-to-end. |

---

## 2. Monorepo Architecture Blueprint

```
EDU-CLICK/
├── apps/
│   ├── web/                    # React 18 + Vite + Tailwind CSS + i18next + PWA
│   │   ├── public/             # Brand logos, icons, PWA manifest, service worker
│   │   └── src/
│   │       ├── components/     # UI design system, navigation, modal, audio/video
│   │       ├── pages/          # Public, Student, Teacher, Admin portals
│   │       ├── locales/        # en, si, ta translation files
│   │       ├── contexts/       # Auth, Theme, Language, Sync, Notification
│   │       ├── services/       # API clients, offline DB cache
│   │       └── ...
│   ├── mobile/                 # React Native + Expo (Android & iOS)
│   │   ├── assets/             # Mobile icons, splash screen
│   │   ├── src/                # Native navigation, screens, native permissions
│   │   ├── app.json            # Expo config (Android package & iOS bundle ID)
│   │   └── package.json
│   └── desktop/                # Windows/macOS/Linux Desktop Configuration (Tauri + PWA launcher)
│       ├── src-tauri/          # Tauri configuration for native executable
│       └── package.json
├── backend/                    # Node.js + Express + TypeScript + REST API
│   ├── src/
│   │   ├── config/             # DB config, JWT, PayHere, LiveKit, Email/SMS
│   │   ├── controllers/        # Auth, Users, Classes, Enroll, Pay, Exams, Live, etc.
│   │   ├── middleware/         # Auth JWT, RBAC, RateLimit, Upload, AuditLog
│   │   ├── models/             # Relational query models & repositories
│   │   ├── routes/             # Versioned REST endpoints (/api/v1/...)
│   │   ├── services/           # PDF receipt generator, commission, sync, payments
│   │   ├── utils/              # Token rotation, OTP generator, validators
│   │   └── server.ts           # Express app & WebSocket server
│   └── package.json
├── database/
│   ├── schema.sql              # Pure MySQL 8.0 Schema (34+ normalized tables)
│   ├── migrations/             # Timestamped DDL migration scripts
│   └── seeds/                  # Sri Lankan Grade 1-13 subjects, test accounts, mock classes
├── shared/
│   ├── types/                  # TypeScript interfaces (User, Class, Payment, Exam)
│   ├── constants/              # Grade 1-13 lists, subjects, roles, colors
│   └── design-system/          # Tailwind tokens & brand guidelines
└── docs/                       # API docs, deployment guide, store publishing guides
```

---

## 3. Brand Identity Specifications

- **Brand Name**: EDU CLICK
- **Tagline**: *One Platform. Every Device. Every Student.*
- **Palette**:
  - Primary Navy: `#142B4F`
  - Vibrant Blue: `#2563EB`
  - Teal Accent: `#14B8A6`
  - Page Background: `#F5F7FB`
  - Surface White: `#FFFFFF`
  - Text Navy: `#172033`
- **Typography**: Inter / Outfit for English, Noto Sans Sinhala for Sinhala, Noto Sans Tamil for Tamil.
- **Brand Assets**: Professional SVGs for Main Logo, Icon Logo, App Icon, Favicon, Splash Screen, PDF Receipt Header, and Digital Certificate Frame.

---

## 4. 20-Phase Implementation Plan

1. **Phase 1: Environment & Architecture Inspection**
2. **Phase 2: Monorepo & Shared Libraries Scaffolding**
3. **Phase 3: Relational Database Schema (34+ Tables), Migrations & Seeds**
4. **Phase 4: Backend REST API Core & Cross-Device Authentication Engine**
5. **Phase 5: Student, Teacher, and Administrator RBAC System**
6. **Phase 6: Multilingual Engine (Sinhala, Tamil, English)**
7. **Phase 7: Public Landing Page & Grade 1–13 Discovery Portal**
8. **Phase 8: Student Dashboard & Academic Workflow**
9. **Phase 9: Teacher Dashboard, Class & Student Management**
10. **Phase 10: Administrator Central Control Console**
11. **Phase 11: Dual Payment Architecture (PayHere Sandbox + Bank Transfer Verification)**
12. **Phase 12: PDF Receipt Engine & Digital Certificate Generation**
13. **Phase 13: Dual Live Classroom (External Zoom/Meet + Built-in WebRTC Classroom)**
14. **Phase 14: Dynamic Timetable & Conflict Prevention System**
15. **Phase 15: Examination Management (MCQ, Auto-Grading, Essay Submissions)**
16. **Phase 16: Teacher Commission Engine & Attendance Tracking**
17. **Phase 17: Notification System (In-App, Push, Email/SMS simulation)**
18. **Phase 18: Cross-Device Synchronization & Session Management**
19. **Phase 19: Offline Mode & Progressive Web App (PWA) Capabilities**
20. **Phase 20: Mobile (Expo React Native) & Desktop (Tauri/PWA) Packaging and Testing**
