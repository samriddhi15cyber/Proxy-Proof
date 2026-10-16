package edu.university.proxyproof.ui.screens.attendance

import android.os.Build
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import edu.university.proxyproof.data.ble.BlePermissionHelper
import edu.university.proxyproof.data.model.User
import edu.university.proxyproof.data.model.VerificationMethod
import edu.university.proxyproof.ui.theme.*
import edu.university.proxyproof.ui.viewmodel.BleViewModel
import edu.university.proxyproof.ui.viewmodel.StudentViewModel

@Composable
fun BleVerificationScreen(
    bleViewModel: BleViewModel,
    studentViewModel: StudentViewModel,
    currentUser: User?,
    onNavigateBack: () -> Unit,
    onNavigateToQr: () -> Unit
) {
    val context = LocalContext.current
    val bleState by bleViewModel.uiState.collectAsState()
    val studentState by studentViewModel.uiState.collectAsState()
    val activeSession = studentState.activeSession

    var hasRequestedPermissions by remember { mutableStateOf(false) }
    var permissionDeniedMessage by remember { mutableStateOf<String?>(null) }
    var verificationResultText by remember { mutableStateOf<String?>(null) }
    var isVerifiedSuccess by remember { mutableStateOf(false) }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val allGranted = permissions.values.all { it }
        if (allGranted) {
            permissionDeniedMessage = null
            bleViewModel.startStudentScan(activeSession?.courseId)
        } else {
            permissionDeniedMessage = "Bluetooth scanning permissions are required to verify classroom proximity."
        }
    }

    LaunchedEffect(Unit) {
        val permissions = BlePermissionHelper.getRequiredPermissions(isAdvertiser = false)
        val hasAll = BlePermissionHelper.hasPermissions(context)
        if (!hasAll && !hasRequestedPermissions) {
            hasRequestedPermissions = true
            permissionLauncher.launch(permissions.toTypedArray())
        } else if (hasAll) {
            bleViewModel.startStudentScan(activeSession?.courseId)
        }
    }

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = ParchmentBackground
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(20.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Column {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(bottom = 16.dp)
                ) {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = BurgundyPrimary)
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Column {
                        Text(
                            text = "BLE Proximity Verification",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = CharcoalText
                        )
                        Text(
                            text = "Cryptographic Beacon Validation",
                            fontSize = 12.sp,
                            color = SecondaryText
                        )
                    }
                }

                // Course Card
                Card(
                    colors = CardDefaults.cardColors(containerColor = CreamSurface),
                    shape = RoundedCornerShape(8.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, SubtleBorder),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = activeSession?.courseCode ?: "CS-401",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = BurgundyPrimary
                        )
                        Text(
                            text = activeSession?.courseTitle ?: "Distributed Systems & Cloud Computing",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = CharcoalText
                        )
                        Text(
                            text = "Room ${activeSession?.room ?: "Turing Hall 304"} · Threshold: ${activeSession?.minRssiThreshold ?: -75} dBm",
                            fontSize = 12.sp,
                            color = SecondaryText,
                            modifier = Modifier.padding(top = 2.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Scanner State Card
                Card(
                    colors = CardDefaults.cardColors(containerColor = CreamSurface),
                    shape = RoundedCornerShape(8.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, SubtleBorder),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        if (bleState.isScanning) {
                            CircularProgressIndicator(
                                color = BurgundyPrimary,
                                strokeWidth = 3.dp,
                                modifier = Modifier.size(54.dp)
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Text(
                                text = "Scanning for Classroom BLE Beacon...",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Medium,
                                color = CharcoalText
                            )
                            Text(
                                text = "Listening for UUID 4E70-0001 with 15s rotating salt",
                                fontSize = 11.sp,
                                color = SecondaryText,
                                textAlign = TextAlign.Center
                            )
                        } else if (bleState.detectedBeacon != null) {
                            val beacon = bleState.detectedBeacon!!
                            Icon(
                                Icons.Default.CheckCircle,
                                contentDescription = null,
                                tint = if (bleState.isProximityVerified) MutedGreen else AntiqueGold,
                                modifier = Modifier.size(54.dp)
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                            Text(
                                text = if (bleState.isProximityVerified) "Classroom Proximity Confirmed" else "Marginal Signal Detected",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = CharcoalText
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = "Hardware RSSI: ${beacon.rssi} dBm (Estimated ~${String.format("%.1f", bleState.estimatedDistanceMeters ?: 2.0)}m)",
                                fontSize = 12.sp,
                                color = SecondaryText
                            )
                            Text(
                                text = "Rotating Salt: ${beacon.rotatingSalt.take(12)}",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Medium,
                                color = BurgundyPrimary
                            )
                        } else {
                            Icon(
                                Icons.Default.BluetoothSearching,
                                contentDescription = null,
                                tint = SecondaryText,
                                modifier = Modifier.size(54.dp)
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                            Text(
                                text = bleState.errorMessage ?: "Ready to scan for classroom beacon",
                                fontSize = 14.sp,
                                color = CharcoalText,
                                textAlign = TextAlign.Center
                            )
                        }

                        if (permissionDeniedMessage != null) {
                            Spacer(modifier = Modifier.height(10.dp))
                            Text(
                                text = permissionDeniedMessage ?: "",
                                color = StatusFailedText,
                                fontSize = 12.sp,
                                textAlign = TextAlign.Center
                            )
                        }

                        if (verificationResultText != null) {
                            Spacer(modifier = Modifier.height(16.dp))
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(if (isVerifiedSuccess) StatusVerifiedBg else StatusFailedBg)
                                    .padding(12.dp)
                            ) {
                                Text(
                                    text = verificationResultText ?: "",
                                    color = if (isVerifiedSuccess) StatusVerifiedText else StatusFailedText,
                                    fontSize = 12.sp,
                                    textAlign = TextAlign.Center
                                )
                            }
                        }
                    }
                }
            }

            // Action Buttons
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                if (bleState.detectedBeacon != null && verificationResultText == null) {
                    Button(
                        onClick = {
                            val beacon = bleState.detectedBeacon ?: return@Button
                            val session = activeSession ?: return@Button
                            studentViewModel.submitAttendance(
                                studentId = currentUser?.studentId ?: "stu-alex",
                                studentName = currentUser?.name ?: "Alex Rivera",
                                sessionId = session.id,
                                courseId = session.courseId,
                                courseCode = session.courseCode,
                                method = VerificationMethod.BLE,
                                rssi = beacon.rssi
                            ) { success, msg ->
                                isVerifiedSuccess = success
                                verificationResultText = msg
                            }
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = BurgundyPrimary,
                            contentColor = CreamSurface
                        ),
                        shape = RoundedCornerShape(6.dp)
                    ) {
                        Text("Record Attendance Verification", fontSize = 14.sp, fontWeight = FontWeight.Medium)
                    }
                } else if (!bleState.isScanning && verificationResultText == null) {
                    Button(
                        onClick = {
                            bleViewModel.startStudentScan(activeSession?.courseId)
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = BurgundyPrimary,
                            contentColor = CreamSurface
                        ),
                        shape = RoundedCornerShape(6.dp)
                    ) {
                        Text("Rescan for Beacon", fontSize = 14.sp, fontWeight = FontWeight.Medium)
                    }
                }

                OutlinedButton(
                    onClick = onNavigateToQr,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = BurgundyPrimary),
                    shape = RoundedCornerShape(6.dp)
                ) {
                    Icon(Icons.Default.QrCodeScanner, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Switch to QR Code Fallback", fontSize = 13.sp, fontWeight = FontWeight.Medium)
                }
            }
        }
    }
}
