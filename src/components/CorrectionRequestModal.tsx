import React, { useState } from 'react';
import { X, Send, FileText, AlertCircle } from 'lucide-react';
import { api } from '../services/api.ts';
import type { Course, CorrectionRequest } from '../types/index.ts';

interface CorrectionRequestModalProps {
  courses: Course[];
  onClose: () => void;
  onSuccess: (correction: CorrectionRequest) => void;
}

export const CorrectionRequestModal: React.FC<CorrectionRequestModalProps> = ({
  courses,
  onClose,
  onSuccess,
}) => {
  const [courseId, setCourseId] = useState(courses[0]?.id || '');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [requestedStatus, setRequestedStatus] = useState<'excused' | 'verified'>('excused');
  const [reason, setReason] = useState('');
  const [documentationUrl, setDocumentationUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 10) {
      setError('Please provide a substantive justification (at least 10 characters).');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await api.submitCorrection({
        courseId,
        sessionDate,
        requestedStatus,
        reason: reason.trim(),
        documentationUrl: documentationUrl.trim() || undefined,
      });

      if (res.success && res.correction) {
        onSuccess(res.correction);
      }
    } catch (err: any) {
      setError(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#292723]/50 backdrop-blur-xs">
      <div className="bg-[#FFFCF7] border border-[#E4DCD0] rounded-md max-w-lg w-full overflow-hidden shadow-xl text-[#292723]">
        <div className="px-6 py-4 border-b border-[#E4DCD0] flex items-center justify-between bg-[#F6F1E8]">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#722F3E]" />
            <h3 className="text-lg font-semibold text-[#292723]">
              Attendance Correction Petition
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#77736D] hover:text-[#292723] rounded-md hover:bg-[#E4DCD0]/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-[#F6F1E8] border border-[#E4DCD0] rounded-md text-xs text-[#77736D] leading-relaxed">
            Petitions are recorded in the university registrar ledger and submitted directly to the course instructor for formal audit review.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#292723] mb-1.5">
                Curriculum Module
              </label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full bg-[#F6F1E8] border border-[#E4DCD0] rounded-md p-2.5 text-xs text-[#292723] focus:outline-none focus:border-[#722F3E]"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} · {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#292723] mb-1.5">
                Session Date
              </label>
              <input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                required
                className="w-full bg-[#F6F1E8] border border-[#E4DCD0] rounded-md p-2 text-xs text-[#292723] focus:outline-none focus:border-[#722F3E]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#292723] mb-1.5">
              Requested Status Change
            </label>
            <select
              value={requestedStatus}
              onChange={(e: any) => setRequestedStatus(e.target.value)}
              className="w-full bg-[#F6F1E8] border border-[#E4DCD0] rounded-md p-2.5 text-xs text-[#292723] focus:outline-none focus:border-[#722F3E]"
            >
              <option value="excused">Excused (University Event / Medical / Official Duty)</option>
              <option value="verified">Verified Present (Physically present; device failure)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#292723] mb-1.5">
              Substantive Justification
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Detail reasons, e.g. Officially deputized to represent the university at ACM finals with dean authorization; or Bluetooth radio driver malfunction in SJT-408..."
              required
              className="w-full bg-[#F6F1E8] border border-[#E4DCD0] rounded-md p-2.5 text-xs text-[#292723] placeholder-[#77736D] focus:outline-none focus:border-[#722F3E]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#292723] mb-1.5">
              Documentation URL (Optional)
            </label>
            <input
              type="url"
              value={documentationUrl}
              onChange={(e) => setDocumentationUrl(e.target.value)}
              placeholder="https://drive.univ.edu/medical-cert-2026.pdf"
              className="w-full bg-[#F6F1E8] border border-[#E4DCD0] rounded-md p-2 text-xs text-[#292723] placeholder-[#77736D] focus:outline-none focus:border-[#722F3E]"
            />
          </div>

          {error && (
            <div className="text-[#722F3E] text-xs bg-[#F0E3E5] border border-[#722F3E]/20 p-2.5 rounded-md flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
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
              disabled={submitting}
              className="px-4 py-2 bg-[#722F3E] hover:bg-[#54212D] disabled:opacity-50 text-white rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              {submitting ? 'Submitting Petition...' : 'Submit to Faculty'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
