import React, { useState, useEffect } from 'react';
import {
  X,
  Activity,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  ShieldAlert,
  HeartHandshake,
  RefreshCw,
  Info,
} from 'lucide-react';
import { api } from '../services/api.ts';
import type { AiAttendanceAnalysis } from '../types/index.ts';

interface AiIntelligenceModalProps {
  onClose: () => void;
}

export const AiIntelligenceModal: React.FC<AiIntelligenceModalProps> = ({ onClose }) => {
  const [analysis, setAnalysis] = useState<AiAttendanceAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInsights = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAiInsights();
      setAnalysis(data);
    } catch (err) {
      console.error('Failed fetching AI insights:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#292723]/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FFFCF7] border border-[#E4DCD0] rounded-md max-w-3xl w-full my-8 overflow-hidden shadow-xl flex flex-col max-h-[90vh] text-[#292723]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E4DCD0] flex items-center justify-between shrink-0 bg-[#F6F1E8]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-[#722F3E] text-white flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-[#292723]">
                  Attendance Intelligence & Integrity Radar
                </h3>
                {analysis?.source && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FFFCF7] border border-[#E4DCD0] text-[#77736D]">
                    {analysis.source}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#77736D]">
                Machine-assisted proxy pattern telemetry and non-punitive academic intervention guidance.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#77736D] hover:text-[#292723] rounded-md hover:bg-[#E4DCD0]/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {isLoading ? (
            <div className="py-16 text-center text-[#77736D] space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#722F3E]" />
              <p className="text-xs font-medium text-[#77736D]">Analyzing collegiate attendance patterns...</p>
            </div>
          ) : analysis ? (
            <>
              {/* Executive Assessment Card */}
              <div className="bg-[#F6F1E8] border border-[#E4DCD0] rounded-md p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#77736D]">
                    Collegiate Integrity Assessment
                  </span>
                  <span
                    className={`text-[11px] font-medium uppercase tracking-wider px-2.5 py-0.5 rounded ${
                      analysis.overallRiskLevel === 'elevated'
                        ? 'bg-[#F0E3E5] text-[#722F3E] border border-[#722F3E]/20'
                        : analysis.overallRiskLevel === 'moderate'
                        ? 'bg-[#F8F3E9] text-[#8C6B2D] border border-[#8C6B2D]/20'
                        : 'bg-[#EBF2ED] text-[#42664D] border border-[#42664D]/20'
                    }`}
                  >
                    Risk Level: {analysis.overallRiskLevel}
                  </span>
                </div>
                <p className="text-xs text-[#292723] leading-relaxed font-sans">{analysis.summary}</p>
              </div>

              {/* Detected Anomalies */}
              <div className="space-y-3">
                <h4 className="text-base font-semibold text-[#292723] flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#722F3E]" />
                  Integrity & Signal Telemetry Indicators
                </h4>

                <div className="space-y-3">
                  {analysis.suspiciousPatterns.map((pat, idx) => (
                    <div
                      key={idx}
                      className="bg-[#FFFCF7] border border-[#E4DCD0] rounded-md p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#292723]">{pat.flag}</span>
                        <span className="text-[#77736D] font-mono text-[11px]">
                          Affected Records: <strong className="text-[#292723]">{pat.affectedCount}</strong>
                        </span>
                      </div>
                      <p className="text-[#77736D] leading-relaxed">{pat.description}</p>
                      <div className="p-2.5 bg-[#F6F1E8] border border-[#E4DCD0] rounded text-[#292723] font-mono text-[11px]">
                        <strong className="text-[#77736D]">Evidence Log:</strong> {pat.evidence}
                      </div>
                      <div className="text-[#722F3E] font-medium pt-1">
                        <strong>Faculty Recommendation:</strong> {pat.recommendedAction}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chronic Low Attendance Watchlist */}
              <div className="space-y-3">
                <h4 className="text-base font-semibold text-[#292723] flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-[#722F3E]" />
                  At-Risk Student Care Watchlist (&lt;75% Attendance)
                </h4>

                <div className="bg-[#FFFCF7] border border-[#E4DCD0] rounded-md overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F6F1E8] text-[#77736D] font-medium text-[11px] border-b border-[#E4DCD0]">
                      <tr>
                        <th className="py-2.5 px-4">Student</th>
                        <th className="py-2.5 px-4">Course</th>
                        <th className="py-2.5 px-4">Current Standing</th>
                        <th className="py-2.5 px-4">Academic Intervention</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4DCD0]">
                      {analysis.chronicLowAttendanceStudents.map((stu, idx) => (
                        <tr key={idx} className="hover:bg-[#F6F1E8]/50">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-[#292723]">{stu.studentName}</div>
                            <div className="font-mono text-[11px] text-[#77736D]">{stu.studentId}</div>
                          </td>
                          <td className="py-3 px-4 font-mono text-[#77736D]">{stu.courseCode}</td>
                          <td className="py-3 px-4 font-semibold text-[#722F3E] text-sm tabular-nums">
                            {stu.attendanceRate}% ({stu.missedSessions} missed)
                          </td>
                          <td className="py-3 px-4 text-[#292723]">{stu.recommendedIntervention}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Course Trajectories */}
              <div className="space-y-3">
                <h4 className="text-base font-semibold text-[#292723]">Course Absence Trajectories</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {analysis.courseAbsenceTrends.map((c, idx) => (
                    <div key={idx} className="bg-[#F6F1E8] border border-[#E4DCD0] rounded-md p-3.5 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-bold text-[#292723]">{c.courseCode}</span>
                        <span
                          className={`flex items-center gap-1 font-semibold ${
                            c.trend === 'improving'
                              ? 'text-[#42664D]'
                              : c.trend === 'declining'
                              ? 'text-[#722F3E]'
                              : 'text-[#77736D]'
                          }`}
                        >
                          {c.trend === 'improving' ? (
                            <TrendingUp className="w-3.5 h-3.5" />
                          ) : (
                            <TrendingDown className="w-3.5 h-3.5" />
                          )}
                          {c.averageAttendance}%
                        </span>
                      </div>
                      <p className="text-[11px] text-[#77736D] mt-1 leading-snug">{c.note}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ethical Disclaimer */}
              <div className="text-[11px] text-[#77736D] bg-[#F6F1E8] border border-[#E4DCD0] rounded-md p-3 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-[#722F3E] shrink-0 mt-0.5" />
                <span>
                  <strong>Ethical AI Governance Policy:</strong> Machine recommendations serve strictly as advisory telemetry for faculty advising. Automated grade deductions, fraud declarations, or disciplinary measures are strictly prohibited without human faculty review.
                </span>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
