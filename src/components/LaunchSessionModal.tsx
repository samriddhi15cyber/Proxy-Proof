import React, { useState } from 'react';
import { X, Play, Radio, ShieldCheck } from 'lucide-react';
import { api } from '../services/api.ts';
import type { Course, AttendanceSession } from '../types/index.ts';

interface LaunchSessionModalProps {
  courses: Course[];
  onClose: () => void;
  onSuccess: (session: AttendanceSession) => void;
}

export const LaunchSessionModal: React.FC<LaunchSessionModalProps> = ({
  courses,
  onClose,
  onSuccess,
}) => {
  const [courseId, setCourseId] = useState(courses[0]?.id || '');
  const [room, setRoom] = useState(courses[0]?.room || 'SJT-408');
  const [durationMinutes, setDurationMinutes] = useState(10);
  const [minRssiThreshold, setMinRssiThreshold] = useState(-82);
  const [allowQr, setAllowQr] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCourseChange = (id: string) => {
    setCourseId(id);
    const c = courses.find((item) => item.id === id);
    if (c) setRoom(c.room);
  };

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const allowedMethods: ('ble' | 'qr')[] = ['ble'];
      if (allowQr) allowedMethods.push('qr');

      const res = await api.startSession({
        courseId,
        room,
        durationMinutes,
        minRssiThreshold,
        allowedMethods,
      });

      if (res.success && res.session) {
        onSuccess(res.session);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start session');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#292723]/50 backdrop-blur-xs">
      <div className="bg-[#FFFCF7] border border-[#E4DCD0] rounded-md max-w-md w-full overflow-hidden shadow-xl text-[#292723]">
        <div className="px-6 py-4 border-b border-[#E4DCD0] flex items-center justify-between bg-[#F6F1E8]">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-[#722F3E]" />
            <h3 className="text-lg font-semibold text-[#292723]">
              Start Attendance Session
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#77736D] hover:text-[#292723] rounded-md hover:bg-[#E4DCD0]/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleLaunch} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#292723] mb-1.5">
              Curriculum Section
            </label>
            <select
              value={courseId}
              onChange={(e) => handleCourseChange(e.target.value)}
              className="w-full bg-[#F6F1E8] border border-[#E4DCD0] rounded-md p-2.5 text-xs text-[#292723] focus:outline-none focus:border-[#722F3E]"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} · {c.title} ({c.section})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#292723] mb-1.5">
                Classroom Venue
              </label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                required
                className="w-full bg-[#F6F1E8] border border-[#E4DCD0] rounded-md p-2 text-xs text-[#292723] focus:outline-none focus:border-[#722F3E]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#292723] mb-1.5">
                Window Duration
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full bg-[#F6F1E8] border border-[#E4DCD0] rounded-md p-2 text-xs text-[#292723] focus:outline-none focus:border-[#722F3E]"
              >
                <option value={5}>5 Minutes</option>
                <option value={10}>10 Minutes</option>
                <option value={15}>15 Minutes</option>
                <option value={20}>20 Minutes</option>
              </select>
            </div>
          </div>

          {/* RSSI Proximity Gate */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-[#292723]">Min Proximity Gate (RSSI)</span>
              <span className="font-mono text-[#722F3E] font-medium">{minRssiThreshold} dBm</span>
            </div>
            <input
              type="range"
              min={-95}
              max={-70}
              step={1}
              value={minRssiThreshold}
              onChange={(e) => setMinRssiThreshold(Number(e.target.value))}
              className="w-full accent-[#722F3E] bg-[#E4DCD0] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-[#77736D] mt-1 font-mono">
              <span>Relaxed (-95 dBm)</span>
              <span>Strict / In-Room (-70 dBm)</span>
            </div>
          </div>

          {/* Allowed Verification Channels */}
          <div className="pt-2 border-t border-[#E4DCD0] space-y-2">
            <span className="block text-xs font-semibold text-[#292723]">Verification Protocols</span>
            <div className="flex items-center justify-between p-2.5 bg-[#F6F1E8] border border-[#E4DCD0] rounded-md text-xs">
              <div>
                <div className="text-[#292723] font-medium">BLE Beacon Broadcasting</div>
                <div className="text-[#77736D] text-[11px]">Primary proximity channel (15s salt)</div>
              </div>
              <span className="text-[#722F3E] font-medium text-xs font-mono">Mandatory</span>
            </div>

            <label className="flex items-center justify-between p-2.5 bg-[#F6F1E8] border border-[#E4DCD0] rounded-md text-xs cursor-pointer">
              <div>
                <div className="text-[#292723] font-medium">Permit Dynamic QR Fallback</div>
                <div className="text-[#77736D] text-[11px]">
                  Allows camera token scan if student BLE radio is disabled
                </div>
              </div>
              <input
                type="checkbox"
                checked={allowQr}
                onChange={(e) => setAllowQr(e.target.checked)}
                className="w-4 h-4 accent-[#722F3E] rounded"
              />
            </label>
          </div>

          {error && (
            <div className="text-[#722F3E] text-xs bg-[#F0E3E5] border border-[#722F3E]/20 p-2.5 rounded-md">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#FFFCF7] hover:bg-[#F6F1E8] text-[#292723] border border-[#E4DCD0] rounded-md text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#722F3E] hover:bg-[#54212D] text-white rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Play className="w-4 h-4 fill-current" />
              {isSubmitting ? 'Starting Beacon...' : 'Start Attendance Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
