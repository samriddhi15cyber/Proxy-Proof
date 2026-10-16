package edu.university.proxyproof.data.ble

import android.annotation.SuppressLint
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothManager
import android.bluetooth.le.AdvertiseCallback
import android.bluetooth.le.AdvertiseData
import android.bluetooth.le.AdvertiseSettings
import android.bluetooth.le.BluetoothLeAdvertiser
import android.content.Context
import android.os.Handler
import android.os.Looper
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.security.SecureRandom

sealed class AdvertiseState {
    object Idle : AdvertiseState()
    data class Advertising(val currentToken: String, val expiresAt: Long) : AdvertiseState()
    data class Error(val message: String) : AdvertiseState()
}

class FacultyBleAdvertiser(private val context: Context) {

    private val bluetoothManager = context.getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
    private val adapter: BluetoothAdapter? get() = bluetoothManager?.adapter
    private val advertiser: BluetoothLeAdvertiser? get() = adapter?.bluetoothLeAdvertiser

    private val _advertiseState = MutableStateFlow<AdvertiseState>(AdvertiseState.Idle)
    val advertiseState: StateFlow<AdvertiseState> = _advertiseState.asStateFlow()

    private val handler = Handler(Looper.getMainLooper())
    private var isAdvertising = false
    private var activeSessionId: String? = null
    private var currentSalt: String = ""

    private val tokenRotationRunnable = object : Runnable {
        override fun run() {
            if (isAdvertising) {
                rotateTokenAndRestart()
                handler.postDelayed(this, 15000L) // Rotate salt every 15 seconds
            }
        }
    }

    private val advertiseCallback = object : AdvertiseCallback() {
        override fun onStartSuccess(settingsInEffect: AdvertiseSettings?) {
            isAdvertising = true
            val expiresAt = System.currentTimeMillis() + 15000L
            _advertiseState.value = AdvertiseState.Advertising(currentSalt, expiresAt)
        }

        override fun onStartFailure(errorCode: Int) {
            val errorMsg = when (errorCode) {
                ADVERTISE_FAILED_ALREADY_STARTED -> "Advertising already active"
                ADVERTISE_FAILED_DATA_TOO_LARGE -> "Advertising packet too large"
                ADVERTISE_FAILED_FEATURE_UNSUPPORTED -> "Peripheral BLE advertising unsupported by this phone's hardware"
                ADVERTISE_FAILED_INTERNAL_ERROR -> "Bluetooth driver internal error"
                ADVERTISE_FAILED_TOO_MANY_ADVERTISERS -> "Too many active BLE advertisers"
                else -> "BLE Advertising failed ($errorCode)"
            }
            _advertiseState.value = AdvertiseState.Error(errorMsg)
            isAdvertising = false
        }
    }

    @SuppressLint("MissingPermission")
    fun startAdvertising(sessionId: String) {
        if (!BlePermissionHelper.hasPermissions(context, isAdvertiser = true)) {
            _advertiseState.value = AdvertiseState.Error("Required Bluetooth advertising permissions not granted")
            return
        }

        if (!BlePermissionHelper.isBluetoothEnabled(context)) {
            _advertiseState.value = AdvertiseState.Error("Bluetooth is turned off")
            return
        }

        val leAdvertiser = advertiser
        if (leAdvertiser == null) {
            _advertiseState.value = AdvertiseState.Error("Device does not support BLE Peripheral advertising mode")
            return
        }

        activeSessionId = sessionId
        rotateTokenAndRestart()
        handler.post(tokenRotationRunnable)
    }

    @SuppressLint("MissingPermission")
    private fun rotateTokenAndRestart() {
        val leAdvertiser = advertiser ?: return

        // Stop current advertisement if running
        try {
            if (isAdvertising) {
                leAdvertiser.stopAdvertising(advertiseCallback)
            }
        } catch (_: Exception) {}

        // Generate 8-character cryptographic alphanumeric salt
        currentSalt = generateSalt()

        val settings = AdvertiseSettings.Builder()
            .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_LOW_LATENCY)
            .setTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_HIGH)
            .setConnectable(false)
            .setTimeout(0) // Run until stopped
            .build()

        val data = AdvertiseData.Builder()
            .setIncludeDeviceName(false)
            .setIncludeTxPowerLevel(true)
            .addServiceUuid(ClassroomBleScanner.PARCEL_UUID)
            .addServiceData(ClassroomBleScanner.PARCEL_UUID, currentSalt.toByteArray(Charsets.UTF_8))
            .build()

        try {
            leAdvertiser.startAdvertising(settings, data, advertiseCallback)
        } catch (e: Exception) {
            _advertiseState.value = AdvertiseState.Error("Failed to broadcast beacon: ${e.message}")
        }
    }

    @SuppressLint("MissingPermission")
    fun stopAdvertising() {
        handler.removeCallbacks(tokenRotationRunnable)
        if (isAdvertising) {
            try {
                advertiser?.stopAdvertising(advertiseCallback)
            } catch (_: Exception) {}
            isAdvertising = false
        }
        _advertiseState.value = AdvertiseState.Idle
    }

    private fun generateSalt(): String {
        val chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
        val random = SecureRandom()
        val sb = StringBuilder(8)
        for (i in 0 until 8) {
            sb.append(chars[random.nextInt(chars.length)])
        }
        return sb.toString()
    }
}
