import React, { useState, useEffect } from 'react';
import {
  X,
  Radio,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Smartphone,
  Cpu,
} from 'lucide-react';

interface BleDiagnosticModalProps {
  onClose: () => void;
}

export const BleDiagnosticModal: React.FC<BleDiagnosticModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'probe' | 'android_architecture'>('probe');
  const [probeResults, setProbeResults] = useState<{
    hasNavigatorBluetooth: boolean;
    isSecureContext: boolean;
    platform: string;
    userAgent: string;
    canBroadcastWeb: boolean;
  } | null>(null);

  useEffect(() => {
    const hasBt = typeof navigator !== 'undefined' && 'bluetooth' in navigator;
    const isSecure = typeof window !== 'undefined' && window.isSecureContext;
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';
    const plat = typeof navigator !== 'undefined' ? (navigator as any).userAgentData?.platform || navigator.platform || 'Unknown' : 'Unknown';

    setProbeResults({
      hasNavigatorBluetooth: hasBt,
      isSecureContext: isSecure,
      platform: plat,
      userAgent: ua,
      canBroadcastWeb: false, // Web Bluetooth specification intentionally forbids advertising
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#292723]/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FFFCF7] border border-[#E4DCD0] rounded-md max-w-3xl w-full my-8 overflow-hidden shadow-xl flex flex-col max-h-[90vh] text-[#292723]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E4DCD0] flex items-center justify-between shrink-0 bg-[#F6F1E8]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-[#722F3E] text-white flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#292723]">
                BLE Hardware & Proximity Diagnostic Console
              </h3>
              <p className="text-xs text-[#77736D]">
                Client Bluetooth telemetry and native Android peripheral advertising specification.
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

        {/* Tab Strip */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-[#E4DCD0] bg-[#F6F1E8]">
          <button
            onClick={() => setActiveTab('probe')}
            className={`pb-3 px-3 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'probe'
                ? 'border-[#722F3E] text-[#722F3E] font-medium'
                : 'border-transparent text-[#77736D] hover:text-[#292723]'
            }`}
          >
            Hardware & Browser Runtime Probe
          </button>
          <button
            onClick={() => setActiveTab('android_architecture')}
            className={`pb-3 px-3 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'android_architecture'
                ? 'border-[#722F3E] text-[#722F3E] font-medium'
                : 'border-transparent text-[#77736D] hover:text-[#292723]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Android Native BLE Architecture
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {activeTab === 'probe' ? (
            <div className="space-y-5">
              {/* Telemetry Table */}
              <div className="bg-[#FFFCF7] border border-[#E4DCD0] rounded-md overflow-hidden shadow-xs">
                <table className="w-full text-left">
                  <thead className="bg-[#F6F1E8] text-[#77736D] font-medium text-[11px] border-b border-[#E4DCD0]">
                    <tr>
                      <th className="py-2.5 px-4">Telemetry Parameter</th>
                      <th className="py-2.5 px-4">Detected Value</th>
                      <th className="py-2.5 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4DCD0] font-mono">
                    <tr>
                      <td className="py-3 px-4 font-sans font-medium text-[#292723]">
                        Web Bluetooth API (navigator.bluetooth)
                      </td>
                      <td className="py-3 px-4 text-[#77736D]">
                        {probeResults?.hasNavigatorBluetooth ? 'Supported' : 'Not Available (or Sandbox Blocked)'}
                      </td>
                      <td className="py-3 px-4">
                        {probeResults?.hasNavigatorBluetooth ? (
                          <span className="text-[#42664D] flex items-center gap-1 font-sans font-medium">
                            <CheckCircle2 className="w-4 h-4" /> Ready for Scanning
                          </span>
                        ) : (
                          <span className="text-[#8C6B2D] flex items-center gap-1 font-sans font-medium">
                            <AlertTriangle className="w-4 h-4" /> Fallback Mode Active
                          </span>
                        )}
                      </td>
                    </tr>

                    <tr>
                      <td className="py-3 px-4 font-sans font-medium text-[#292723]">
                        Secure Origin Context (HTTPS)
                      </td>
                      <td className="py-3 px-4 text-[#77736D]">
                        {probeResults?.isSecureContext ? 'Secure Origin' : 'Insecure / Local HTTP'}
                      </td>
                      <td className="py-3 px-4">
                        {probeResults?.isSecureContext ? (
                          <span className="text-[#42664D] flex items-center gap-1 font-sans font-medium">
                            <CheckCircle2 className="w-4 h-4" /> Verified
                          </span>
                        ) : (
                          <span className="text-[#722F3E] flex items-center gap-1 font-sans font-medium">
                            <XCircle className="w-4 h-4" /> Required for Hardware
                          </span>
                        )}
                      </td>
                    </tr>

                    <tr>
                      <td className="py-3 px-4 font-sans font-medium text-[#292723]">
                        Browser Peripheral Beacon Broadcasting
                      </td>
                      <td className="py-3 px-4 text-[#77736D]">
                        Prohibited by W3C Web Bluetooth Spec
                      </td>
                      <td className="py-3 px-4 font-sans text-[#722F3E] font-medium">
                        Native Android Required
                      </td>
                    </tr>

                    <tr>
                      <td className="py-3 px-4 font-sans font-medium text-[#292723]">
                        Detected OS Platform
                      </td>
                      <td className="py-3 px-4 text-[#77736D]">
                        {probeResults?.platform || 'Unknown'}
                      </td>
                      <td className="py-3 px-4 font-sans text-[#77736D]">Inspected</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Technical Transparency Callout */}
              <div className="bg-[#F6F1E8] border border-[#E4DCD0] rounded-md p-4 space-y-2">
                <div className="flex items-center gap-2 text-[#722F3E] font-semibold text-sm">
                  <Info className="w-4 h-4 shrink-0" />
                  Engineering Transparency: Web vs. Native BLE
                </div>
                <p className="text-[#292723] leading-relaxed">
                  Web browsers implementing the W3C Web Bluetooth specification operate strictly as <strong>Central/Clients</strong>. Browser security sandboxes do not permit web pages to function as <strong>Peripheral Advertisers</strong>.
                </p>
                <p className="text-[#77736D] leading-relaxed">
                  In ProxyProof, faculty beacon broadcasting is executed natively via our companion <strong>Android Kotlin BLE Service</strong> (using <code className="text-[#722F3E]">BluetoothLeAdvertiser</code>), while student web applications utilize client scanning or dynamic QR fallback.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-[#F6F1E8] border border-[#E4DCD0] rounded-md p-4 space-y-3">
                <h4 className="text-sm font-semibold text-[#292723] flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#722F3E]" />
                  Faculty Android BLE Peripheral Implementation
                </h4>
                <p className="text-[#77736D]">
                  Production Kotlin architecture implemented in <code className="text-[#722F3E]">ProxyProofAndroidBLE.kt</code> for faculty devices to broadcast 15-second rotating salted beacons.
                </p>

                <div className="bg-[#FFFCF7] border border-[#E4DCD0] rounded-md p-3.5 font-mono text-[11px] text-[#292723] overflow-x-auto">
                  <pre>{`// Android 12+ Manifest Permissions:
// android.permission.BLUETOOTH_ADVERTISE
// android.permission.BLUETOOTH_SCAN
// android.permission.ACCESS_FINE_LOCATION

class BleFacultyBroadcaster(private val context: Context) {
    private val advertiser: BluetoothLeAdvertiser? by lazy {
        val manager = context.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
        manager.adapter.bluetoothLeAdvertiser
    }

    fun startClassroomBeacon(sessionId: String, rotatingSalt: String) {
        val settings = AdvertiseSettings.Builder()
            .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_LOW_LATENCY)
            .setTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_HIGH)
            .setConnectable(false)
            .setTimeout(0)
            .build()

        val serviceUuid = ParcelUuid(UUID.fromString("4E70-0001-B5A3-F393-E0A9-E50E24DCCA9E"))
        val payload = "$sessionId:$rotatingSalt".toByteArray(Charsets.UTF_8)

        val data = AdvertiseData.Builder()
            .addServiceUuid(serviceUuid)
            .addServiceData(serviceUuid, payload)
            .setIncludeDeviceName(false)
            .setIncludeTxPowerLevel(true)
            .build()

        advertiser?.startAdvertising(settings, data, advertiseCallback)
    }
}`}</pre>
                </div>
              </div>

              <div className="p-3 bg-[#F6F1E8] border border-[#E4DCD0] rounded-md text-[#77736D]">
                <strong>Implementation Document:</strong> Complete Kotlin scanner with 3-packet median RSSI filtering is documented in <code className="text-[#292723]">/android-ble-architecture.md</code>.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
