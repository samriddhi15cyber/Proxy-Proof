import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Menu, Calendar, Bell } from 'lucide-react';

interface TopHeaderProps {
  activeTab: 'dashboard' | 'timetable';
  onOpenMobileMenu: () => void;
  onOpenBleDiagnostic: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTab,
  onOpenMobileMenu,
  onOpenBleDiagnostic,
}) => {
  const { user, role } = useAuth();

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="bg-[#FFFCF7] border-b border-[#E4DCD0] sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Menu & Current Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 text-[#292723] hover:bg-[#F6F1E8] rounded-md transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-lg font-semibold text-[#292723] tracking-tight leading-tight">
              {activeTab === 'timetable'
                ? 'Academic Timetable & Schedule'
                : role === 'student'
                ? 'Student Attendance Register'
                : role === 'teacher'
                ? 'Faculty Instruction & Verification'
                : 'Registrar Institutional Ledger'}
            </h1>
            <div className="text-[11px] text-[#77736D] flex items-center gap-2">
              <span>Fall Semester 2026</span>
              <span>·</span>
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Right: Department & Hardware Diagnostic Link */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenBleDiagnostic}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F6F1E8] hover:bg-[#E4DCD0]/60 border border-[#E4DCD0] rounded-md text-xs font-medium text-[#292723] transition-colors cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-[#42664D]" />
            BLE Hardware Spec
          </button>

          <div className="hidden lg:block text-right border-l border-[#E4DCD0] pl-3">
            <div className="text-xs font-medium text-[#292723]">{user?.department}</div>
            <div className="text-[11px] text-[#77736D] font-mono">
              Identity: Authenticated
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
