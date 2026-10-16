import React, { useState, useEffect } from 'react';
import {
  Settings,
  ShieldAlert,
  CheckCircle2,
  FileSpreadsheet,
  Lock,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api.ts';
import type { AuditLogEntry, InstitutionPolicy, Course } from '../types/index.ts';

interface AdminDashboardProps {
  onOpenReports: () => void;
  onOpenAiInsights: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onOpenReports,
  onOpenAiInsights,
}) => {
  const [policy, setPolicy] = useState<InstitutionPolicy | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isSavingPolicy, setIsSavingPolicy] = useState(false);
  const [policySuccess, setPolicySuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const [pol, logs, crs] = await Promise.all([
        api.getPolicy(),
        api.getAuditLogs(),
        api.getCourses(),
      ]);
      setPolicy(pol);
      setAuditLogs(logs);
      setCourses(crs);
    } catch (err) {
      console.error('Failed loading registrar data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePolicySave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!policy) return;
    setIsSavingPolicy(true);
    setPolicySuccess(false);

    try {
      const res = await api.updatePolicy(policy);
      setPolicy(res.policy);
      setPolicySuccess(true);
      setTimeout(() => setPolicySuccess(false), 3000);
      loadData();
    } catch (err) {
      console.error('Policy update failed:', err);
    } finally {
      setIsSavingPolicy(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-[#292723]">
      {/* 1. Header */}
      <div className="border-b border-[#E4DCD0] pb-6 flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-medium text-[#77736D]">
            Office of the Registrar
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#292723] tracking-tight mt-1">
            Institutional Governance & Compliance
          </h2>
          <p className="text-xs text-[#77736D] mt-1">
            University-wide attendance regulations, beacon rotation security parameters, and immutable audit trails.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenReports}
            className="px-3.5 py-2 bg-[#FFFCF7] hover:bg-[#F6F1E8] border border-[#E4DCD0] text-[#292723] text-xs font-medium rounded-md transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#722F3E]" />
            Official Registry CSV
          </button>
          <button
            onClick={onOpenAiInsights}
            className="px-4 py-2 bg-[#722F3E] hover:bg-[#54212D] text-white text-xs font-medium rounded-md transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
          >
            Integrity Radar
          </button>
        </div>
      </div>

      {/* 2. Key Institutional Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#FFFCF7] border border-[#E4DCD0] rounded-md p-5 shadow-xs">
          <span className="text-xs font-medium text-[#77736D] block">
            Active Course Modules
          </span>
          <div className="text-3xl font-semibold text-[#292723] mt-1 tabular-nums">
            {courses.length}
          </div>
          <div className="text-xs text-[#77736D] mt-1 font-mono">Curriculum Sections</div>
        </div>

        <div className="bg-[#FFFCF7] border border-[#E4DCD0] rounded-md p-5 shadow-xs">
          <span className="text-xs font-medium text-[#77736D] block">
            University Attendance Mean
          </span>
          <div className="text-3xl font-semibold text-[#42664D] mt-1 tabular-nums">
            82.4%
          </div>
          <div className="text-xs text-[#77736D] mt-1 font-mono">Above 75% requirement</div>
        </div>

        <div className="bg-[#FFFCF7] border border-[#E4DCD0] rounded-md p-5 shadow-xs">
          <span className="text-xs font-medium text-[#77736D] block">
            Low Attendance Alerts
          </span>
          <div className="text-3xl font-semibold text-[#722F3E] mt-1 tabular-nums">
            1 Student
          </div>
          <div className="text-xs text-[#77736D] mt-1 font-mono">Tracking under 65% bar</div>
        </div>

        <div className="bg-[#FFFCF7] border border-[#E4DCD0] rounded-md p-5 shadow-xs">
          <span className="text-xs font-medium text-[#77736D] block">
            Logged Audit Events
          </span>
          <div className="text-3xl font-semibold text-[#292723] mt-1 tabular-nums">
            {auditLogs.length}
          </div>
          <div className="text-xs text-[#77736D] mt-1 font-mono">Immutable ledger entries</div>
        </div>
      </div>

      {/* 3. Institutional Policy Configuration */}
      <div className="bg-[#FFFCF7] border border-[#E4DCD0] rounded-md p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-[#E4DCD0]">
          <div>
            <h3 className="text-lg font-semibold text-[#292723]">
              University Attendance Regulations
            </h3>
            <p className="text-xs text-[#77736D]">
              Formal criteria governing examination eligibility and beacon cryptographic rotation.
            </p>
          </div>
          {policySuccess && (
            <span className="text-xs text-[#42664D] flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-4 h-4" /> Policy Saved & Audit Logged
            </span>
          )}
        </div>

        {policy && (
          <form onSubmit={handlePolicySave} className="pt-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold text-[#292723] mb-1.5">
                  Minimum Attendance Threshold (%)
                </label>
                <input
                  type="number"
                  min={50}
                  max={95}
                  value={policy.minimumAttendanceThreshold}
                  onChange={(e) =>
                    setPolicy({ ...policy, minimumAttendanceThreshold: Number(e.target.value) })
                  }
                  className="w-full bg-[#F6F1E8] border border-[#E4DCD0] rounded-md p-2.5 text-xs text-[#292723] font-mono focus:outline-none focus:border-[#722F3E]"
                />
                <span className="text-[11px] text-[#77736D] mt-1 block">Standard examination eligibility</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#292723] mb-1.5">
                  Critical Warning Threshold (%)
                </label>
                <input
                  type="number"
                  min={40}
                  max={75}
                  value={policy.criticalWarningThreshold}
                  onChange={(e) =>
                    setPolicy({ ...policy, criticalWarningThreshold: Number(e.target.value) })
                  }
                  className="w-full bg-[#F6F1E8] border border-[#E4DCD0] rounded-md p-2.5 text-xs text-[#292723] font-mono focus:outline-none focus:border-[#722F3E]"
                />
                <span className="text-[11px] text-[#77736D] mt-1 block">Triggers mandatory academic alert</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#292723] mb-1.5">
                  BLE Token Rotation Cadence (Seconds)
                </label>
                <input
                  type="number"
                  min={5}
                  max={60}
                  value={policy.tokenRotationIntervalSeconds}
                  onChange={(e) =>
                    setPolicy({ ...policy, tokenRotationIntervalSeconds: Number(e.target.value) })
                  }
                  className="w-full bg-[#F6F1E8] border border-[#E4DCD0] rounded-md p-2.5 text-xs text-[#292723] font-mono focus:outline-none focus:border-[#722F3E]"
                />
                <span className="text-[11px] text-[#77736D] mt-1 block">Prevents replay / proxy forwarding</span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-6 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={policy.allowQrFallback}
                  onChange={(e) => setPolicy({ ...policy, allowQrFallback: e.target.checked })}
                  className="w-4 h-4 accent-[#722F3E] rounded"
                />
                <span className="text-[#292723]">Permit Faculty Dynamic QR Code Fallback Mode</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={policy.allowStudentCorrectionRequests}
                  onChange={(e) =>
                    setPolicy({ ...policy, allowStudentCorrectionRequests: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#722F3E] rounded"
                />
                <span className="text-[#292723]">Allow Student Attendance Correction Appeals</span>
              </label>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSavingPolicy}
                className="px-4 py-2 bg-[#722F3E] hover:bg-[#54212D] text-white rounded-md text-xs font-medium transition-colors cursor-pointer shadow-xs"
              >
                {isSavingPolicy ? 'Saving Regulations...' : 'Save Institutional Regulations'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 4. Immutable Security Audit Ledger */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-[#292723]">
              Security & Attendance Audit Ledger
            </h3>
            <p className="text-xs text-[#77736D]">
              Cryptographically timestamped, append-only security history of administrative and attendance interventions.
            </p>
          </div>
          <span className="text-xs text-[#77736D] font-mono">Append-Only Registry</span>
        </div>

        <div className="bg-[#FFFCF7] border border-[#E4DCD0] rounded-md overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F6F1E8] text-[#77736D] border-b border-[#E4DCD0] font-medium text-[11px]">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Authorized Actor</th>
                  <th className="py-3 px-4">Action Identifier</th>
                  <th className="py-3 px-4">Scope</th>
                  <th className="py-3 px-4">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4DCD0]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F6F1E8]/50 transition-colors">
                    <td className="py-3 px-4 font-mono text-[#77736D] text-[11px] whitespace-nowrap tabular-nums">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-semibold text-[#292723]">{log.actorName}</span>{' '}
                      <span className="text-[10px] text-[#77736D] uppercase">({log.actorRole})</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="bg-[#F6F1E8] border border-[#E4DCD0] px-2 py-0.5 rounded font-mono text-[#722F3E] text-[11px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 uppercase text-[#77736D] text-[11px] font-mono">
                      {log.targetType}
                    </td>
                    <td className="py-3 px-4 text-[#292723] text-xs">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
