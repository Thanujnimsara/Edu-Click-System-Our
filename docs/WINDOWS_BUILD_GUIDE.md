# EDU CLICK – Windows Desktop Application & PWA Build Guide

The EDU CLICK platform delivers a commercial-quality, native desktop experience for **Windows 10 and Windows 11** computers through two deployment architectures:
1. **Dedicated Native Windows Executable (.msi / .exe)** built via **Tauri & Rust**.
2. **Installable Windows Progressive Web App (PWA)** with native window controls, desktop shortcut, offline cache, and Action Center notifications.

---

## 1. Native Windows Desktop Application (Tauri)

### Architecture
The native desktop layer resides in `apps/desktop/src-tauri/` and connects directly to the production web bundle (`apps/web/dist`) and the centralized backend API (`http://localhost:5000/api/v1`):
- **Window Management**: Configured in `tauri.conf.json` with 1280x820 default dimensions, minimum 980x640, centered, and resizable.
- **Native Rust Commands (`apps/desktop/src-tauri/src/main.rs`)**:
  - `get_system_info`: Inspects the Windows computer name, 64-bit OS version, and app version to register the session in the centralized backend (`/auth/devices`).
  - `send_desktop_notification`: Triggers native Windows Action Center banner notifications with sound and the official EDU CLICK icon.
  - `toggle_live_fullscreen`: Toggles borderless fullscreen mode for high-definition live classes.
  - `save_file_to_desktop`: Saves electronic PDF receipts, question papers, and certificates directly into the user's `Downloads` folder (`$env:USERPROFILE\Downloads`).

### Prerequisites
- Node.js v18+ & npm
- Rust & Cargo (`https://rustup.rs`)
- Visual Studio 2022 C++ Build Tools (Desktop development with C++ workload)

### Compilation Steps
1. Build the production frontend:
   ```powershell
   cd apps/web
   npm run build
   ```
2. Build the Tauri native installer:
   ```powershell
   cd apps/desktop
   cargo tauri build
   ```
   The installer packages will be output to:
   - MSI Installer: `apps/desktop/src-tauri/target/release/bundle/msi/EDU CLICK_4.0.0_x64_en-US.msi`
   - NSIS Executable: `apps/desktop/src-tauri/target/release/bundle/nsis/EDU CLICK_4.0.0_x64-setup.exe`

---

## 2. Windows Progressive Web App (PWA)

The web frontend includes a Windows-optimized Web App Manifest (`apps/web/public/manifest.json`) and service worker (`apps/web/public/sw.js`).

### Windows Features
- **Window Controls Overlay**: Operates as a standalone window without browser address bars or navigation clutter.
- **Taskbar Shortcuts**:
  - Live Classroom (`/dashboard/student?tab=live`)
  - My Timetable (`/timetable`)
  - Online Exams (`/exams`)
  - Course Catalog (`/classes`)
- **Offline Cache**: Automatically caches the application shell, timetable, and receipts for offline review.
- **Web Notifications**: Uses standard Notification API integrated into the Windows 10/11 Notification Center.
- **Windows Install Banner**: Automatically prompts Windows users with an "Install on Windows" button.

### How to Install via Browser
1. Open Microsoft Edge or Google Chrome.
2. Navigate to `http://localhost:3000`.
3. Click the **Install EDU CLICK** button on the top banner, or click the **App Available** icon in the address bar.
4. EDU CLICK will install as a standalone app and appear in the Windows Start Menu, Taskbar, and Apps list.

---

## 3. One-Click Windows Desktop Launcher (`launch_windows.ps1`)

To test or launch the desktop application on any Windows computer:
```powershell
cd "c:\Users\Lenovo\Desktop\Edu Click system our\apps\desktop"
.\launch_windows.ps1
```

### What the Launcher Does:
1. **Verifies Backend Service**: Checks if `http://localhost:5000/api/v1/health` is responsive; if offline, automatically launches the centralized Node.js backend.
2. **Verifies Web Server**: Checks if `http://localhost:3000` is active; if offline, starts the web frontend.
3. **Creates Windows Desktop Shortcut**: Creates a shortcut named `EDU CLICK LMS.lnk` on the user's Windows Desktop with the official brand icon.
4. **Launches App Window**: Launches Microsoft Edge or Chrome in dedicated application window mode (`--app=http://localhost:3000` with isolated profile in `%LOCALAPPDATA%\EDU_CLICK_Desktop`).

---

## 4. Cross-Device Synchronization on Windows

When logging in from the Windows Desktop App or PWA:
- The device registers in `user_sessions` with platform `WINDOWS` and device name e.g. `DESKTOP-XXX (EDU CLICK Desktop)`.
- Enrolled classes, timetable, exam countdowns, receipts, and language settings (Sinhala, Tamil, English) remain completely synchronized with any companion Android or iOS phone.
- The student can revoke the Windows session remotely from their mobile phone or sign out directly.
