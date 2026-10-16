import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  LayoutDashboard,
  CalendarDays,
  FileSpreadsheet,
  Activity,
  Cpu,
  GraduationCap,
  X,
  CheckCircle2,
} from 'lucide-react';

interface SidebarProps {
  activeTab: 'dashboard' | 'timetable';
  setActiveTab: (tab: 'dashboard' | 'timetable') => void;
  onOpenBleDiagnostic: () => void;
  onOpenAiInsights: () => void;
  onOpenReports: () => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenBleDiagnostic,
  onOpenAiInsights,
  onOpenReports,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const { role, user } = useAuth();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Portal Overview',
      icon: LayoutDashboard,
      action: () => {
        setActiveTab('dashboard');
        setIsMobileOpen(false);
      },
      active: activeTab === 'dashboard',
    },
    {
      id: 'timetable',
      label: 'Academic Timetable',
      icon: CalendarDays,
      action: () => {
        setActiveTab('timetable');
        setIsMobileOpen(false);
      },
      active: activeTab === 'timetable',
    },
    {
      id: 'intelligence',
      label: 'Attendance Intelligence',
      icon: Activity,
      action: () => {
        onOpenAiInsights();
        setIsMobileOpen(false);
      },
      active: false,
    },
    {
      id: 'hardware',
      label: 'BLE Diagnostic Probe',
      icon: Cpu,
      action: () => {
        onOpenBleDiagnostic();
        setIsMobileOpen(false);
      },
      active: false,
    },
    {
      id: 'reports',
      label: 'Registrar Reports & CSV',
      icon: FileSpreadsheet,
      action: () => {
        onOpenReports();
        setIsMobileOpen(false);
      },
      active: false,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#FFFCF7] border-r border-[#E4DCD0] text-[#292723]">
      {/* Brand Header */}
      <div className="p-6 border-b border-[#E4DCD0]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Geometric academic verification seal */}
            <div className="w-8 h-8 rounded-md bg-[#722F3E] text-white flex items-center justify-center text-sm font-semibold shadow-xs">
              P
            </div>
            <div>
              <span className="text-lg font-semibold tracking-tight text-[#292723] block leading-none">
                ProxyProof
              </span>
              <span className="text-[11px] text-[#77736D] mt-1 block font-medium">
                University System
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1.5 text-[#77736D] hover:text-[#292723] rounded-md"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-medium text-[#77736D]">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={item.action}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium transition-colors cursor-pointer text-left ${
                item.active
                  ? 'bg-[#F0E3E5] text-[#722F3E] font-medium'
                  : 'text-[#292723] hover:bg-[#F6F1E8] hover:text-[#722F3E]'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  item.active ? 'text-[#722F3E]' : 'text-[#77736D]'
                }`}
              />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sidebar Institutional Footer */}
      <div className="p-4 border-t border-[#E4DCD0] bg-[#F6F1E8]/60 space-y-3">
        <div className="flex items-center gap-2.5">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full object-cover border border-[#E4DCD0]"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#E4DCD0] text-[#722F3E] flex items-center justify-center text-xs font-semibold">
              {user?.name?.slice(0, 2).toUpperCase() || 'U'}
            </div>
          )}
          <div className="overflow-hidden">
            <div className="text-xs font-semibold text-[#292723] truncate">{user?.name}</div>
            <div className="text-[11px] text-[#77736D] font-mono">
              {role} {user?.studentId || user?.facultyId ? `· ${user.studentId || user.facultyId}` : ''}
            </div>
          </div>
        </div>

        <div className="text-[10px] text-[#77736D] pt-2 border-t border-[#E4DCD0]/60 leading-tight">
          Fall Academic Session 2026<br />
          Office of the Registrar
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 shrink-0 h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-[#292723]/40 transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-72 max-w-xs flex-1 z-10 shadow-xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
