import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { DemoModeBanner } from './components/DemoModeBanner.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { TopHeader } from './components/TopHeader.tsx';
import { StudentDashboard } from './components/StudentDashboard.tsx';
import { TeacherDashboard } from './components/TeacherDashboard.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { TimetableCalendar } from './components/TimetableCalendar.tsx';
import { BleDiagnosticModal } from './components/BleDiagnosticModal.tsx';
import { AiIntelligenceModal } from './components/AiIntelligenceModal.tsx';
import { ReportsModal } from './components/ReportsModal.tsx';
import { JoinAttendanceModal } from './components/JoinAttendanceModal.tsx';
import { LaunchSessionModal } from './components/LaunchSessionModal.tsx';
import { LiveClassroomModal } from './components/LiveClassroomModal.tsx';
import { api } from './services/api.ts';
import type { AttendanceSession, Course } from './types/index.ts';
import { RefreshCw } from 'lucide-react';

function MainApp() {
  const { role, user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'timetable'>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBleDiagnosticOpen, setIsBleDiagnosticOpen] = useState(false);
  const [isAiInsightsOpen, setIsAiInsightsOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [selectedSessionForJoin, setSelectedSessionForJoin] = useState<AttendanceSession | null>(null);
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [liveSessionId, setLiveSessionId] = useState<string | null>(null);

  React.useEffect(() => {
    api.getCourses().then(setCourses).catch(console.error);
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F6F1E8] flex flex-col items-center justify-center text-[#77736D] space-y-3">
        <RefreshCw className="w-7 h-7 animate-spin text-[#722F3E]" />
        <p className="text-xs font-medium text-[#77736D]">Loading University Attendance System...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F1E8] text-[#292723] flex flex-col font-sans selection:bg-[#722F3E] selection:text-white">
      {/* 1. University Demonstration Sandbox Indicator */}
      <DemoModeBanner />

      {/* 2. Main Layout with Desktop Sidebar & Top Header */}
      <div className="flex-1 flex flex-row">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenBleDiagnostic={() => setIsBleDiagnosticOpen(true)}
          onOpenAiInsights={() => setIsAiInsightsOpen(true)}
          onOpenReports={() => setIsReportsOpen(true)}
          isMobileOpen={isMobileMenuOpen}
          setIsMobileOpen={setIsMobileMenuOpen}
        />

        {/* Content Viewport */}
        <div className="flex-1 flex flex-col min-w-0">
          <TopHeader
            activeTab={activeTab}
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
            onOpenBleDiagnostic={() => setIsBleDiagnosticOpen(true)}
          />

          <main className="flex-1">
            {activeTab === 'timetable' ? (
              <TimetableCalendar
                onJoinSession={(sess) => setSelectedSessionForJoin(sess)}
                onLaunchSession={() => setShowLaunchModal(true)}
              />
            ) : role === 'student' ? (
              <StudentDashboard
                onOpenTimetable={() => setActiveTab('timetable')}
                onOpenBleProbe={() => setIsBleDiagnosticOpen(true)}
              />
            ) : role === 'teacher' ? (
              <TeacherDashboard
                onOpenReports={() => setIsReportsOpen(true)}
                onOpenBleProbe={() => setIsBleDiagnosticOpen(true)}
              />
            ) : (
              <AdminDashboard
                onOpenReports={() => setIsReportsOpen(true)}
                onOpenAiInsights={() => setIsAiInsightsOpen(true)}
              />
            )}
          </main>

          {/* Academic Footer */}
          <footer className="border-t border-[#E4DCD0] bg-[#FFFCF7] py-6 px-4 text-xs text-[#77736D]">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div>
                <span className="font-semibold text-[#292723]">ProxyProof</span>
                <span className="mx-2 text-[#C2A46D]">·</span>
                <span>University Academic Attendance & Verification Platform</span>
              </div>

              <div className="flex items-center gap-4 text-[11px]">
                <button
                  onClick={() => setIsBleDiagnosticOpen(true)}
                  className="hover:text-[#722F3E] transition-colors cursor-pointer"
                >
                  BLE Specifications
                </button>
                <button
                  onClick={() => setIsAiInsightsOpen(true)}
                  className="hover:text-[#722F3E] transition-colors cursor-pointer"
                >
                  Ethical AI Charter
                </button>
                <button
                  onClick={() => setIsReportsOpen(true)}
                  className="hover:text-[#722F3E] transition-colors cursor-pointer"
                >
                  Registrar Audit Export
                </button>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Global Modals */}
      {isBleDiagnosticOpen && (
        <BleDiagnosticModal onClose={() => setIsBleDiagnosticOpen(false)} />
      )}

      {isAiInsightsOpen && (
        <AiIntelligenceModal onClose={() => setIsAiInsightsOpen(false)} />
      )}

      {isReportsOpen && (
        <ReportsModal onClose={() => setIsReportsOpen(false)} />
      )}

      {selectedSessionForJoin && (
        <JoinAttendanceModal
          session={selectedSessionForJoin}
          onClose={() => setSelectedSessionForJoin(null)}
          onSuccess={() => setSelectedSessionForJoin(null)}
        />
      )}

      {showLaunchModal && (
        <LaunchSessionModal
          courses={courses}
          onClose={() => setShowLaunchModal(false)}
          onSuccess={(newSession) => {
            setShowLaunchModal(false);
            setLiveSessionId(newSession.id);
          }}
        />
      )}

      {liveSessionId && (
        <LiveClassroomModal
          sessionId={liveSessionId}
          onClose={() => setLiveSessionId(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
