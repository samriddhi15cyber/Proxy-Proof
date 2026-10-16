import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type {
  User,
  Course,
  AttendanceSession,
  AttendanceRecord,
  CorrectionRequest,
  AuditLogEntry,
  NotificationItem,
  InstitutionPolicy,
} from '../src/types/index.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'proxyproof_db.json');

export interface DatabaseSchema {
  users: User[];
  courses: Course[];
  sessions: AttendanceSession[];
  records: AttendanceRecord[];
  corrections: CorrectionRequest[];
  auditLogs: AuditLogEntry[];
  notifications: NotificationItem[];
  policy: InstitutionPolicy;
}

function generateInitialData(): DatabaseSchema {
  const users: User[] = [
    {
      id: 'stu-1',
      name: 'Alex Rivera',
      email: 'alex.rivera@student.university.edu',
      role: 'student',
      studentId: 'VIT2026-CS-084',
      department: 'School of Computer Science & Engineering',
      avatarUrl: '/src/assets/images/avatar_student_alex_1792170549383.jpg',
      enrolledCourseIds: ['course-1', 'course-2', 'course-3'],
    },
    {
      id: 'stu-2',
      name: 'Maya Lin',
      email: 'maya.lin@student.university.edu',
      role: 'student',
      studentId: 'VIT2026-CS-091',
      department: 'School of Computer Science & Engineering',
      enrolledCourseIds: ['course-1', 'course-2'],
    },
    {
      id: 'stu-3',
      name: 'Priya Sharma',
      email: 'priya.sharma@student.university.edu',
      role: 'student',
      studentId: 'VIT2026-CS-112',
      department: 'School of Computer Science & Engineering',
      enrolledCourseIds: ['course-1', 'course-3'],
    },
    {
      id: 'stu-4',
      name: 'Liam Chen',
      email: 'liam.chen@student.university.edu',
      role: 'student',
      studentId: 'VIT2026-CS-134',
      department: 'School of Computer Science & Engineering',
      enrolledCourseIds: ['course-1', 'course-2', 'course-3'],
    },
    {
      id: 'stu-5',
      name: 'Jordan Patel',
      email: 'jordan.patel@student.university.edu',
      role: 'student',
      studentId: 'VIT2026-CS-155',
      department: 'School of Computer Science & Engineering',
      enrolledCourseIds: ['course-2', 'course-3'],
    },
    {
      id: 'tea-1',
      name: 'Dr. Elena Rostova',
      email: 'elena.rostova@faculty.university.edu',
      role: 'teacher',
      facultyId: 'FAC-CS-109',
      department: 'Department of Network Engineering & Security',
      avatarUrl: '/src/assets/images/avatar_faculty_dr_rostova_1792170549265.jpg',
      assignedCourseIds: ['course-1', 'course-3'],
    },
    {
      id: 'tea-2',
      name: 'Prof. David Kim',
      email: 'david.kim@faculty.university.edu',
      role: 'teacher',
      facultyId: 'FAC-CS-204',
      department: 'Department of Computing Systems',
      assignedCourseIds: ['course-2'],
    },
    {
      id: 'adm-1',
      name: 'Dean Marcus Vance',
      email: 'marcus.vance@admin.university.edu',
      role: 'admin',
      department: 'Office of Academic Affairs & Registrar',
      facultyId: 'FAC-ADM-001',
    },
  ];

  const courses: Course[] = [
    {
      id: 'course-1',
      code: 'CSE3002',
      title: 'Distributed Systems & Cloud Architecture',
      section: 'L1+L2',
      instructorId: 'tea-1',
      instructorName: 'Dr. Elena Rostova',
      room: 'SJT-408',
      credits: 4,
      enrolledStudentIds: ['stu-1', 'stu-2', 'stu-3', 'stu-4'],
      totalSessionsHeld: 24,
      schedule: [
        { day: 'Monday', startTime: '09:00', endTime: '10:30' },
        { day: 'Wednesday', startTime: '09:00', endTime: '10:30' },
        { day: 'Friday', startTime: '11:00', endTime: '12:30' },
      ],
    },
    {
      id: 'course-2',
      code: 'CSE2005',
      title: 'Operating Systems & Kernel Architecture',
      section: 'L3+L4',
      instructorId: 'tea-2',
      instructorName: 'Prof. David Kim',
      room: 'TT-212',
      credits: 4,
      enrolledStudentIds: ['stu-1', 'stu-2', 'stu-4', 'stu-5'],
      totalSessionsHeld: 22,
      schedule: [
        { day: 'Tuesday', startTime: '10:00', endTime: '11:30' },
        { day: 'Thursday', startTime: '10:00', endTime: '11:30' },
      ],
    },
    {
      id: 'course-3',
      code: 'CSE4011',
      title: 'Applied Cryptography & Zero-Trust Protocols',
      section: 'L5',
      instructorId: 'tea-1',
      instructorName: 'Dr. Elena Rostova',
      room: 'SJT-514',
      credits: 3,
      enrolledStudentIds: ['stu-1', 'stu-3', 'stu-4', 'stu-5'],
      totalSessionsHeld: 20,
      schedule: [
        { day: 'Monday', startTime: '14:00', endTime: '15:30' },
        { day: 'Thursday', startTime: '14:00', endTime: '15:30' },
      ],
    },
  ];

  const now = Date.now();
  const sessionStarted = new Date(now - 120000).toISOString();
  const sessionExpires = new Date(now + 600000).toISOString();

  const sessions: AttendanceSession[] = [
    {
      id: 'sess-active-1',
      courseId: 'course-1',
      courseCode: 'CSE3002',
      courseTitle: 'Distributed Systems & Cloud Architecture',
      instructorId: 'tea-1',
      instructorName: 'Dr. Elena Rostova',
      room: 'SJT-408',
      startedAt: sessionStarted,
      expiresAt: sessionExpires,
      status: 'active',
      allowedMethods: ['ble', 'qr'],
      minRssiThreshold: -82,
      currentRotatingToken: '7F4A2C91',
      tokenExpiresAt: now + 15000,
      stats: {
        enrolledCount: 4,
        verifiedCount: 2,
        pendingCount: 0,
        needsReviewCount: 1,
        failedCount: 0,
      },
    },
    {
      id: 'sess-past-1',
      courseId: 'course-1',
      courseCode: 'CSE3002',
      courseTitle: 'Distributed Systems & Cloud Architecture',
      instructorId: 'tea-1',
      instructorName: 'Dr. Elena Rostova',
      room: 'SJT-408',
      startedAt: new Date(now - 86400000 * 2).toISOString(),
      expiresAt: new Date(now - 86400000 * 2 + 900000).toISOString(),
      status: 'ended',
      allowedMethods: ['ble', 'qr'],
      minRssiThreshold: -82,
      currentRotatingToken: '3E99A1C2',
      tokenExpiresAt: now - 86400000 * 2 + 900000,
      stats: {
        enrolledCount: 4,
        verifiedCount: 4,
        pendingCount: 0,
        needsReviewCount: 0,
        failedCount: 0,
      },
    },
    {
      id: 'sess-past-2',
      courseId: 'course-2',
      courseCode: 'CSE2005',
      courseTitle: 'Operating Systems & Kernel Architecture',
      instructorId: 'tea-2',
      instructorName: 'Prof. David Kim',
      room: 'TT-212',
      startedAt: new Date(now - 86400000 * 3).toISOString(),
      expiresAt: new Date(now - 86400000 * 3 + 900000).toISOString(),
      status: 'ended',
      allowedMethods: ['ble'],
      minRssiThreshold: -85,
      currentRotatingToken: '9B21FA33',
      tokenExpiresAt: now - 86400000 * 3 + 900000,
      stats: {
        enrolledCount: 4,
        verifiedCount: 3,
        pendingCount: 0,
        needsReviewCount: 0,
        failedCount: 1,
      },
    },
  ];

  const records: AttendanceRecord[] = [
    // Live session records
    {
      id: 'rec-live-1',
      sessionId: 'sess-active-1',
      courseId: 'course-1',
      courseCode: 'CSE3002',
      studentId: 'stu-2',
      studentName: 'Maya Lin',
      timestamp: new Date(now - 90000).toISOString(),
      method: 'ble',
      status: 'verified',
      rssi: -62,
      deviceFingerprint: 'SM-G998B-ANDROID-14',
    },
    {
      id: 'rec-live-2',
      sessionId: 'sess-active-1',
      courseId: 'course-1',
      courseCode: 'CSE3002',
      studentId: 'stu-4',
      studentName: 'Liam Chen',
      timestamp: new Date(now - 45000).toISOString(),
      method: 'ble',
      status: 'verified',
      rssi: -71,
      deviceFingerprint: 'PIXEL-7-PRO',
    },
    {
      id: 'rec-live-3',
      sessionId: 'sess-active-1',
      courseId: 'course-1',
      courseCode: 'CSE3002',
      studentId: 'stu-3',
      studentName: 'Priya Sharma',
      timestamp: new Date(now - 25000).toISOString(),
      method: 'qr',
      status: 'needs_review',
      failureReason: 'Weak BLE signal (-92 dBm, exceeds threshold -82 dBm). Switched to QR fallback from hallway perimeter.',
      rssi: -92,
      deviceFingerprint: 'IPHONE15-PRO',
    },
    // Historical records for Alex Rivera (stu-1)
    {
      id: 'rec-hist-1',
      sessionId: 'sess-past-1',
      courseId: 'course-1',
      courseCode: 'CSE3002',
      studentId: 'stu-1',
      studentName: 'Alex Rivera',
      timestamp: new Date(now - 86400000 * 2 + 120000).toISOString(),
      method: 'ble',
      status: 'verified',
      rssi: -65,
    },
    {
      id: 'rec-hist-2',
      sessionId: 'sess-past-2',
      courseId: 'course-2',
      courseCode: 'CSE2005',
      studentId: 'stu-1',
      studentName: 'Alex Rivera',
      timestamp: new Date(now - 86400000 * 3 + 150000).toISOString(),
      method: 'ble',
      status: 'verified',
      rssi: -72,
    },
    // Past attendance aggregates for Alex Rivera (stu-1) across courses:
    // Course-1: 21 attended out of 24 (87.5%)
    // Course-2: 17 attended out of 22 (77.3%)
    // Course-3: 14 attended out of 20 (70.0% -> Low Attendance Alert!)
  ];

  // Populate realistic historical records for accurate statistics
  // CSE3002 (Course 1)
  for (let i = 4; i <= 24; i++) {
    const isAttended = i !== 8 && i !== 15 && i !== 22; // 21/24 attended
    if (isAttended) {
      records.push({
        id: `rec-c1-${i}`,
        sessionId: `sess-c1-hist-${i}`,
        courseId: 'course-1',
        courseCode: 'CSE3002',
        studentId: 'stu-1',
        studentName: 'Alex Rivera',
        timestamp: new Date(now - 86400000 * i).toISOString(),
        method: i % 4 === 0 ? 'qr' : 'ble',
        status: 'verified',
        rssi: -60 - (i % 20),
      });
    }
  }

  // CSE2005 (Course 2)
  for (let i = 4; i <= 22; i++) {
    const isAttended = i !== 6 && i !== 11 && i !== 16 && i !== 19 && i !== 21; // 17/22 attended
    if (isAttended) {
      records.push({
        id: `rec-c2-${i}`,
        sessionId: `sess-c2-hist-${i}`,
        courseId: 'course-2',
        courseCode: 'CSE2005',
        studentId: 'stu-1',
        studentName: 'Alex Rivera',
        timestamp: new Date(now - 86400000 * i).toISOString(),
        method: 'ble',
        status: 'verified',
        rssi: -68,
      });
    }
  }

  // CSE4011 (Course 3) - 14/20 attended (70%)
  for (let i = 2; i <= 20; i++) {
    const isAttended = ![3, 7, 10, 13, 17, 19].includes(i);
    if (isAttended) {
      records.push({
        id: `rec-c3-${i}`,
        sessionId: `sess-c3-hist-${i}`,
        courseId: 'course-3',
        courseCode: 'CSE4011',
        studentId: 'stu-1',
        studentName: 'Alex Rivera',
        timestamp: new Date(now - 86400000 * i).toISOString(),
        method: 'ble',
        status: 'verified',
        rssi: -74,
      });
    }
  }

  const corrections: CorrectionRequest[] = [
    {
      id: 'corr-1',
      studentId: 'stu-1',
      studentName: 'Alex Rivera',
      courseId: 'course-3',
      courseCode: 'CSE4011',
      sessionDate: new Date(now - 86400000 * 7).toISOString().split('T')[0],
      requestedStatus: 'excused',
      currentStatus: 'failed',
      reason: 'Represented university at ACM Inter-College Hackathon Finals. Official permission letter attached.',
      documentationUrl: 'https://acm.univ.edu/delegation-excusal-2026.pdf',
      status: 'pending',
      submittedAt: new Date(now - 86400000 * 2).toISOString(),
    },
    {
      id: 'corr-2',
      studentId: 'stu-3',
      studentName: 'Priya Sharma',
      courseId: 'course-1',
      courseCode: 'CSE3002',
      sessionDate: new Date(now - 86400000 * 5).toISOString().split('T')[0],
      requestedStatus: 'verified',
      currentStatus: 'needs_review',
      reason: 'Bluetooth radio suffered driver freeze on Fedora Linux laptop during scan window; was physically in Row 4.',
      status: 'approved',
      submittedAt: new Date(now - 86400000 * 4).toISOString(),
      reviewedBy: 'Dr. Elena Rostova',
      reviewedAt: new Date(now - 86400000 * 3).toISOString(),
      reviewComment: 'Verified with lab logbook seating chart.',
    },
  ];

  const auditLogs: AuditLogEntry[] = [
    {
      id: 'aud-1',
      timestamp: new Date(now - 120000).toISOString(),
      actorId: 'tea-1',
      actorName: 'Dr. Elena Rostova',
      actorRole: 'teacher',
      action: 'SESSION_STARTED',
      targetType: 'session',
      targetId: 'sess-active-1',
      details: 'Started attendance session for CSE3002 in SJT-408 with BLE & QR rotating token validation.',
      ipAddress: '192.168.4.112',
    },
    {
      id: 'aud-2',
      timestamp: new Date(now - 86400000 * 3).toISOString(),
      actorId: 'tea-1',
      actorName: 'Dr. Elena Rostova',
      actorRole: 'teacher',
      action: 'ATTENDANCE_CORRECTION_APPROVED',
      targetType: 'correction',
      targetId: 'corr-2',
      details: 'Approved attendance correction for Priya Sharma (CSE3002, 5 days ago) to Verified.',
      ipAddress: '192.168.4.112',
    },
    {
      id: 'aud-3',
      timestamp: new Date(now - 86400000 * 10).toISOString(),
      actorId: 'adm-1',
      actorName: 'Dean Marcus Vance',
      actorRole: 'admin',
      action: 'POLICY_UPDATED',
      targetType: 'policy',
      targetId: 'policy-default',
      details: 'Enforced university-wide minimum threshold at 75% with 15s rotating token policy.',
      ipAddress: '10.0.1.5',
    },
  ];

  const notifications: NotificationItem[] = [
    {
      id: 'notif-1',
      userId: 'stu-1',
      title: 'Active Attendance Session Nearby',
      message: 'Dr. Elena Rostova has opened attendance for CSE3002 in SJT-408. Scan via BLE or QR before expiry.',
      type: 'session_active',
      read: false,
      createdAt: new Date(now - 100000).toISOString(),
      linkAction: 'join_session',
    },
    {
      id: 'notif-2',
      userId: 'stu-1',
      title: 'Low Attendance Alert: CSE4011',
      message: 'Your current attendance is 70.0% (below 75% institutional requirement). You need 4 consecutive classes to restore compliance.',
      type: 'warning',
      read: false,
      createdAt: new Date(now - 86400000).toISOString(),
      linkAction: 'view_health',
    },
    {
      id: 'notif-3',
      userId: 'stu-1',
      title: 'Correction Request Under Review',
      message: 'Your duty-leave excuse request for CSE4011 (Hackathon Finals) has been queued for faculty review.',
      type: 'correction_update',
      read: true,
      createdAt: new Date(now - 86400000 * 2).toISOString(),
    },
  ];

  const policy: InstitutionPolicy = {
    minimumAttendanceThreshold: 75,
    criticalWarningThreshold: 65,
    allowQrFallback: true,
    defaultRssiThreshold: -82,
    tokenRotationIntervalSeconds: 15,
    allowStudentCorrectionRequests: true,
    institutionName: 'Vellore Institute of Technology',
    termName: 'Fall Semester 2026',
  };

  return {
    users,
    courses,
    sessions,
    records,
    corrections,
    auditLogs,
    notifications,
    policy,
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
    // Start automatic token rotator for active sessions every 15s
    setInterval(() => this.rotateActiveSessionTokens(), 15000);
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('[DB] Failed reading db file, regenerating initial state:', err);
    }
    const initial = generateInitialData();
    this.save(initial);
    return initial;
  }

  private save(dataToSave?: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave || this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Failed to save database:', err);
    }
  }

  private rotateActiveSessionTokens() {
    let changed = false;
    const now = Date.now();
    for (const s of this.data.sessions) {
      if (s.status === 'active') {
        if (new Date(s.expiresAt).getTime() <= now) {
          s.status = 'ended';
          changed = true;
        } else {
          // Generate new 8-char crypto hex token
          s.currentRotatingToken = crypto.randomBytes(4).toString('hex').toUpperCase();
          s.tokenExpiresAt = now + (this.data.policy.tokenRotationIntervalSeconds * 1000);
          changed = true;
        }
      }
    }
    if (changed) {
      this.save();
    }
  }

  // --- Read Methods ---
  getUsers(): User[] {
    return this.data.users;
  }

  getUser(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  getCourses(): Course[] {
    return this.data.courses;
  }

  getCourse(id: string): Course | undefined {
    return this.data.courses.find(c => c.id === id);
  }

  getSessions(): AttendanceSession[] {
    return this.data.sessions;
  }

  getSession(id: string): AttendanceSession | undefined {
    return this.data.sessions.find(s => s.id === id);
  }

  getRecords(): AttendanceRecord[] {
    return this.data.records;
  }

  getCorrections(): CorrectionRequest[] {
    return this.data.corrections;
  }

  getAuditLogs(): AuditLogEntry[] {
    return this.data.auditLogs;
  }

  getNotifications(userId: string): NotificationItem[] {
    return this.data.notifications.filter(n => n.userId === userId);
  }

  getPolicy(): InstitutionPolicy {
    return this.data.policy;
  }

  // --- Write Methods ---
  createSession(sessionData: Omit<AttendanceSession, 'id' | 'currentRotatingToken' | 'tokenExpiresAt' | 'stats'>): AttendanceSession {
    const now = Date.now();
    const token = crypto.randomBytes(4).toString('hex').toUpperCase();
    const course = this.getCourse(sessionData.courseId);
    const enrolledCount = course?.enrolledStudentIds?.length || 0;

    const newSession: AttendanceSession = {
      ...sessionData,
      id: `sess-${Date.now()}`,
      currentRotatingToken: token,
      tokenExpiresAt: now + (this.data.policy.tokenRotationIntervalSeconds * 1000),
      stats: {
        enrolledCount,
        verifiedCount: 0,
        pendingCount: 0,
        needsReviewCount: 0,
        failedCount: 0,
      },
    };

    this.data.sessions.unshift(newSession);
    this.save();
    return newSession;
  }

  updateSessionStatus(sessionId: string, status: 'active' | 'paused' | 'ended', durationMinutesExtend?: number): AttendanceSession | null {
    const session = this.getSession(sessionId);
    if (!session) return null;

    session.status = status;
    if (durationMinutesExtend && durationMinutesExtend > 0) {
      const currentExpiry = new Date(session.expiresAt).getTime();
      session.expiresAt = new Date(currentExpiry + durationMinutesExtend * 60000).toISOString();
    }
    this.save();
    return session;
  }

  addAttendanceRecord(record: Omit<AttendanceRecord, 'id' | 'timestamp'>): AttendanceRecord {
    const newRecord: AttendanceRecord = {
      ...record,
      id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };

    // Check if session stats need update
    const session = this.getSession(record.sessionId);
    if (session) {
      if (newRecord.status === 'verified') session.stats.verifiedCount++;
      else if (newRecord.status === 'needs_review') session.stats.needsReviewCount++;
      else if (newRecord.status === 'failed') session.stats.failedCount++;
      else session.stats.pendingCount++;
    }

    this.data.records.unshift(newRecord);
    this.save();
    return newRecord;
  }

  addCorrectionRequest(req: Omit<CorrectionRequest, 'id' | 'submittedAt' | 'status'>): CorrectionRequest {
    const newReq: CorrectionRequest = {
      ...req,
      id: `corr-${Date.now()}`,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    this.data.corrections.unshift(newReq);
    this.save();
    return newReq;
  }

  reviewCorrectionRequest(reqId: string, status: 'approved' | 'rejected', reviewerName: string, comment?: string): CorrectionRequest | null {
    const req = this.data.corrections.find(c => c.id === reqId);
    if (!req) return null;

    req.status = status;
    req.reviewedBy = reviewerName;
    req.reviewedAt = new Date().toISOString();
    req.reviewComment = comment;

    if (status === 'approved') {
      // Find matching attendance record or create one
      const existing = this.data.records.find(
        r => r.courseId === req.courseId && r.studentId === req.studentId && r.timestamp.startsWith(req.sessionDate)
      );
      if (existing) {
        existing.status = req.requestedStatus;
        existing.reviewedBy = reviewerName;
        existing.reviewedAt = req.reviewedAt;
        existing.reviewNote = `Correction approved: ${req.reason}`;
      } else {
        this.addAttendanceRecord({
          sessionId: req.sessionId || 'manual-correction-session',
          courseId: req.courseId,
          courseCode: req.courseCode,
          studentId: req.studentId,
          studentName: req.studentName,
          method: 'manual_override',
          status: req.requestedStatus,
          reviewNote: `Approved correction: ${req.reason}`,
        });
      }
    }

    this.save();
    return req;
  }

  addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) {
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    this.data.auditLogs.unshift(newEntry);
    this.save();
  }

  updatePolicy(newPolicy: Partial<InstitutionPolicy>): InstitutionPolicy {
    this.data.policy = { ...this.data.policy, ...newPolicy };
    this.save();
    return this.data.policy;
  }

  resetToDemo() {
    this.data = generateInitialData();
    this.save();
    return this.data;
  }
}

export const db = new Database();
