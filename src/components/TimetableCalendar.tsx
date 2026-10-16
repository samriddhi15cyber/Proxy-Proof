import React, { useState, useEffect } from 'react';
import { CalendarDays, Clock, MapPin, AlertCircle, Play, Radio } from 'lucide-react';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import type { AttendanceSession } from '../types/index.ts';

interface TimetableCalendarProps {
  onJoinSession?: (session: AttendanceSession) => void;
  onLaunchSession?: (courseId: string) => void;
}

export const TimetableCalendar: React.FC<TimetableCalendarProps> = ({
  onJoinSession,
  onLaunchSession,
}) => {
  const { role } = useAuth();
  const [timetable, setTimetable] = useState<any[]>([]);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [activeSessions, setActiveSessions] = useState<AttendanceSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getTimetable(), api.getActiveSessions()])
      .then(([tData, sData]) => {
        setTimetable(tData.timetable || []);
        setConflicts(tData.conflicts || []);
        setActiveSessions(sData || []);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-[#292723]">
      <div className="border-b border-[#E4DCD0] pb-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-medium text-[#77736D]">
            Academic Schedule
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#292723] tracking-tight mt-1">
            Weekly Instructional Schedule
          </h2>
          <p className="text-xs text-[#77736D] mt-1">
            Verified classroom allocations with automated timetable collision detection.
          </p>
        </div>

        {activeSessions.length > 0 && (
          <div className="flex items-center gap-2 bg-[#FFFCF7] border border-[#E4DCD0] rounded-md px-3.5 py-2 text-xs shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#42664D]" />
            <span className="text-[#77736D]">
              Live Lecture: <strong className="text-[#722F3E]">{activeSessions[0].courseCode}</strong> in {activeSessions[0].room}
            </span>
          </div>
        )}
      </div>

      {conflicts.length > 0 && (
        <div className="p-4 bg-[#F8F3E9] border border-[#C2A46D]/40 rounded-md space-y-1 text-xs">
          <div className="flex items-center gap-2 text-[#722F3E] font-medium">
            <AlertCircle className="w-4 h-4" />
            Timetable Overlap Notice
          </div>
          {conflicts.map((c, i) => (
            <div key={i} className="text-[#292723]">
              {c.message}
            </div>
          ))}
        </div>
      )}

      {/* Grid of Days */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {days.map((day) => {
          const dayClasses = timetable.filter((t) => t.day === day);
          return (
            <div
              key={day}
              className="bg-[#FFFCF7] border border-[#E4DCD0] rounded-md p-4 flex flex-col space-y-3 shadow-xs"
            >
              <div className="pb-2 border-b border-[#E4DCD0] text-xs font-semibold text-[#292723]">
                {day}
              </div>

              {dayClasses.length === 0 ? (
                <div className="py-8 text-center text-[#77736D] text-xs font-medium">
                  No classes scheduled
                </div>
              ) : (
                <div className="space-y-3">
                  {dayClasses.map((item, idx) => {
                    const isLive = activeSessions.some((s) => s.courseCode === item.courseCode);
                    const matchedSession = activeSessions.find((s) => s.courseCode === item.courseCode);

                    return (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-md border text-xs flex flex-col justify-between transition-all ${
                          isLive
                            ? 'bg-[#F0E3E5] border-[#722F3E]/40 shadow-xs'
                            : 'bg-[#F6F1E8]/60 border-[#E4DCD0] hover:border-[#C2A46D]'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-mono text-[#722F3E] font-medium">{item.courseCode}</span>
                            <span className="font-mono text-[#77736D] tabular-nums">{item.startTime}</span>
                          </div>
                          <div className="font-semibold text-[#292723] leading-snug">{item.courseTitle}</div>
                          <div className="text-[11px] text-[#77736D] flex items-center gap-1 pt-1">
                            <MapPin className="w-3 h-3 text-[#77736D]" />
                            {item.room} · {item.instructorName}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="mt-3 pt-2.5 border-t border-[#E4DCD0] flex items-center justify-between">
                          {isLive && matchedSession && role === 'student' ? (
                            <button
                              onClick={() => onJoinSession?.(matchedSession)}
                              className="w-full py-1.5 bg-[#722F3E] hover:bg-[#54212D] text-white rounded text-[11px] font-medium flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-xs"
                            >
                              <Radio className="w-3 h-3" />
                              Verify Presence
                            </button>
                          ) : role === 'teacher' ? (
                            <button
                              onClick={() => onLaunchSession?.(item.courseId)}
                              className="text-[11px] text-[#722F3E] hover:text-[#54212D] font-medium flex items-center gap-1 cursor-pointer"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              Start Session
                            </button>
                          ) : (
                            <span className="text-[10px] text-[#77736D] font-mono tabular-nums">
                              {item.startTime} – {item.endTime}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
