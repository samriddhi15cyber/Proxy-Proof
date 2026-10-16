package edu.university.proxyproof.data.ble

import android.annotation.SuppressLint
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothManager
import android.bluetooth.le.BluetoothLeScanner
import android.bluetooth.le.ScanCallback
import android.bluetooth.le.ScanFilter
import android.bluetooth.le.ScanResult
import android.bluetooth.le.ScanSettings
import android.content.Context
import android.os.Handler
import android.os.Looper
import android.os.ParcelUuid
import edu.university.proxyproof.data.model.BleBeaconPayload
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.UUID

sealed class ScanState {
    object Idle : ScanState()
    object Scanning : ScanState()
    data class BeaconDetected(val beacon: BleBeaconPayload) : ScanState()
    data class Error(val message: String) : ScanState()
}

class ClassroomBleScanner(private val context: Context) {

    companion object {
        // ProxyProof Service UUID: 4E70-0001-B5A3-F393-E0A9-E50E24DCCA9E
        val PROXYPROOF_SERVICE_UUID: UUID = UUID.fromString("00004e70-0001-b5a3-f393-e0a9e50e24dc")
        val PARCEL_UUID = ParcelUuid(PROXYPROOF_SERVICE_UUID)
        const val SCAN_TIMEOUT_MS = 25000L
    }

    private val bluetoothManager = context.getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
    private val adapter: BluetoothAdapter? get() = bluetoothManager?.adapter
    private val scanner: BluetoothLeScanner? get() = adapter?.bluetoothLeScanner

    private val _scanState = MutableStateFlow<ScanState>(ScanState.Idle)
    val scanState: StateFlow<ScanState> = _scanState.asStateFlow()

    private val handler = Handler(Looper.getMainLooper())
    private var isScanning = false

    private val scanCallback = object : ScanCallback() {
        override fun onScanResult(callbackType: Int, result: ScanResult?) {
            result?.let { handleScanResult(it) }
        }

        override fun onBatchScanResults(results: MutableList<ScanResult>?) {
            results?.firstOrNull()?.let { handleScanResult(it) }
        }

        override fun onScanFailed(errorCode: Int) {
            val errorMsg = when (errorCode) {
                SCAN_FAILED_ALREADY_STARTED -> "Scan already active"
                SCAN_FAILED_APPLICATION_REGISTRATION_FAILED -> "App registration failed"
                SCAN_FAILED_FEATURE_UNSUPPORTED -> "BLE hardware scanning unsupported on this device"
                SCAN_FAILED_INTERNAL_ERROR -> "Internal Bluetooth hardware error"
                else -> "Bluetooth scan failed (Code $errorCode)"
            }
            _scanState.value = ScanState.Error(errorMsg)
            stopScan()
        }
    }

    @SuppressLint("MissingPermission")
    fun startScan(targetCourseId: String? = null) {
        if (!BlePermissionHelper.hasPermissions(context)) {
            _scanState.value = ScanState.Error("Bluetooth permissions not granted")
            return
        }

        if (!BlePermissionHelper.isBluetoothEnabled(context)) {
            _scanState.value = ScanState.Error("Bluetooth is turned off. Please enable Bluetooth.")
            return
        }

        val bleScanner = scanner
        if (bleScanner == null) {
            _scanState.value = ScanState.Error("Bluetooth LE scanner unavailable on this device")
            return
        }

        if (isScanning) return

        try {
            val filters = mutableListOf<ScanFilter>()
            // Match ProxyProof Beacon Service UUID
            filters.add(
                ScanFilter.Builder()
                    .setServiceUuid(PARCEL_UUID)
                    .build()
            )

            val settings = ScanSettings.Builder()
                .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
                .setReportDelay(0)
                .build()

            isScanning = true
            _scanState.value = ScanState.Scanning

            bleScanner.startScan(filters, settings, scanCallback)

            // Auto-stop after SCAN_TIMEOUT_MS to preserve battery
            handler.postDelayed({
                if (isScanning) {
                    stopScan()
                    if (_scanState.value is ScanState.Scanning) {
                        _scanState.value = ScanState.Error("No teacher beacon detected in range. Move closer to the podium or try QR code fallback.")
                    }
                }
            }, SCAN_TIMEOUT_MS)

        } catch (e: SecurityException) {
            _scanState.value = ScanState.Error("Permission denied: ${e.message}")
            isScanning = false
        } catch (e: Exception) {
            _scanState.value = ScanState.Error("Could not start scan: ${e.message}")
            isScanning = false
        }
    }

    @SuppressLint("MissingPermission")
    fun stopScan() {
        if (!isScanning) return
        try {
            scanner?.stopScan(scanCallback)
        } catch (_: Exception) {
        } finally {
            isScanning = false
        }
    }

    private fun handleScanResult(result: ScanResult) {
        val record = result.scanRecord ?: return
        val serviceData = record.getServiceData(PARCEL_UUID)
        val rssi = result.rssi

        // Parse beacon payload
        val tokenString = if (serviceData != null && serviceData.isNotEmpty()) {
            String(serviceData, Charsets.UTF_8)
        } else {
            // Fallback to device name or manufacturer bytes
            record.deviceName ?: "TOKEN-${UUID.randomUUID().toString().take(8)}"
        }

        val beaconPayload = BleBeaconPayload(
            serviceUuid = PROXYPROOF_SERVICE_UUID.toString(),
            courseId = "CS-401",
            sessionId = "sess-active",
            rotatingSalt = tokenString,
            rssi = rssi
        )

        _scanState.value = ScanState.BeaconDetected(beaconPayload)
        stopScan()
    }
}
