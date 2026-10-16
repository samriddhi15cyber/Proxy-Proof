import React, { useState, useEffect } from 'react';
import { X, FileSpreadsheet, Download, Filter, Search } from 'lucide-react';
import { api } from '../services/api.ts';
import type { AttendanceRecord, Course } from '../types/index.ts';

interface ReportsModalProps {
  onClose: () => void;
}

export const ReportsModal: React.FC<ReportsModalProps> = ({ onClose }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getCourses(), api.getAttendanceHistory()])
      .then(([crs, recs]) => {
        setCourses(crs);
        setRecords(recs);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleCourseFilter = async (id: string) => {
    setSelectedCourseId(id);
    setIsLoading(true);
    try {
      const data = await api.getAttendanceHistory(id ? { courseId: id } : undefined);
      setRecords(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadCsv = () => {
    const url = `/api/reports/export.csv${selectedCourseId ? `?courseId=${selectedCourseId}` : ''}`;
    window.location.href = url;
  };

  const filteredRecords = records.filter(
    (r) =>
      r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.studentId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalVerified = records.filter((r) => r.status === 'verified').length;
  const bleCount = records.filter((r) => r.method === 'ble').length;
  const qrCount = records.filter((r) => r.method === 'qr').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#292723]/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FFFCF7] border border-[#E4DCD0] rounded-md max-w-4xl w-full my-8 overflow-hidden shadow-xl flex flex-col max-h-[90vh] text-[#292723]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E4DCD0] flex items-center justify-between shrink-0 bg-[#F6F1E8]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-[#722F3E] text-white flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#292723]">
                Official Registry Attendance Reports
              </h3>
              <p className="text-xs text-[#77736D]">
                RFC 4180 cryptographic timestamped exports for academic audit compliance.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCsv}
              className="px-3.5 py-1.5 bg-[#722F3E] hover:bg-[#54212D] text-white rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4" />
              Download CSV
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#77736D] hover:text-[#292723] rounded-md hover:bg-[#E4DCD0]/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters & Statistics Strip */}
        <div className="p-6 pb-4 border-b border-[#E4DCD0] bg-[#FFFCF7] space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-[#F6F1E8] border border-[#E4DCD0] p-3 rounded-md">
              <span className="text-[#77736D] text-[11px] font-medium block">
                Total Matching Records
              </span>
              <div className="text-2xl font-semibold text-[#292723] mt-0.5 tabular-nums">
                {records.length}
              </div>
            </div>
            <div className="bg-[#F6F1E8] border border-[#E4DCD0] p-3 rounded-md">
              <span className="text-[#77736D] text-[11px] font-medium block">
                Bluetooth Proximity Logs
              </span>
              <div className="text-2xl font-semibold text-[#722F3E] mt-0.5 tabular-nums">
                {bleCount}
              </div>
            </div>
            <div className="bg-[#F6F1E8] border border-[#E4DCD0] p-3 rounded-md">
              <span className="text-[#77736D] text-[11px] font-medium block">
                Dynamic QR Logs
              </span>
              <div className="text-2xl font-semibold text-[#42664D] mt-0.5 tabular-nums">
                {qrCount}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-[#77736D]" />
              <select
                value={selectedCourseId}
                onChange={(e) => handleCourseFilter(e.target.value)}
                className="bg-[#F6F1E8] border border-[#E4DCD0] text-[#292723] text-xs rounded-md px-3 py-1.5 focus:outline-none focus:border-[#722F3E]"
              >
                <option value="">All Curriculum Modules</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} · {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#77736D]" />
              <input
                type="text"
                placeholder="Search candidate name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F6F1E8] border border-[#E4DCD0] rounded-md pl-8 pr-3 py-1.5 text-xs text-[#292723] placeholder-[#77736D] focus:outline-none focus:border-[#722F3E]"
              />
            </div>
          </div>
        </div>

        {/* Table Body */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="bg-[#FFFCF7] border border-[#E4DCD0] rounded-md overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F6F1E8] text-[#77736D] font-medium text-[11px] border-b border-[#E4DCD0]">
                <tr>
                  <th className="py-2.5 px-4">Candidate</th>
                  <th className="py-2.5 px-4">Module</th>
                  <th className="py-2.5 px-4">Channel</th>
                  <th className="py-2.5 px-4">Signal RSSI</th>
                  <th className="py-2.5 px-4">Registry Timestamp</th>
                  <th className="py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4DCD0]">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#77736D]">
                      No records matched query criteria.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-[#F6F1E8]/50">
                      <td className="py-2.5 px-4">
                        <div className="font-semibold text-[#292723]">{r.studentName}</div>
                        <div className="font-mono text-[11px] text-[#77736D]">{r.studentId}</div>
                      </td>
                      <td className="py-2.5 px-4 font-mono text-[#77736D]">{r.courseCode}</td>
                      <td className="py-2.5 px-4 uppercase text-[11px] font-mono">{r.method}</td>
                      <td className="py-2.5 px-4 font-mono tabular-nums text-[#77736D]">
                        {r.rssi ? `${r.rssi} dBm` : '—'}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-[#77736D] text-[11px] tabular-nums">
                        {new Date(r.timestamp).toLocaleDateString()} {new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-2.5 px-4">
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
