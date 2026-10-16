import React, { useState, useEffect } from 'react';
import {
  Play,
  Users,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Radio,
  ExternalLink,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import type { Course, AttendanceSession, CorrectionRequest } from '../types/index.ts';
import { LaunchSessionModal } from './LaunchSessionModal.tsx';
import { LiveClassroomModal } from './LiveClassroomModal.tsx';

interface TeacherDashboardProps {
  onOpenReports: () => void;
  onOpenBleProbe: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  onOpenReports,
  onOpenBleProbe,
}) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeSessions, setActiveSessions] = useState<AttendanceSession[]>([]);
  const [corrections, setCorrections] = useState<CorrectionRequest[]>([]);
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [liveSessionId, setLiveSessionId] = useState<string | null>(null);
  const [reviewComment, setReviewComment] = useState<{ [id: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const [coursesData, sessionsData, correctionsData] = await Promise.all([
        api.getCourses(),
        api.getActiveSessions(),
        api.getCorrections(),
      ]);
      setCourses(coursesData);
      setActiveSessions(sessionsData);
      setCorrections(correctionsData);
    } catch (err) {
      console.error('Failed loading teacher dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleReview = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await api.reviewCorrection(id, status, reviewComment[id]);
      await loadData();
    } catch (err) {
      console.error('Review failed:', err);
    }
  };

  const activeSessionForTeacher = activeSessions.find(
    (s) => s.instructorId === user?.id || s.instructorName === user?.name
  ) || activeSessions[0];

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-[#292723]">
      {/* 1. Header & Quick Action */}
      <div className="border-b border-[#E4DCD0] pb-6 flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-medium text-[#77736D]">
            Faculty Attendance Administration
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#292723] tracking-tight mt-1">
            Faculty Workspace — {user?.name}
          </h2>
          <p className="text-xs text-[#77736D] mt-1">
            Faculty ID: <span className="font-mono text-[#292723] font-medium">{user?.facultyId || 'FAC-CS-109'}</span> · {user?.department}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenReports}
            className="px-3.5 py-2 bg-[#FFFCF7] hover:bg-[#F6F1E8] border border-[#E4DCD0] text-[#292723] text-xs font-medium rounded-md transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#722F3E]" />
            Export Class CSV
          </button>

          <button
            onClick={() => setShowLaunchModal(true)}
            className="px-4 py-2 bg-[#722F3E] hover:bg-[#54212D] text-white text-xs font-medium rounded-md transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Start Attendance Session
          </button>
        </div>
      </div>

      {/* 2. Active Session Card */}
      {activeSessionForTeacher ? (
        <div className="bg-[#FFFCF7] border border-[#E4DCD0] border-l-4 border-l-[#722F3E] rounded-md p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#42664D]" />
              <span className="text-xs font-medium text-[#722F3E]">
                Active Classroom Beacon Broadcasting
              </span>
              <span className="text-[#E4DCD0]">·</span>
              <span className="text-xs font-mono text-[#77736D]">Room {activeSessionForTeacher.room}</span>
            </div>
            <h3 className="text-xl font-semibold text-[#292723]">
              {activeSessionForTeacher.courseCode}: {activeSessionForTeacher.courseTitle}
            </h3>
            <p className="text-xs text-[#77736D]">
              Verified: <strong className="text-[#292723] tabular-nums font-mono">{activeSessionForTeacher.stats.verifiedCount}</strong> / {activeSessionForTeacher.stats.enrolledCount} enrolled · Rotating cryptographic salt active (15s cadence)
            </p>
          </div>

          <button
            onClick={() => setLiveSessionId(activeSessionForTeacher.id)}
            className="px-5 py-2.5 bg-[#722F3E] hover:bg-[#54212D] text-white font-medium rounded-md text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-xs whitespace-nowrap"
          >
            <Radio className="w-4 h-4" />
            Open Classroom Monitor & Dynamic QR
          </button>
        </div>
      ) : null}

      {/* 3. Assigned Courses Table */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-[#292723]">
            Assigned Teaching Sections
          </h3>
          <p className="text-xs text-[#77736D]">
            Official curriculum allocations and student enrolment rosters.
          </p>
        </div>

        <div className="bg-[#FFFCF7] border border-[#E4DCD0] rounded-md overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F6F1E8] text-[#77736D] border-b border-[#E4DCD0] font-medium text-[11px]">
                <tr>
                  <th className="py-3 px-4">Code & Title</th>
                  <th className="py-3 px-4">Section</th>
                  <th className="py-3 px-4">Venue</th>
                  <th className="py-3 px-4">Enrolment</th>
                  <th className="py-3 px-4">Sessions Held</th>
                  <th className="py-3 px-4 text-right">Session Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4DCD0]">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-[#F6F1E8]/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#292723]">{course.title}</div>
                      <div className="font-mono text-[#77736D] text-[11px]">{course.code}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#77736D]">{course.section}</td>
                    <td className="py-3.5 px-4 font-mono text-[#77736D]">{course.room}</td>
                    <td className="py-3.5 px-4 font-mono tabular-nums text-[#292723]">
                      {course.enrolledStudentIds.length} students
                    </td>
                    <td className="py-3.5 px-4 font-mono tabular-nums text-[#77736D]">
                      {course.totalSessionsHeld} classes
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setShowLaunchModal(true)}
                        className="px-3 py-1.5 bg-[#FFFCF7] hover:bg-[#F6F1E8] border border-[#E4DCD0] text-[#722F3E] rounded-md text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        Start Session
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. Student Correction Appeals Review Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-[#292723]">
              Attendance Correction Requests
            </h3>
            <p className="text-xs text-[#77736D]">
              Student submissions for authorized duty-leave, hackathon representations, and verified equipment failures.
            </p>
          </div>

          {corrections.filter((c) => c.status === 'pending').length > 0 && (
            <span className="px-2.5 py-1 rounded bg-[#F0E3E5] border border-[#722F3E]/20 text-[#722F3E] text-xs font-medium tabular-nums">
              {corrections.filter((c) => c.status === 'pending').length} Pending Review
            </span>
          )}
        </div>

        <div className="bg-[#FFFCF7] border border-[#E4DCD0] rounded-md overflow-hidden shadow-xs">
          {corrections.length === 0 ? (
            <div className="p-8 text-center text-[#77736D] text-xs font-medium">
              No pending attendance correction requests in the faculty register.
            </div>
          ) : (
            <div className="divide-y divide-[#E4DCD0]">
              {corrections.map((corr) => (
                <div
                  key={corr.id}
                  className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-[#F6F1E8]/30 transition-colors"
                >
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-[#292723]">{corr.studentName}</span>
                      <span className="text-[#C2A46D]">·</span>
                      <span className="font-mono text-xs text-[#722F3E] font-medium">{corr.courseCode}</span>
                      <span className="text-[#C2A46D]">·</span>
                      <span className="text-xs text-[#77736D] font-mono tabular-nums">{corr.sessionDate}</span>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded uppercase tracking-wider ${
                          corr.status === 'pending'
                            ? 'bg-[#F8F3E9] text-[#8C6B2D] border border-[#8C6B2D]/20'
                            : corr.status === 'approved'
                            ? 'bg-[#EBF2ED] text-[#42664D] border border-[#42664D]/20'
                            : 'bg-[#F0E3E5] text-[#722F3E] border border-[#722F3E]/20'
                        }`}
                      >
                        {corr.status}
                      </span>
                    </div>

                    <p className="text-xs text-[#292723] leading-relaxed">
                      <strong className="text-[#77736D]">Reason:</strong> {corr.reason}
                    </p>

                    {corr.documentationUrl && (
                      <a
                        href={corr.documentationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#722F3E] hover:text-[#54212D] inline-flex items-center gap-1 font-medium underline underline-offset-2 pt-0.5"
                      >
                        <ExternalLink className="w-3 h-3" /> View Submitted Evidential Documentation
                      </a>
                    )}
                  </div>

                  {corr.status === 'pending' ? (
                    <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                      <input
                        type="text"
                        placeholder="Audit justification..."
                        value={reviewComment[corr.id] || ''}
                        onChange={(e) =>
                          setReviewComment({ ...reviewComment, [corr.id]: e.target.value })
                        }
                        className="bg-[#F6F1E8] border border-[#E4DCD0] rounded-md px-3 py-1.5 text-xs text-[#292723] placeholder-[#77736D] w-full md:w-44 focus:outline-none focus:border-[#722F3E]"
                      />
                      <button
                        onClick={() => handleReview(corr.id, 'approved')}
                        className="px-3 py-1.5 bg-[#42664D] hover:bg-[#324f3b] text-white rounded-md text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReview(corr.id, 'rejected')}
                        className="px-3 py-1.5 bg-[#722F3E] hover:bg-[#54212D] text-white rounded-md text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-[#77736D] font-mono text-right">
                      Reviewed by {corr.reviewedBy || 'Faculty'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showLaunchModal && (
        <LaunchSessionModal
          courses={courses}
          onClose={() => setShowLaunchModal(false)}
          onSuccess={(newSession) => {
            setShowLaunchModal(false);
            setLiveSessionId(newSession.id);
            loadData();
          }}
        />
      )}

      {liveSessionId && (
        <LiveClassroomModal
          sessionId={liveSessionId}
          onClose={() => {
            setLiveSessionId(null);
            loadData();
          }}
        />
      )}
    </div>
  );
};
