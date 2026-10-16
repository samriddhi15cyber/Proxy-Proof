import React, { useState, useEffect } from 'react';
import {
  X,
  Radio,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Signal,
  Camera,
  Info,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../services/api.ts';
import type { AttendanceSession, AttendanceRecord } from '../types/index.ts';

interface JoinAttendanceModalProps {
  session: AttendanceSession;
  onClose: () => void;
  onSuccess: (record: AttendanceRecord) => void;
}

export const JoinAttendanceModal: React.FC<JoinAttendanceModalProps> = ({
  session,
  onClose,
  onSuccess,
}) => {
  const [method, setMethod] = useState<'ble' | 'qr'>('ble');
  const [isScanning, setIsScanning] = useState(false);
  const [scanSamples, setScanSamples] = useState<number[]>([]);
  const [currentRssi, setCurrentRssi] = useState<number | null>(null);
  const [detectedToken, setDetectedToken] = useState<string>('');
  const [manualQrCode, setManualQrCode] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ record?: AttendanceRecord; message?: string } | null>(null);

  // Multi-sample BLE scan simulation
  const startBleScan = async () => {
    setIsScanning(true);
    setError(null);
    setScanSamples([]);
    setCurrentRssi(null);

    try {
      const details = await api.getSession(session.id);
      const activeToken = details.session.currentRotatingToken;

      const baseRssi = -68; // In-room signal strength
      const jitterValues = [
        baseRssi + Math.floor(Math.random() * 6 - 3),
        baseRssi + Math.floor(Math.random() * 8 - 4),
        baseRssi + Math.floor(Math.random() * 6 - 3),
      ];

      setTimeout(() => {
        setScanSamples([jitterValues[0]]);
        setCurrentRssi(jitterValues[0]);
      }, 500);

      setTimeout(() => {
        setScanSamples((prev) => [...prev, jitterValues[1]]);
        setCurrentRssi(jitterValues[1]);
      }, 1000);

      setTimeout(() => {
        const finalSamples = [...jitterValues];
        setScanSamples(finalSamples);
        const avgRssi = Math.round(finalSamples.reduce((a, b) => a + b, 0) / finalSamples.length);
        setCurrentRssi(avgRssi);
        setDetectedToken(activeToken);
        setIsScanning(false);
      }, 1600);
    } catch (err: any) {
      setIsScanning(false);
      setError(err.message || 'Failed connecting to active classroom beacon');
    }
  };

  const handleSubmitAttendance = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const tokenToUse = method === 'ble' ? detectedToken : manualQrCode.trim();
      if (!tokenToUse) {
        throw new Error(
          method === 'ble'
            ? 'No BLE beacon signal detected yet. Run proximity scan.'
            : 'Please enter the 8-character rotating token.'
        );
      }

      const res = await api.verifyAttendance(session.id, {
        token: tokenToUse,
        method,
        rssi: method === 'ble' && currentRssi !== null ? currentRssi : undefined,
        deviceFingerprint: `CLIENT-${navigator.userAgent.slice(0, 30)}`,
      });

      setResult({ record: res.record, message: res.message });
      onSuccess(res.record);
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#292723]/50 backdrop-blur-xs">
      <div className="bg-[#FFFCF7] border border-[#E4DCD0] rounded-md max-w-lg w-full overflow-hidden shadow-lg text-[#292723]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E4DCD0] flex items-center justify-between bg-[#F6F1E8]">
          <div>
            <h3 className="text-lg font-semibold text-[#292723]">
              Verify Classroom Attendance
            </h3>
            <p className="text-xs text-[#77736D]">
              {session.courseCode} · Venue: {session.room} · {session.instructorName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#77736D] hover:text-[#292723] rounded-md hover:bg-[#E4DCD0]/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Method Selector Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#F6F1E8] border border-[#E4DCD0] rounded-md">
            <button
              onClick={() => {
                setMethod('ble');
                setError(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded transition-colors cursor-pointer ${
                method === 'ble'
                  ? 'bg-[#722F3E] text-white shadow-xs'
                  : 'text-[#77736D] hover:text-[#292723]'
              }`}
            >
              <Radio className="w-4 h-4" />
              Bluetooth Proximity Radar
            </button>
            {session.allowedMethods.includes('qr') && (
              <button
                onClick={() => {
                  setMethod('qr');
                  setError(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded transition-colors cursor-pointer ${
                  method === 'qr'
                    ? 'bg-[#722F3E] text-white shadow-xs'
                    : 'text-[#77736D] hover:text-[#292723]'
                }`}
              >
                <QrCode className="w-4 h-4" />
                Dynamic Token Code
              </button>
            )}
          </div>

          {/* Success View */}
          {result?.record ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#EBF2ED] border border-[#42664D]/30 flex items-center justify-center text-[#42664D]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-xl font-semibold text-[#292723]">
                  Physical Attendance Verified
                </h4>
                <p className="text-xs text-[#77736D] mt-1">{result.message}</p>
              </div>

              <div className="bg-[#F6F1E8] border border-[#E4DCD0] rounded-md p-4 text-left space-y-2 text-xs">
                <div className="flex justify-between text-[#77736D]">
                  <span>Verification Method:</span>
                  <span className="font-mono text-[#292723] uppercase font-medium">
                    {result.record.method}
                  </span>
                </div>
                {result.record.rssi && (
                  <div className="flex justify-between text-[#77736D]">
                    <span>Signal Strength (RSSI):</span>
                    <span className="font-mono text-[#42664D] font-medium">
                      {result.record.rssi} dBm (In-Room Proximity)
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-[#77736D]">
                  <span>Official Status:</span>
                  <span className="font-medium text-[#42664D] capitalize">
                    {result.record.status}
                  </span>
                </div>
                <div className="flex justify-between text-[#77736D]">
                  <span>Server Timestamp:</span>
                  <span className="font-mono text-[#292723] tabular-nums">
                    {new Date(result.record.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 bg-[#722F3E] hover:bg-[#54212D] text-white font-medium rounded-md text-xs transition-colors shadow-xs cursor-pointer"
              >
                Close Register
              </button>
            </div>
          ) : (
            <>
              {/* Method A: BLE Radar */}
              {method === 'ble' && (
                <div className="space-y-4">
                  <div className="bg-[#F6F1E8] border border-[#E4DCD0] rounded-md p-5 text-center space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-full bg-[#FFFCF7] border border-[#E4DCD0] flex items-center justify-center text-[#722F3E]">
                      <Radio className={`w-6 h-6 ${isScanning ? 'animate-pulse text-[#722F3E]' : ''}`} />
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-[#292723]">
                        {isScanning
                          ? 'Measuring Classroom Signal Samples...'
                          : detectedToken
                          ? 'Classroom Beacon Signal Locked'
                          : 'Ready to Measure Proximity'}
                      </div>
                      <p className="text-[11px] text-[#77736D] mt-1">
                        Proximity Gate Threshold:{' '}
                        <span className="font-mono font-medium text-[#292723]">
                          {session.minRssiThreshold} dBm
                        </span>
                      </p>
                    </div>

                    {/* RSSI Gauge */}
                    {currentRssi !== null && (
                      <div className="pt-3 border-t border-[#E4DCD0] space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#77736D] flex items-center gap-1">
                            <Signal className="w-3.5 h-3.5 text-[#722F3E]" /> Mean Sample RSSI:
                          </span>
                          <span className="font-mono font-semibold text-[#42664D] text-sm tabular-nums">
                            {currentRssi} dBm
                          </span>
                        </div>

                        <div className="w-full bg-[#E4DCD0]/60 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              currentRssi >= -75
                                ? 'bg-[#42664D]'
                                : currentRssi >= session.minRssiThreshold
                                ? 'bg-[#C2A46D]'
                                : 'bg-[#722F3E]'
                            }`}
                            style={{
                              width: `${Math.min(100, Math.max(10, ((currentRssi + 100) / 60) * 100))}%`,
                            }}
                          />
                        </div>

                        <div className="text-[10px] text-[#77736D] flex justify-between font-mono">
                          <span>Far (-100 dBm)</span>
                          <span className="text-[#42664D] font-medium font-sans">
                            Physical Presence Confirmed
                          </span>
                          <span>Near (-40 dBm)</span>
                        </div>

                        {detectedToken && (
                          <div className="text-xs font-mono text-[#292723] bg-[#FFFCF7] border border-[#E4DCD0] rounded px-3 py-1.5 mt-2 flex items-center justify-between">
                            <span className="text-[#77736D]">Rotating Beacon Salt:</span>
                            <span className="text-[#722F3E] font-semibold">{detectedToken}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={startBleScan}
                      disabled={isScanning || submitting}
                      className="flex-1 py-2.5 bg-[#FFFCF7] hover:bg-[#F6F1E8] text-[#292723] border border-[#E4DCD0] rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-[#722F3E]' : ''}`} />
                      {isScanning ? 'Sampling Proximity...' : detectedToken ? 'Rescan Beacon' : 'Scan BLE Signal'}
                    </button>

                    <button
                      onClick={handleSubmitAttendance}
                      disabled={!detectedToken || submitting || isScanning}
                      className="flex-1 py-2.5 bg-[#722F3E] hover:bg-[#54212D] disabled:opacity-50 text-white font-medium rounded-md text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      {submitting ? 'Verifying...' : 'Submit Verification'}
                    </button>
                  </div>

                  {/* Technical Callout */}
                  <div className="text-[11px] text-[#77736D] bg-[#F6F1E8] border border-[#E4DCD0] rounded-md p-3 flex items-start gap-2">
                    <Info className="w-4 h-4 text-[#722F3E] shrink-0 mt-0.5" />
                    <span>
                      <strong>Academic Integrity Notice:</strong> Bluetooth RSSI is subject to RF multipath fading and concrete attenuation. It serves as an approximate proximity boundary rather than biometric proof of physical identity.
                    </span>
                  </div>
                </div>
              )}

              {/* Method B: QR Code */}
              {method === 'qr' && (
                <div className="space-y-4">
                  <div className="bg-[#F6F1E8] border border-[#E4DCD0] rounded-md p-5 text-center space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-full bg-[#FFFCF7] border border-[#E4DCD0] flex items-center justify-center text-[#722F3E]">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#292723]">
                        Enter Projected Dynamic Token
                      </div>
                      <p className="text-[11px] text-[#77736D] mt-1">
                        Read the 8-character rotating token displayed by the faculty projector.
                      </p>
                    </div>

                    <div className="pt-2">
                      <input
                        type="text"
                        value={manualQrCode}
                        onChange={(e) => setManualQrCode(e.target.value.toUpperCase())}
                        maxLength={8}
                        placeholder="e.g. 7F4A2C91"
                        className="w-full bg-[#FFFCF7] border border-[#E4DCD0] rounded-md px-3 py-2 text-center text-lg font-mono font-semibold tracking-wider text-[#722F3E] placeholder-[#77736D]/60 focus:outline-none focus:border-[#722F3E]"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSubmitAttendance}
                    disabled={!manualQrCode.trim() || submitting}
                    className="w-full py-2.5 bg-[#722F3E] hover:bg-[#54212D] disabled:opacity-50 text-white font-medium rounded-md text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    {submitting ? 'Verifying Token...' : 'Verify Token Attendance'}
                  </button>
                </div>
              )}

              {/* Error Callout */}
              {error && (
                <div className="p-3 bg-[#F0E3E5] border border-[#722F3E]/30 rounded-md text-[#722F3E] text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
