# ProxyProof — Native Android BLE Attendance System

A native Kotlin application built with **Jetpack Compose**, **Material 3**, and **Android Bluetooth Low Energy (BLE)** APIs for secure classroom attendance verification with cryptographic rotating salts, QR fallback, and Firebase integration.

---

## 🏛️ University Editorial Architecture

- **Visual Identity:** Warm Parchment (`#F6F1E8`), Clean Cream (`#FFFCF7`), Deep Burgundy (`#722F3E`), Muted Antique Gold (`#C2A46D`), Charcoal text (`#292723`), and Subtle Borders (`#E4DCD0`).
- **Typography:** Balanced DM Sans with comfortable line-heights and restrained weights (500/600 for headings and large figures, 400 body, 500 actions).
- **Architecture:** Clean MVVM with Android Architecture Components (Jetpack Compose, StateFlow, Coroutines, Navigation Compose, Repositories).
- **Hardware BLE:**
  - **Faculty (Broadcaster):** `BluetoothLeAdvertiser` broadcasts proprietary Service UUID `4E70-0001-B5A3-F393-E0A9-E50E24DCCA9E` with **15-second rotating cryptographic salts** to prevent proxy relays and photo sharing.
  - **Student (Scanner):** `BluetoothLeScanner` detects beacon, measures physical RSSI signal strength (-75 dBm threshold for indoor classroom perimeter), and verifies authenticity.

---

## 📱 Included Screens (12 Native Jetpack Compose Screens)

1. **Welcome Screen (`WelcomeScreen.kt`):** University crest, sign-in routing, institutional badge, and demo sandbox launcher.
2. **Student Registration (`StudentRegisterScreen.kt`):** Enrol matriculation ID, department, email, and password.
3. **Student Sign-In (`StudentSignInScreen.kt`):** Genuine email/password authentication.
4. **Teacher Sign-In (`TeacherSignInScreen.kt`):** Instructor credentials and faculty verification.
5. **Student Dashboard (`StudentDashboardScreen.kt`):** Personalised greeting, today's schedule, attendance standing percentage, sessions attended, active lecture banner, and recent logs.
6. **Teacher Dashboard (`TeacherDashboardScreen.kt`):** Session controls (Start/End attendance window), real-time student register, review queue, and CSV roster export.
7. **Course & Timetable (`CourseTimetableScreen.kt`):** Complete registered course list, room locations, credit hours, and schedule times.
8. **BLE Verification (`BleVerificationScreen.kt`):** Native Android BLE scanner, hardware RSSI confidence meter, rotating token validation, and duplicate prevention.
9. **QR Fallback Verification (`QrFallbackScreen.kt`):** Dynamic podium screen QR code & token verification for devices with BLE hardware constraints.
10. **Attendance History (`AttendanceHistoryScreen.kt`):** Official attendance ledger with method telemetry and attendance correction appeal modal.
11. **Attendance Reports (`AttendanceReportsScreen.kt`):** Institutional analytics, integrity distribution (verified vs flagged), and CSV export.
12. **Profile & Settings (`ProfileSettingsScreen.kt`):** User academic profile, BLE hardware diagnostic telemetry, and secure sign-out.

---

## 🛠️ How to Open and Build in Android Studio

### 1. Download or Extract the Project
You can download the ready-to-build ZIP directly from the ProxyProof web application dashboard or package the `android/` directory:
```bash
python3 -m zipfile -c ProxyProof-Android.zip android/
```

### 2. Open in Android Studio
1. Launch **Android Studio** (Hedgehog, Iguana, or Koala).
2. Click **Open** and select the `android/` directory.
3. Wait for Gradle sync to complete. Gradle will download dependencies (Compose BOM, Material 3, Navigation, Coroutines, Firebase).

### 3. Connect Firebase (Optional for Cloud Persistence)
The app includes a fully functioning **Collegiate Sandbox / Demo Mode** that works out of the box with zero external configuration! If you wish to connect your own Firebase project:
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Create a project and add an **Android App** with package name:
   `edu.university.proxyproof`
3. Download `google-services.json` and place it in the `android/app/` folder.
4. In `android/app/build.gradle.kts`, activate the plugin:
   ```kotlin
   id("com.google.gms.google-services")
   ```
5. Enable **Email/Password Authentication** and **Cloud Firestore** in your Firebase console.

### 4. Build the Installable APK
Run the Gradle assemble task via terminal or Android Studio:
```bash
./gradlew assembleDebug
```
The compiled, installable APK will be generated at:
`app/build/outputs/apk/debug/app-debug.apk`

### 5. Install on an Android Phone
Connect your phone via USB with **USB Debugging** enabled, then run:
```bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
```
Or simply drag and drop the `.apk` file onto your device or emulator.
