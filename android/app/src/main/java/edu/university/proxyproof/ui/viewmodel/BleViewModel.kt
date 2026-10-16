package edu.university.proxyproof.ui.viewmodel

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import edu.university.proxyproof.data.ble.AdvertiseState
import edu.university.proxyproof.data.ble.BlePermissionHelper
import edu.university.proxyproof.data.ble.ClassroomBleScanner
import edu.university.proxyproof.data.ble.FacultyBleAdvertiser
import edu.university.proxyproof.data.ble.ScanState
import edu.university.proxyproof.data.model.BleBeaconPayload
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class BleUiState(
    val isScanning: Boolean = false,
    val isAdvertising: Boolean = false,
    val detectedBeacon: BleBeaconPayload? = null,
    val advertisingToken: String? = null,
    val tokenExpiresAt: Long = 0L,
    val errorMessage: String? = null,
    val signalStrengthLabel: String = "Waiting for beacon...",
    val estimatedDistanceMeters: Double? = null,
    val isProximityVerified: Boolean = false
)

class BleViewModel(private val context: Context) : ViewModel() {

    private val bleScanner = ClassroomBleScanner(context)
    private val bleAdvertiser = FacultyBleAdvertiser(context)

    private val _uiState = MutableStateFlow(BleUiState())
    val uiState: StateFlow<BleUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            bleScanner.scanState.collect { state ->
                when (state) {
                    is ScanState.Idle -> {
                        _uiState.value = _uiState.value.copy(isScanning = false)
                    }
                    is ScanState.Scanning -> {
                        _uiState.value = _uiState.value.copy(
                            isScanning = true,
                            errorMessage = null,
                            signalStrengthLabel = "Scanning for Classroom BLE Beacon..."
                        )
                    }
                    is ScanState.BeaconDetected -> {
                        val rssi = state.beacon.rssi
                        val dist = calculateEstimatedDistance(rssi)
                        val isWithinRange = rssi >= -75
                        _uiState.value = _uiState.value.copy(
                            isScanning = false,
                            detectedBeacon = state.beacon,
                            estimatedDistanceMeters = dist,
                            isProximityVerified = isWithinRange,
                            signalStrengthLabel = if (isWithinRange) "In Classroom Proximity ($rssi dBm, ~${String.format("%.1f", dist)}m)"
                            else "Weak Signal ($rssi dBm) — Please move closer to podium"
                        )
                    }
                    is ScanState.Error -> {
                        _uiState.value = _uiState.value.copy(
                            isScanning = false,
                            errorMessage = state.message
                        )
                    }
                }
            }
        }

        viewModelScope.launch {
            bleAdvertiser.advertiseState.collect { state ->
                when (state) {
                    is AdvertiseState.Idle -> {
                        _uiState.value = _uiState.value.copy(isAdvertising = false, advertisingToken = null)
                    }
                    is AdvertiseState.Advertising -> {
                        _uiState.value = _uiState.value.copy(
                            isAdvertising = true,
                            advertisingToken = state.currentToken,
                            tokenExpiresAt = state.expiresAt,
                            errorMessage = null
                        )
                    }
                    is AdvertiseState.Error -> {
                        _uiState.value = _uiState.value.copy(
                            isAdvertising = false,
                            errorMessage = state.message
                        )
                    }
                }
            }
        }
    }

    fun startStudentScan(courseId: String? = null) {
        _uiState.value = _uiState.value.copy(errorMessage = null, detectedBeacon = null, isProximityVerified = false)
        bleScanner.startScan(courseId)
    }

    fun stopStudentScan() {
        bleScanner.stopScan()
    }

    fun startTeacherBeacon(sessionId: String) {
        bleAdvertiser.startAdvertising(sessionId)
    }

    fun stopTeacherBeacon() {
        bleAdvertiser.stopAdvertising()
    }

    fun hasPermissions(): Boolean {
        return BlePermissionHelper.hasPermissions(context)
    }

    private fun calculateEstimatedDistance(rssi: Int, txPower: Int = -59): Double {
        if (rssi == 0) return -1.0
        val ratio = rssi * 1.0 / txPower
        return if (ratio < 1.0) {
            Math.pow(ratio, 10.0)
        } else {
            0.89976 * Math.pow(ratio, 7.7095) + 0.111
        }
    }

    override fun onCleared() {
        super.onCleared()
        bleScanner.stopScan()
        bleAdvertiser.stopAdvertising()
    }
}
