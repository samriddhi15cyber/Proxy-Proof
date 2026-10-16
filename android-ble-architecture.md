# ProxyProof Android Native BLE Architecture & Implementation Blueprint

This specification details the production Android Kotlin architecture for native Bluetooth Low Energy (BLE) classroom beacon advertising and student proximity scanning.

---

## 1. Why Native Android BLE Is Required

The W3C Web Bluetooth specification implemented in web browsers operates strictly in the **Central (Client)** role and intentionally prohibits web applications from acting as **Peripheral (Broadcasters)** due to browser sandbox security constraints.

In **ProxyProof**, faculty devices act as **BLE Peripheral Advertisers** that broadcast 15-second rotating cryptographic salts. Student devices scan for these beacons and submit proof of proximity to the server.

---

## 2. Android 12+ (API 31+) Permission Manifest

```xml
<!-- AndroidManifest.xml -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="edu.university.proxyproof">

    <!-- Legacy BLE for Android 11 and lower -->
    <uses-permission android:name="android.permission.BLUETOOTH" android:maxSdkVersion="30" />
    <uses-permission android:name="android.permission.BLUETOOTH_ADMIN" android:maxSdkVersion="30" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />

    <!-- Modern Android 12+ Permissions -->
    <uses-permission android:name="android.permission.BLUETOOTH_ADVERTISE" />
    <uses-permission android:name="android.permission.BLUETOOTH_SCAN" 
                     android:usesPermissionFlags="neverForLocation" />
    <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />

    <!-- Required Hardware Features -->
    <uses-feature android:name="android.hardware.bluetooth_le" android:required="true" />

    <application ...>
        <service 
            android:name=".ble.ClassroomBeaconService"
            android:foregroundServiceType="connectedDevice"
            android:exported="false" />
    </application>
</manifest>
```

---

## 3. Faculty Beacon Broadcaster (`ClassroomBeaconService.kt`)

Faculty phones run this background-safe service to broadcast non-connectable advertising packets with short-lived rotating salts.

```kotlin
package edu.university.proxyproof.ble

import android.bluetooth.*
import android.bluetooth.le.*
import android.content.Context
import android.os.ParcelUuid
import java.util.UUID

class FacultyBeaconManager(private val context: Context) {
    private val bluetoothManager = context.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
    private val adapter: BluetoothAdapter? = bluetoothManager.adapter
    private val advertiser: BluetoothLeAdvertiser? get() = adapter?.bluetoothLeAdvertiser

    companion object {
        // ProxyProof Proprietary Service UUID
        val PROXYPROOF_SERVICE_UUID: ParcelUuid = ParcelUuid(UUID.fromString("4E70-0001-B5A3-F393-E0A9-E50E24DCCA9E"))
    }

    private val advertiseCallback = object : AdvertiseCallback() {
        override fun onStartSuccess(settingsInEffect: AdvertiseSettings?) {
            println("[ProxyProof BLE] Classroom Beacon active")
        }

        override fun onStartFailure(errorCode: Int) {
            println("[ProxyProof BLE] Advertising failed with error: $errorCode")
        }
    }

    fun startBroadcasting(sessionId: String, rotatingToken: String) {
        val settings = AdvertiseSettings.Builder()
            .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_LOW_LATENCY)
            .setTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_HIGH)
            .setConnectable(false)
            .setTimeout(0)
            .build()

        // 8-character rotating token + session identifier
        val payload = "$sessionId:$rotatingToken".toByteArray(Charsets.UTF_8)

        val data = AdvertiseData.Builder()
            .addServiceUuid(PROXYPROOF_SERVICE_UUID)
            .addServiceData(PROXYPROOF_SERVICE_UUID, payload)
            .setIncludeDeviceName(false)
            .setIncludeTxPowerLevel(true)
            .build()

        advertiser?.startAdvertising(settings, data, advertiseCallback)
    }

    fun stopBroadcasting() {
        advertiser?.stopAdvertising(advertiseCallback)
    }
}
```

---

## 4. Student Proximity Scanner with RSSI Filtering (`StudentBleScanner.kt`)

Student devices scan specifically for the `PROXYPROOF_SERVICE_UUID` and apply multi-sample median filtering over 3 packets to eliminate concrete multipath signal fading.

```kotlin
package edu.university.proxyproof.ble

import android.bluetooth.le.*
import android.content.Context
import android.os.Handler
import android.os.Looper

class StudentBleScanner(private val context: Context) {
    private val scanner: BluetoothLeScanner? get() = 
        (context.getSystemService(Context.BLUETOOTH_SERVICE) as android.bluetooth.BluetoothManager).adapter?.bluetoothLeScanner

    private val samples = mutableListOf<Int>()
    private var detectedToken: String? = null

    fun startProximityScan(targetSessionId: String, onVerified: (token: String, medianRssi: Int) -> Unit, onError: (String) -> Unit) {
        samples.clear()

        val filter = ScanFilter.Builder()
            .setServiceUuid(FacultyBeaconManager.PROXYPROOF_SERVICE_UUID)
            .build()

        val settings = ScanSettings.Builder()
            .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
            .setReportDelay(0)
            .build()

        val callback = object : ScanCallback() {
            override fun onScanResult(callbackType: Int, result: ScanResult?) {
                result?.let {
                    val serviceData = it.scanRecord?.getServiceData(FacultyBeaconManager.PROXYPROOF_SERVICE_UUID)
                    if (serviceData != null) {
                        val payload = String(serviceData, Charsets.UTF_8)
                        val parts = payload.split(":")
                        if (parts.size == 2 && parts[0] == targetSessionId) {
                            detectedToken = parts[1]
                            samples.add(it.rssi)

                            // Collect 3 samples for median smoothing
                            if (samples.size >= 3) {
                                scanner?.stopScan(this)
                                val sorted = samples.sorted()
                                val medianRssi = sorted[sorted.size / 2]
                                onVerified(detectedToken!!, medianRssi)
                            }
                        }
                    }
                }
            }

            override fun onScanFailed(errorCode: Int) {
                onError("BLE scan failed with hardware error: $errorCode")
            }
        }

        scanner?.startScan(listOf(filter), settings, callback)

        // Safety timeout after 8 seconds
        Handler(Looper.getMainLooper()).postDelayed({
            scanner?.stopScan(callback)
            if (samples.isEmpty()) {
                onError("No classroom beacon detected within proximity window. Switch to QR fallback.")
            }
        }, 8000)
    }
}
```

---

## 5. Security Principles & Anti-Proxy Analysis

1. **Replay Attack Resistance**: The token updates every 15 seconds. Even if an absentee receives a forwarded token screenshot, by the time it is entered on the student's phone, the token is rejected by the server.
2. **Signal Attenuation (RSSI)**: Concrete classroom walls attenuate 2.4 GHz Bluetooth signals by 15-25 dBm. Students standing outside in the corridor will yield RSSI values < -90 dBm, triggering automatic faculty review or failure.
3. **No Unauthenticated Tracking**: BLE scanning runs strictly on-demand during an active student check-in action. No continuous background location tracking is performed.
