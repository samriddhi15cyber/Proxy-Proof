import type {
  User,
  Course,
  AttendanceSession,
  AttendanceRecord,
  CorrectionRequest,
  AuditLogEntry,
  InstitutionPolicy,
  AiAttendanceAnalysis,
} from '../types/index.ts';

const API_BASE = '/api';

export async function fetchWithAuth(url: string, options: RequestInit = {}, retries = 2): Promise<any> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers,
    });
  } catch (err: any) {
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, 600));
      return fetchWithAuth(url, options, retries - 1);
    }
    throw new Error(`Network failure connecting to ${url}: ${err.message}`);
  }

  const rawText = await res.text();
  const trimmed = rawText.trim();

  // If response is HTML (such as server warmup or fallback), safely retry or return friendly error
  if (trimmed.startsWith('<') || trimmed.toLowerCase().startsWith('<!doctype')) {
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, 800));
      return fetchWithAuth(url, options, retries - 1);
    }
    throw new Error(`Server temporarily initializing for ${url}. Please refresh in a moment.`);
  }

  let data: any;
  try {
    data = JSON.parse(trimmed);
  } catch {
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, 600));
      return fetchWithAuth(url, options, retries - 1);
    }
    throw new Error(`Non-JSON response received from ${url}`);
  }

  if (!res.ok) {
    throw new Error(data?.error || `HTTP ${res.status}: ${res.statusText}`);
  }

  return data;
}

export const api = {
  // Auth & Personas
  async getAuthMe(): Promise<{ user: User; availablePersonas: any[] }> {
    return fetchWithAuth('/auth/me');
  },

  async switchPersona(userId: string): Promise<{ success: boolean; user: User }> {
    return fetchWithAuth('/auth/switch-persona', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },

  // Courses & Timetable
  async getCourses(): Promise<Course[]> {
    return fetchWithAuth('/courses');
  },

  async getTimetable(): Promise<{ timetable: any[]; conflicts: any[] }> {
    return fetchWithAuth('/timetable');
  },

  // Sessions
  async getActiveSessions(): Promise<AttendanceSession[]> {
    return fetchWithAuth('/sessions/active');
  },

  async getSession(id: string): Promise<{ session: AttendanceSession; records: AttendanceRecord[]; stats: any }> {
    return fetchWithAuth(`/sessions/${id}`);
  },

  async startSession(payload: {
    courseId: string;
    room?: string;
    durationMinutes?: number;
    minRssiThreshold?: number;
    allowedMethods?: ('ble' | 'qr')[];
  }): Promise<{ success: boolean; session: AttendanceSession }> {
    return fetchWithAuth('/sessions/start', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async sessionAction(id: string, action: 'pause' | 'resume' | 'end' | 'extend', durationMinutesExtend?: number) {
    return fetchWithAuth(`/sessions/${id}/action`, {
      method: 'POST',
      body: JSON.stringify({ action, durationMinutesExtend }),
    });
  },

  async verifyAttendance(
    sessionId: string,
    payload: {
      token: string;
      method: 'ble' | 'qr';
      rssi?: number;
      deviceFingerprint?: string;
    }
  ): Promise<{ success: boolean; record: AttendanceRecord; message: string }> {
    return fetchWithAuth(`/sessions/${sessionId}/verify-attendance`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Attendance & Health
  async getAttendanceHistory(params?: { courseId?: string; studentId?: string }): Promise<AttendanceRecord[]> {
    const query = new URLSearchParams();
    if (params?.courseId) query.set('courseId', params.courseId);
    if (params?.studentId) query.set('studentId', params.studentId);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetchWithAuth(`/attendance/history${qs}`);
  },

  async getHealthSummary(studentId?: string): Promise<any> {
    const qs = studentId ? `?studentId=${studentId}` : '';
    return fetchWithAuth(`/attendance/health-summary${qs}`);
  },

  // Corrections
  async getCorrections(): Promise<CorrectionRequest[]> {
    return fetchWithAuth('/attendance/corrections');
  },

  async submitCorrection(payload: {
    courseId: string;
    sessionDate: string;
    requestedStatus: 'verified' | 'excused';
    reason: string;
    documentationUrl?: string;
  }): Promise<{ success: boolean; correction: CorrectionRequest }> {
    return fetchWithAuth('/attendance/corrections', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async reviewCorrection(id: string, status: 'approved' | 'rejected', comment?: string): Promise<any> {
    return fetchWithAuth(`/attendance/corrections/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ status, comment }),
    });
  },

  async manualOverride(payload: {
    recordId?: string;
    studentId?: string;
    courseId?: string;
    newStatus: string;
    reason: string;
  }): Promise<any> {
    return fetchWithAuth('/attendance/manual-override', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // AI Insights
  async getAiInsights(): Promise<AiAttendanceAnalysis> {
    return fetchWithAuth('/ai/insights');
  },

  // Admin & Audit
  async getAuditLogs(): Promise<AuditLogEntry[]> {
    return fetchWithAuth('/admin/audit-logs');
  },

  async getPolicy(): Promise<InstitutionPolicy> {
    return fetchWithAuth('/admin/policy');
  },

  async updatePolicy(payload: Partial<InstitutionPolicy>): Promise<{ success: boolean; policy: InstitutionPolicy }> {
    return fetchWithAuth('/admin/policy', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async resetDemoData(): Promise<any> {
    return fetchWithAuth('/admin/reset-demo', {
      method: 'POST',
    });
  },
};
