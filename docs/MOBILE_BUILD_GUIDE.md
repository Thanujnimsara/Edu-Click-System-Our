# EDU CLICK – Mobile Application Build Guide (Android & iOS)

This guide documents the procedures for compiling and publishing the EDU CLICK mobile application for Google Play Store (Android) and Apple App Store (iOS) using **React Native and Expo Application Services (EAS)**.

---

## 1. Prerequisites
- Node.js v18+ & npm
- Expo CLI: `npm install -g expo-cli eas-cli`
- An active Expo Account (`https://expo.dev`)
- Google Play Console Developer Account (for Android publishing)
- Apple Developer Program Account (for iOS App Store publishing)

---

## 2. Configuration & App Identifiers

The mobile application is configured in `apps/mobile/app.json`:
- **Application Name**: EDU CLICK
- **Android Package**: `lk.educlick.lms`
- **iOS Bundle Identifier**: `lk.educlick.lms`
- **Brand Colors**: `#142B4F` (Primary), `#2563EB` (Secondary), `#14B8A6` (Accent)

---

## 3. Local Development & Testing

1. Navigate to the mobile app directory:
   ```bash
   cd apps/mobile
   npm install
   ```

2. Start the Expo development server:
   ```bash
   npm start
   ```

3. Run on Android Emulator:
   ```bash
   npm run android
   ```

4. Run on iOS Simulator (macOS):
   ```bash
   npm run ios
   ```

---

## 4. Building Production Artifacts with EAS

Log in to your Expo account:
```bash
eas login
```

### A. Android Build (APK & AAB)
- **Standalone Android APK (For Testing & Sideloading)**:
  ```bash
  eas build -p android --profile preview
  ```
  Produces a signed `.apk` file that can be installed directly on Android smartphones and tablets.

- **Android App Bundle (.aab for Google Play Store)**:
  ```bash
  eas build -p android --profile production
  ```
  Upload the generated `.aab` to **Google Play Console** under Production or Closed Testing track.

### B. iOS Build (IPA for Apple App Store & TestFlight)
- **TestFlight & App Store IPA**:
  ```bash
  eas build -p ios --profile production
  ```
  EAS automatically manages distribution certificates and provisioning profiles. The build can be submitted directly to TestFlight via:
  ```bash
  eas submit -p ios
  ```

---

## 5. Hardware Permissions
The app is configured to request permissions only when the student or teacher engages the respective feature:
- `CAMERA`: For WebRTC live video classes and bank slip photo capture.
- `RECORD_AUDIO`: For interactive microphone discussions during classes.
- `POST_NOTIFICATIONS`: For class schedule reminders and exam results.
