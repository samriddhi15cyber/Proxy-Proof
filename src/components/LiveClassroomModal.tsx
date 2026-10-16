import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Radio,
  QrCode,
  Users,
  Pause,
  Play,
  Plus,
  StopCircle,
  RefreshCw,
  Search,
} from 'lucide-react';
import { api } from '../services/api.ts';
import type { AttendanceSession, AttendanceRecord } from '../types/index.ts';

interface LiveClassroomModalProps {
  sessionId: string;
  onClose: () => void;
}

export const LiveClassroomModal: React.FC<LiveClassroomModalProps> = ({ sessionId, onClose }) => {
  const [session, setSession] = useState<AttendanceSession | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(15);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecordForOverride, setSelectedRecordForOverride] = useState<AttendanceRecord | null>(null);
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideStatus, setOverrideStatus] = useState<'verified' | 'excused' | 'failed'>('verified');

  const fetchSessionDetails = async () => {
    try {
      const data = await api.getSession(sessionId);
      setSession(data.session);
      setRecords(data.records);
      setStats(data.stats);

      if (data.session.currentRotatingToken) {
        const qrPayload = JSON.stringify({
          sessionId: data.session.id,
          token: data.session.currentRotatingToken,
          course: data.session.courseCode,
          ts: Date.now(),
        });
        const url = await QRCode.toDataURL(qrPayload, {
          width: 220,
          margin: 1,
          color: {
            dark: '#292723',
            light: '#FFFCF7',
          },
        });
        setQrDataUrl(url);
      }
    } catch (err) {
      console.error('Failed fetching live session data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionDetails();
    const interval = setInterval(fetchSessionDetails, 3000);
    return () => clearInterval(interval);
  }, [sessionId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 15 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAction = async (action: 'pause' | 'resume' | 'end' | 'extend', extendMin?: number) => {
    try {
      await api.sessionAction(sessionId, action, extendMin);
      await fetchSessionDetails();
    } catch (err) {
      console.error('Action failed:', err);
    }
  };

  const handleOverrideSubmit = async () => {
    if (!selectedRecordForOverride || !overrideReason.trim()) return;
    try {
      await api.manualOverride({
        recordId: selectedRecordForOverride.id,
        newStatus: overrideStatus,
        reason: overrideReason,
      });
      setSelectedRecordForOverride(null);
      setOverrideReason('');
      await fetchSessionDetails();
    } catch (err) {
      console.error('Manual override failed:', err);
    }
  };

  const filteredRecords = records.filter(
    (r) =>
      r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.studentId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading && !session) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#292723]/50 backdrop-blur-xs">
        <div className="bg-[#FFFCF7] border border-[#E4DCD0] rounded-md p-8 text-center text-[#77736D]">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-[#722F3E]" />
          <p className="text-xs font-medium text-[#77736D]">Connecting to Academic Live Stream...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const verifiedPercent =
    session.stats.enrolledCount > 0
      ? Math.round((session.stats.verifiedCount / session.stats.enrolledCount) * 100)
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#292723]/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FFFCF7] border border-[#E4DCD0] rounded-md max-w-4xl w-full my-8 overflow-hidden shadow-xl flex flex-col max-h-[90vh] text-[#292723]">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-[#E4DCD0] flex items-center justify-between shrink-0 bg-[#F6F1E8]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-[#722F3E] text-white flex items-center justify-center">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-[#292723]">
                  {session.courseCode}: {session.courseTitle}
                </h3>
                <span
                  className={`px-2 py-0.5 text-[10px] font-medium rounded uppercase tracking-wider ${
                    session.status === 'active'
                      ? 'bg-[#EBF2ED] text-[#42664D] border border-[#42664D]/20'
                      : session.status === 'paused'
                      ? 'bg-[#F8F3E9] text-[#8C6B2D] border border-[#8C6B2D]/20'
                      : 'bg-[#F0E3E5] text-[#722F3E]'
                  }`}
                >
                  {session.status}
                </span>
              </div>
              <p className="text-xs text-[#77736D]">
                Room {session.room} · Window Expiry: {new Date(session.expiresAt).toLocaleTimeString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {session.status === 'active' ? (
              <button
                onClick={() => handleAction('pause')}
                className="px-3 py-1.5 bg-[#FFFCF7] hover:bg-[#F6F1E8] text-[#292723] border border-[#E4DCD0] rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Pause className="w-3.5 h-3.5" />
                Pause
              </button>
            ) : session.status === 'paused' ? (
              <button
                onClick={() => handleAction('resume')}
                className="px-3 py-1.5 bg-[#42664D] hover:bg-[#324f3b] text-white rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                Resume
              </button>
            ) : null}

            {session.status !== 'ended' && (
              <>
                <button
                  onClick={() => handleAction('extend', 3)}
                  className="px-3 py-1.5 bg-[#FFFCF7] hover:bg-[#F6F1E8] text-[#292723] border border-[#E4DCD0] rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Add 3 minutes to active attendance window"
                >
                  <Plus className="w-3.5 h-3.5 text-[#722F3E]" />
                  +3m
                </button>
                <button
                  onClick={() => handleAction('end')}
                  className="px-3.5 py-1.5 bg-[#722F3E] hover:bg-[#54212D] text-white rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <StopCircle className="w-3.5 h-3.5" />
                  Finalize Session
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-[#77736D] hover:text-[#292723] rounded-md hover:bg-[#E4DCD0]/60 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Security Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Rotating Token Card */}
            <div className="bg-[#F6F1E8] border border-[#E4DCD0] rounded-md p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-[#77736D] mb-1">
                  <span className="font-medium uppercase tracking-wider text-[10px]">BLE Beacon Salt</span>
                  <span className="font-mono text-[#722F3E] font-medium">{countdown}s</span>
                </div>
                <div className="text-2xl font-mono font-semibold tracking-wider text-[#722F3E] my-2">
                  {session.currentRotatingToken || 'SYNCING'}
                </div>
                <p className="text-[11px] text-[#77736D] leading-relaxed">
                  Rotates every 15s via classroom BLE packet to defeat screenshot relays.
                </p>
              </div>

              <div className="w-full bg-[#E4DCD0] h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-[#722F3E] h-full transition-all duration-1000"
                  style={{ width: `${(countdown / 15) * 100}%` }}
                />
              </div>
            </div>

            {/* Dynamic QR Card */}
            <div className="bg-[#F6F1E8] border border-[#E4DCD0] rounded-md p-3 flex items-center gap-3">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Dynamic Session QR"
                  className="w-24 h-24 rounded border border-[#E4DCD0] bg-white p-1 shrink-0"
                />
              ) : (
                <div className="w-24 h-24 rounded bg-white border border-[#E4DCD0] flex items-center justify-center text-[#77736D]">
                  <QrCode className="w-8 h-8" />
                </div>
              )}
              <div className="text-xs space-y-1">
                <div className="font-semibold text-[#292723]">Dynamic Classroom QR</div>
                <p className="text-[#77736D] text-[11px] leading-relaxed">
                  For devices without BLE hardware. Encodes the current 15s rotating salt.
                </p>
                <div className="text-[11px] text-[#722F3E] font-mono">
                  Gate: {session.minRssiThreshold} dBm
                </div>
              </div>
            </div>

            {/* Attendance Roster Summary */}
            <div className="bg-[#F6F1E8] border border-[#E4DCD0] rounded-md p-4 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#77736D] font-medium">
                    Verified Present
                  </span>
                  <div className="text-2xl font-semibold text-[#292723] mt-0.5 tabular-nums">
                    {session.stats.verifiedCount} / {session.stats.enrolledCount}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider text-[#77736D] font-medium">
                    Ratio
                  </span>
                  <div className="text-xl font-semibold text-[#42664D] mt-0.5 tabular-nums">
                    {verifiedPercent}%
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs pt-2 border-t border-[#E4DCD0] text-[#77736D]">
                <span className="text-[#8C6B2D] font-medium">
                  {session.stats.needsReviewCount} Review
                </span>
                <span>·</span>
                <span>
                  {session.stats.enrolledCount - session.stats.verifiedCount} Pending/Absent
                </span>
              </div>
            </div>
          </div>

          {/* Attendee Roster Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <h4 className="text-base font-semibold text-[#292723] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#77736D]" />
                Live Attendance Feed ({filteredRecords.length})
              </h4>
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#77736D]" />
                <input
                  type="text"
                  placeholder="Filter student or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#F6F1E8] border border-[#E4DCD0] rounded-md pl-8 pr-3 py-1.5 text-xs text-[#292723] placeholder-[#77736D] focus:outline-none focus:border-[#722F3E]"
                />
              </div>
            </div>

            {/* Attendance Table */}
            <div className="bg-[#FFFCF7] border border-[#E4DCD0] rounded-md overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F6F1E8] text-[#77736D] font-medium text-[11px] border-b border-[#E4DCD0]">
                  <tr>
                    <th className="py-2.5 px-4">Student</th>
                    <th className="py-2.5 px-4">Method</th>
                    <th className="py-2.5 px-4">Signal Telemetry</th>
                    <th className="py-2.5 px-4">Server Timestamp</th>
                    <th className="py-2.5 px-4">Verification</th>
                    <th className="py-2.5 px-4 text-right">Faculty Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4DCD0]">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[#77736D]">
                        No attendees currently logged in active window.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((r) => (
                      <tr key={r.id} className="hover:bg-[#F6F1E8]/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-[#292723]">{r.studentName}</div>
                          <div className="font-mono text-[11px] text-[#77736D]">{r.studentId}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono uppercase text-[#292723] bg-[#F6F1E8] px-2 py-0.5 rounded border border-[#E4DCD0] text-[11px]">
                            {r.method}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono tabular-nums text-[#77736D]">
                          {r.rssi ? `${r.rssi} dBm` : '—'}
                        </td>
                        <td className="py-3 px-4 font-mono text-[#77736D] tabular-nums">
                          {new Date(r.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
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
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedRecordForOverride(r)}
                            className="text-xs text-[#722F3E] hover:text-[#54212D] font-medium underline underline-offset-2 cursor-pointer"
                          >
                            Override
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Override Form */}
          {selectedRecordForOverride && (
            <div className="p-4 bg-[#F6F1E8] border border-[#E4DCD0] rounded-md space-y-3">
              <div className="flex justify-between items-center">
                <h5 className="text-xs font-semibold text-[#722F3E]">
                  Manual Faculty Override: {selectedRecordForOverride.studentName}
                </h5>
                <button
                  onClick={() => setSelectedRecordForOverride(null)}
                  className="text-[#77736D] hover:text-[#292723]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[#77736D] block mb-1">New Attendance State</label>
                  <select
                    value={overrideStatus}
                    onChange={(e: any) => setOverrideStatus(e.target.value)}
                    className="w-full bg-[#FFFCF7] border border-[#E4DCD0] rounded-md p-2 text-[#292723]"
                  >
                    <option value="verified">Verified Present</option>
                    <option value="excused">Excused (Duty Leave / Medical)</option>
                    <option value="failed">Absent / Voided</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#77736D] block mb-1">Mandatory Audit Justification</label>
                  <input
                    type="text"
                    placeholder="e.g. Physically verified in SJT-408 seat 14"
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    className="w-full bg-[#FFFCF7] border border-[#E4DCD0] rounded-md p-2 text-[#292723]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setSelectedRecordForOverride(null)}
                  className="px-3 py-1.5 bg-[#FFFCF7] border border-[#E4DCD0] text-[#292723] rounded-md text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleOverrideSubmit}
                  disabled={!overrideReason.trim()}
                  className="px-3 py-1.5 bg-[#722F3E] hover:bg-[#54212D] text-white rounded-md text-xs font-medium shadow-xs"
                >
                  Confirm & Audit Log
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
