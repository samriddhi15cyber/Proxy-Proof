import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  Radio,
  FileQuestion,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import type { AttendanceSession, AttendanceRecord, Course } from '../types/index.ts';
import { JoinAttendanceModal } from './JoinAttendanceModal.tsx';
import { CorrectionRequestModal } from './CorrectionRequestModal.tsx';

interface StudentDashboardProps {
  onOpenTimetable: () => void;
  onOpenBleProbe: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onOpenTimetable,
  onOpenBleProbe,
}) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeSessions, setActiveSessions] = useState<AttendanceSession[]>([]);
  const [healthData, setHealthData] = useState<any>(null);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [selectedSessionForJoin, setSelectedSessionForJoin] = useState<AttendanceSession | null>(null);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [targetThreshold, setTargetThreshold] = useState<number>(75);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const [coursesData, sessionsData, healthRes, historyData] = await Promise.all([
        api.getCourses(),
        api.getActiveSessions(),
        api.getHealthSummary(),
        api.getAttendanceHistory(),
      ]);
      setCourses(coursesData);
      setActiveSessions(sessionsData);
      setHealthData(healthRes);
      setHistory(historyData);
    } catch (err) {
      console.error('Failed loading student dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      api.getActiveSessions().then(setActiveSessions).catch(console.error);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const overallPct = healthData?.overallPercentage ?? 81.8;
  const isBelowPolicy = overallPct < targetThreshold;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-[#292723]">
      {/* 1. Personalised Greeting & Academic Status */}
      <div className="border-b border-[#E4DCD0] pb-6 flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-medium text-[#77736D]">
            Collegiate Attendance Portal
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#292723] tracking-tight mt-1">
            Welcome back, {user?.name}
          </h2>
          <p className="text-xs text-[#77736D] mt-1">
            Candidate ID: <span className="font-mono text-[#292723] font-medium">{user?.studentId || 'VIT2026-CS-084'}</span> · {user?.department}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#77736D]">Institution Policy:</span>
          <span className="font-mono font-medium px-2 py-0.5 bg-[#FFFCF7] border border-[#E4DCD0] rounded text-[#292723]">
            {targetThreshold}% Minimum Required
          </span>
        </div>
      </div>

      {/* 2. Active Attendance Session Notice (if active) */}
      {activeSessions.length > 0 && (
        <div className="bg-[#FFFCF7] border border-[#E4DCD0] border-l-4 border-l-[#722F3E] rounded-md p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#42664D]" />
              <span className="text-xs font-medium text-[#722F3E]">
                Active Verification Window Open
              </span>
              <span className="text-[#E4DCD0]">·</span>
              <span className="text-xs font-mono text-[#77736D]">{activeSessions[0].room}</span>
            </div>
            <h3 className="text-lg font-semibold text-[#292723]">
              {activeSessions[0].courseCode}: {activeSessions[0].courseTitle}
            </h3>
            <p className="text-xs text-[#77736D]">
              Instructor: {activeSessions[0].instructorName} · Rotating Beacon Active
            </p>
          </div>

          <button
            onClick={() => setSelectedSessionForJoin(activeSessions[0])}
            className="w-full md:w-auto px-5 py-2.5 bg-[#722F3E] hover:bg-[#54212D] text-white font-medium rounded-md text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs whitespace-nowrap"
          >
            <ShieldCheck className="w-4 h-4" />
            Verify Physical Presence
          </button>
        </div>
      )}

      {/* 3. Editorial Attendance Summary Section */}
      <div className="bg-[#FFFCF7] border border-[#E4DCD0] rounded-md p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#E4DCD0]">
          <div>
            <h3 className="text-lg font-semibold text-[#292723]">
              Academic Attendance Summary
            </h3>
            <p className="text-xs text-[#77736D] mt-0.5">
              Verified physical presence across enrolled lecture and laboratory modules.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-[#F6F1E8] border border-[#E4DCD0] rounded-md p-1 text-xs">
            <span className="text-[#77736D] px-2 font-medium text-[11px]">Threshold:</span>
            {[75, 80, 85].map((pct) => (
              <button
                key={pct}
                onClick={() => setTargetThreshold(pct)}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                  targetThreshold === pct
                    ? 'bg-[#722F3E] text-white font-medium'
                    : 'text-[#77736D] hover:text-[#292723]'
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>

        {/* Big Numbers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#E4DCD0] pt-6">
          {/* Stat 1 */}
          <div className="pb-5 md:pb-0 md:pr-6 space-y-2">
            <span className="text-xs font-medium text-[#77736D] block">
              Cumulative Standing
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-semibold text-[#292723] tabular-nums">
                {overallPct}%
              </span>
              <span
                className={`text-xs font-medium ${
                  isBelowPolicy ? 'text-[#722F3E]' : 'text-[#42664D]'
                }`}
              >
                {isBelowPolicy ? 'Action Required' : 'Good Standing'}
              </span>
            </div>
            <div className="w-full bg-[#F6F1E8] h-2 rounded-full overflow-hidden border border-[#E4DCD0]/60">
              <div
                className={`h-full transition-all duration-500 ${
                  isBelowPolicy ? 'bg-[#722F3E]' : 'bg-[#42664D]'
                }`}
                style={{ width: `${Math.min(100, overallPct)}%` }}
              />
            </div>
            <div className="text-[11px] text-[#77736D] tabular-nums">
              {healthData?.totalAttended ?? 52} attended of {healthData?.totalHeld ?? 66} sessions
            </div>
          </div>

          {/* Stat 2 */}
          <div className="py-5 md:py-0 md:px-6 space-y-2">
            <span className="text-xs font-medium text-[#77736D] block">
              Permitted Absences
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-semibold text-[#292723] tabular-nums">
                {healthData?.courseBreakdowns
                  ? Math.max(0, ...healthData.courseBreakdowns.map((c: any) => c.safeToMiss))
                  : 2}
              </span>
              <span className="text-xs text-[#77736D]">allowable sessions</span>
            </div>
            <p className="text-xs text-[#77736D] leading-relaxed">
              Sessions you may miss in your highest standing course while preserving eligibility above {targetThreshold}%.
            </p>
          </div>

          {/* Stat 3 */}
          <div className="pt-5 md:pt-0 md:pl-6 space-y-2">
            <span className="text-xs font-medium text-[#77736D] block">
              Remediation Target
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-semibold text-[#722F3E] tabular-nums">
                4
              </span>
              <span className="text-xs text-[#77736D]">consecutive lectures</span>
            </div>
            <p className="text-xs text-[#77736D] leading-relaxed">
              Needed in <strong className="text-[#292723]">CSE4011 (70.0%)</strong> to cross the university {targetThreshold}% requirement.
            </p>
            <button
              onClick={() => setShowCorrectionModal(true)}
              className="text-xs text-[#722F3E] hover:text-[#54212D] font-medium underline underline-offset-2 flex items-center gap-1 cursor-pointer pt-1"
            >
              <FileQuestion className="w-3.5 h-3.5" />
              File medical or official duty-leave correction
            </button>
          </div>
        </div>
      </div>

      {/* 4. Enrolled Course Register */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-[#292723]">
              Enrolled Course Register
            </h3>
            <p className="text-xs text-[#77736D]">
              Individual course sections, credit hours, and module standings.
            </p>
          </div>

          <button
            onClick={onOpenTimetable}
            className="text-xs text-[#722F3E] hover:text-[#54212D] font-semibold flex items-center gap-1 cursor-pointer"
          >
            <CalendarDays className="w-4 h-4" />
            Full Weekly Timetable
          </button>
        </div>

        {/* Structured Table for Desktop, Clean Stack for Mobile */}
        <div className="bg-[#FFFCF7] border border-[#E4DCD0] rounded-md overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F6F1E8] text-[#77736D] border-b border-[#E4DCD0] font-medium text-[11px]">
                <tr>
                  <th className="py-3 px-4">Code & Title</th>
                  <th className="py-3 px-4">Instructor</th>
                  <th className="py-3 px-4">Venue</th>
                  <th className="py-3 px-4">Credits</th>
                  <th className="py-3 px-4">Attended / Total</th>
                  <th className="py-3 px-4 text-right">Percentage</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4DCD0]">
                {courses.map((course) => {
                  const courseStats = healthData?.courseBreakdowns?.find(
                    (b: any) => b.courseId === course.id
                  );
                  const pct = courseStats?.currentPercentage ?? 80;
                  const isWarning = pct < targetThreshold;

                  return (
                    <tr key={course.id} className="hover:bg-[#F6F1E8]/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#292723]">{course.title}</div>
                        <div className="font-mono text-[#77736D] text-[11px]">{course.code} ({course.section})</div>
                      </td>
                      <td className="py-3 px-4 text-[#292723]">{course.instructorName}</td>
                      <td className="py-3 px-4 font-mono text-[#77736D]">{course.room}</td>
                      <td className="py-3 px-4 font-mono text-[#77736D]">{course.credits}</td>
                      <td className="py-3 px-4 font-mono text-[#292723] tabular-nums">
                        {courseStats?.attendedCount ?? 20} / {courseStats?.totalEligible ?? 24}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-sm tabular-nums text-[#292723]">
                        {pct}%
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                            isWarning
                              ? 'bg-[#F0E3E5] text-[#722F3E] border border-[#722F3E]/20'
                              : 'bg-[#EBF2ED] text-[#42664D] border border-[#42664D]/20'
                          }`}
                        >
                          {isWarning ? 'Attention' : 'Satisfactory'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 5. Recent Attendance Logs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-[#292723]">
              Official Attendance Ledger
            </h3>
            <p className="text-xs text-[#77736D]">
              Recent physical presence verifications logged on the university server.
            </p>
          </div>

          <button
            onClick={() => setShowCorrectionModal(true)}
            className="text-xs text-[#722F3E] hover:text-[#54212D] bg-[#FFFCF7] border border-[#E4DCD0] px-3.5 py-1.5 rounded-md font-medium transition-colors cursor-pointer"
          >
            Submit Correction Request
          </button>
        </div>

        <div className="bg-[#FFFCF7] border border-[#E4DCD0] rounded-md overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F6F1E8] text-[#77736D] border-b border-[#E4DCD0] font-medium text-[11px]">
                <tr>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">Session Date & Time</th>
                  <th className="py-3 px-4">Verification Method</th>
                  <th className="py-3 px-4">Signal Telemetry (RSSI)</th>
                  <th className="py-3 px-4 text-right">Official Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4DCD0]">
                {history.slice(0, 6).map((r) => (
                  <tr key={r.id} className="hover:bg-[#F6F1E8]/50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-[#292723]">
                      {r.courseCode}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#77736D] tabular-nums">
                      {new Date(r.timestamp).toLocaleDateString()} ·{' '}
                      {new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono uppercase text-[11px] px-2 py-0.5 bg-[#F6F1E8] border border-[#E4DCD0] rounded text-[#292723]">
                        {r.method === 'ble' ? 'Bluetooth Proximity' : r.method === 'qr' ? 'Dynamic QR' : 'Manual Override'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-[#77736D]">
                      {r.rssi ? `${r.rssi} dBm` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
                          r.status === 'verified'
                            ? 'bg-[#EBF2ED] text-[#42664D] border border-[#42664D]/20'
                            : r.status === 'needs_review'
                            ? 'bg-[#F8F3E9] text-[#8C6B2D] border border-[#8C6B2D]/20'
                            : 'bg-[#F0E3E5] text-[#722F3E] border border-[#722F3E]/20'
                        }`}
                      >
                        {r.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedSessionForJoin && (
        <JoinAttendanceModal
          session={selectedSessionForJoin}
          onClose={() => setSelectedSessionForJoin(null)}
          onSuccess={() => loadData()}
        />
      )}

      {showCorrectionModal && (
        <CorrectionRequestModal
          courses={courses}
          onClose={() => setShowCorrectionModal(false)}
          onSuccess={() => {
            setShowCorrectionModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
};
