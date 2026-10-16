/**
 * Core Domain Types for ProxyProof Smart Attendance Platform
 */

export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  studentId?: string; // e.g. "VIT2026-CS-084"
  facultyId?: string; // e.g. "FAC-CS-109"
  department: string;
  enrolledCourseIds?: string[];
  assignedCourseIds?: string[];
}

export type VerificationMethod = 'ble' | 'qr' | 'manual_override';

export type VerificationStatus = 'verified' | 'pending' | 'needs_review' | 'failed' | 'excused';

export interface Course {
  id: string;
  code: string; // e.g. "CSE3002"
  title: string; // e.g. "Distributed Systems & Cloud Computing"
  section: string; // e.g. "L1 + L2"
  instructorId: string;
  instructorName: string;
  room: string; // e.g. "SJT-408"
  credits: number;
  enrolledStudentIds: string[];
  totalSessionsHeld: number;
  schedule: {
    day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
    startTime: string; // "09:00"
    endTime: string; // "10:30"
  }[];
}

export interface AttendanceSession {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  instructorId: string;
  instructorName: string;
  room: string;
  startedAt: string; // ISO string
  expiresAt: string; // ISO string
  status: 'active' | 'paused' | 'ended';
  allowedMethods: ('ble' | 'qr')[];
  minRssiThreshold: number; // e.g. -85 dBm
  currentRotatingToken: string; // e.g. "8F2B7A1C"
  tokenExpiresAt: number; // unix timestamp ms
  stats: {
    enrolledCount: number;
    verifiedCount: number;
    pendingCount: number;
    needsReviewCount: number;
    failedCount: number;
  };
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  courseId: string;
  courseCode: string;
  studentId: string;
  studentName: string;
  timestamp: string; // ISO string
  method: VerificationMethod;
  status: VerificationStatus;
  rssi?: number; // dBm e.g. -68
  deviceFingerprint?: string;
  failureReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNote?: string;
  isSimulated?: boolean;
}

export interface CorrectionRequest {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseCode: string;
  sessionId?: string;
  sessionDate: string;
  requestedStatus: 'verified' | 'excused';
  currentStatus: VerificationStatus;
  reason: string;
  documentationUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewComment?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string; // e.g. "ATTENDANCE_MANUAL_OVERRIDE", "SESSION_STARTED", "POLICY_UPDATED"
  targetType: 'session' | 'record' | 'correction' | 'course' | 'policy' | 'user';
  targetId: string;
  details: string;
  ipAddress?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'session_active' | 'warning' | 'success' | 'correction_update' | 'announcement';
  read: boolean;
  createdAt: string;
  linkAction?: string;
}

export interface InstitutionPolicy {
  minimumAttendanceThreshold: number; // e.g. 75 (%)
  criticalWarningThreshold: number; // e.g. 65 (%)
  allowQrFallback: boolean;
  defaultRssiThreshold: number; // e.g. -82 dBm
  tokenRotationIntervalSeconds: number; // e.g. 15 s
  allowStudentCorrectionRequests: boolean;
  institutionName: string;
  termName: string;
}

export interface AiAttendanceAnalysis {
  overallRiskLevel: 'low' | 'moderate' | 'elevated';
  summary: string;
  suspiciousPatterns: {
    flag: string;
    description: string;
    evidence: string;
    affectedCount: number;
    recommendedAction: string;
  }[];
  chronicLowAttendanceStudents: {
    studentId: string;
    studentName: string;
    courseCode: string;
    attendanceRate: number;
    missedSessions: number;
    recommendedIntervention: string;
  }[];
  courseAbsenceTrends: {
    courseCode: string;
    averageAttendance: number;
    trend: 'improving' | 'declining' | 'stable';
    note: string;
  }[];
  generatedAt: string;
  source: 'gemini-3.8-flash' | 'deterministic-analytics-engine';
}
