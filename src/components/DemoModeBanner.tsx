import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { ShieldCheck, RefreshCw } from 'lucide-react';
import { api } from '../services/api.ts';

export const DemoModeBanner: React.FC = () => {
  const { user, availablePersonas, switchPersona, refreshAuth } = useAuth();
  const [isResetting, setIsResetting] = React.useState(false);

  const handleReset = async () => {
    if (confirm('Reset collegiate database to initial demo state?')) {
      setIsResetting(true);
      try {
        await api.resetDemoData();
        await refreshAuth();
      } catch (err) {
        console.error('Reset failed:', err);
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <div className="bg-[#FFFCF7] border-b border-[#E4DCD0] px-4 py-2 text-xs text-[#292723]">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#C2A46D]" />
          <span className="font-medium text-xs text-[#722F3E]">
            University Demonstration Sandbox
          </span>
          <span className="text-[#C2A46D] hidden sm:inline">·</span>
          <span className="text-[#77736D] hidden sm:inline">
            BLE beacon telemetry and academic rosters are running in simulated evaluation mode.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[#F6F1E8] border border-[#E4DCD0] rounded-md p-0.5">
            <span className="text-[#77736D] px-2 font-medium text-[11px]">Role:</span>
            {availablePersonas.slice(0, 3).map((p) => {
              const isActive = p.id === user?.id;
              return (
                <button
                  key={p.id}
                  onClick={() => switchPersona(p.id)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#722F3E] text-white shadow-xs font-medium'
                      : 'text-[#292723] hover:text-[#722F3E] hover:bg-[#FFFCF7]'
                  }`}
                  title={`${p.name} (${p.role})`}
                >
                  {p.role === 'student' ? 'Student' : p.role === 'teacher' ? 'Faculty' : 'Registrar'}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleReset}
            disabled={isResetting}
            className="flex items-center gap-1.5 px-2.5 py-1 text-[#77736D] hover:text-[#292723] bg-[#FFFCF7] hover:bg-[#F6F1E8] border border-[#E4DCD0] rounded-md transition-colors cursor-pointer whitespace-nowrap text-xs"
            title="Reset to clean university demo data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-[#722F3E]' : ''}`} />
            <span className="hidden md:inline">Reset Sandbox</span>
          </button>
        </div>
      </div>
    </div>
  );
};
