import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Shield, Radio, Sparkles, Calendar, FileText, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'timetable';
  setActiveTab: (tab: 'dashboard' | 'timetable') => void;
  onOpenBleDiagnostic: () => void;
  onOpenAiInsights: () => void;
  onOpenReports: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenBleDiagnostic,
  onOpenAiInsights,
  onOpenReports,
}) => {
  const { user, role, theme, toggleTheme } = useAuth();

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-2.5 text-left cursor-pointer shrink-0 group focus:outline-none"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:border-blue-400 transition-colors">
            <Shield className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap block">
              ProxyProof
            </span>
          </div>
        </button>

        {/* Zone 2: 4-5 Concise Single-Line Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white cursor-pointer ${
              activeTab === 'dashboard' ? 'text-blue-400 font-semibold' : ''
            }`}
          >
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab('timetable')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'timetable' ? 'text-blue-400 font-semibold' : ''
            }`}
          >
            <Calendar className="w-4 h-4" />
            Timetable
          </button>

          <button
            onClick={onOpenAiInsights}
            className="transition-colors whitespace-nowrap shrink-0 hover:text-white cursor-pointer flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300"
          >
            <Sparkles className="w-4 h-4" />
            AI Intelligence
          </button>

          <button
            onClick={onOpenBleDiagnostic}
            className="transition-colors whitespace-nowrap shrink-0 hover:text-white cursor-pointer flex items-center gap-1.5"
          >
            <Radio className="w-4 h-4 text-cyan-400" />
            BLE Hardware Probe
          </button>

          <button
            onClick={onOpenReports}
            className="transition-colors whitespace-nowrap shrink-0 hover:text-white cursor-pointer flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" />
            Reports & CSV
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action / Active User Badge */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover border border-slate-700"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-200">
                {user?.name?.slice(0, 2).toUpperCase() || 'US'}
              </div>
            )}
            <div className="hidden lg:block text-left text-xs leading-tight">
              <div className="font-semibold text-slate-200 whitespace-nowrap">{user?.name}</div>
              <div className="text-slate-400 uppercase tracking-wider font-mono text-[10px]">
                {role} {user?.studentId || user?.facultyId ? `· ${user.studentId || user.facultyId}` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
