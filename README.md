# ProxyProof — AI-Powered Smart Attendance & Anti-Proxy Platform

**ProxyProof** is an enterprise-grade collegiate attendance management platform engineered to eliminate proxy attendance, verify classroom physical presence with Bluetooth Low Energy (BLE) proximity gating, provide dynamic rotating QR fallback, forecast student attendance health with transparent mathematical modeling, and synthesize non-punitive academic intervention insights using Google Gemini AI.

---

## Key Features

1. **Role-Based Access Control (RBAC)**:
   - **Student**: View enrolled courses, attendance percentage, mathematical safe-to-miss forecast, join active BLE/QR sessions, submit duty-leave/medical correction appeals with document links.
   - **Faculty / Teacher**: Launch attendance sessions with custom RSSI thresholds, broadcast rotating BLE beacon tokens, monitor live classroom attendance in real-time with auto-updating QR codes, review correction appeals, and export official RFC 4180 CSV reports.
   - **College Administrator**: College-wide attendance health overview, institutional policy editor (thresholds, rotation intervals), and append-only immutable security audit ledger.

2. **Smart Bluetooth Low Energy (BLE) Proximity & Anti-Replay Security**:
   - 15-second rotating cryptographic salts defeat screenshot and token-forwarding attacks.
   - Multi-sample RSSI telemetry (near: -40 to -75 dBm, perimeter review: < -82 dBm).
   - Real browser hardware diagnostic probe (`navigator.bluetooth`) with clear technical separation between Web Bluetooth client capabilities and native Android BLE peripheral broadcasting.

3. **Dynamic Secure QR Fallback**:
   - Dynamic SVG/PNG QR generated on the fly via `qrcode` that auto-rotates with the server salt.
   - Binds strictly to active session and enrolled course roster.

4. **Transparent Attendance Health Forecaster**:
   - Exact mathematical calculation of how many future classes may safely be missed while staying above institutional policy (e.g. 75%).
   - Calculates consecutive attended classes required to recover from low-attendance warnings.

5. **AI Attendance Intelligence**:
   - Server-side Gemini AI (`gemini-3.8-flash`) synthesizes suspicious attendance telemetry, perimeter anomalies, and chronic absence risks into empathetic, non-punitive student support recommendations.
   - Deterministic analytics engine fallback ensures 100% uptime even without external API credentials.

6. **Interactive Demo Mode**:
   - Visibly labeled simulated environment with pre-seeded collegiate rosters:
     - **Student**: Alex Rivera (`VIT2026-CS-084`)
     - **Faculty**: Dr. Elena Rostova (`FAC-CS-109`)
     - **Administrator**: Dean Marcus Vance (`FAC-ADM-001`)
   - One-click instant persona switching and sandbox data reset.

---

## Quick Start & Verification

### 1. Install & Build
```bash
npm install
npm run build
```

### 2. Run the Full-Stack Server
```bash
npm run dev
# Server boots on http://localhost:3000 with Express API + Vite client
```

### 3. Testing Workflows in Demo Mode
- **Test Student Check-in**:
  1. Default persona is Student (**Alex Rivera**). Notice the active banner for `CSE3002: Distributed Systems` in `SJT-408`.
  2. Click **Verify Presence via BLE / QR**.
  3. Click **Scan BLE Proximity** to trigger the 3-sample RSSI telemetry radar.
  4. Click **Submit Verification**. Presence is officially recorded with -68 dBm signal telemetry.
- **Test Live Classroom Monitoring**:
  1. In the top bar, switch persona to **Faculty (Dr. Elena)**.
  2. Click **Open Live Classroom Monitor** on the active session.
  3. Watch the 15-second countdown ring and dynamic QR code refresh automatically!
  4. View live attendees, check RSSI values, and test manual overrides.
- **Test Attendance Appeals & Audit Ledger**:
  1. In Student view, click **Request Correction** and submit an appeal for `CSE4011`.
  2. Switch to Faculty view to review and click **Approve**.
  3. Switch to Administrator view to inspect the immutable **Security & Attendance Audit Ledger**.
- **Test AI Intelligence**:
  1. Click **AI Intelligence** in the navbar to inspect proxy radar anomalies, chronic low-attendance student warnings, and course attendance trajectories.

---

## Deliverables & Architecture Files

- `server.ts`: Express full-stack backend with rotating crypto tokens, BLE validation, and Gemini AI.
- `server/db.ts`: In-memory & file-persisted collegiate dataset.
- `src/components/`: Modular React components adhering to high-density SaaS dashboard standards.
- `firestore.rules`: Production Firebase Firestore security rules enforcing RBAC and append-only audit ledgers.
- `firebase-blueprint.json`: Cloud Firestore schema definition.
- `android-ble-architecture.md`: Complete Android Kotlin BLE architecture guide.
