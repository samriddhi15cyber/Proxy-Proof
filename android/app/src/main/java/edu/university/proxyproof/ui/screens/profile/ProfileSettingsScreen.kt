package edu.university.proxyproof.ui.screens.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import edu.university.proxyproof.data.ble.BlePermissionHelper
import edu.university.proxyproof.data.model.User
import edu.university.proxyproof.ui.theme.*
import edu.university.proxyproof.ui.viewmodel.AuthViewModel

@Composable
fun ProfileSettingsScreen(
    authViewModel: AuthViewModel,
    currentUser: User?,
    onNavigateBack: () -> Unit,
    onSignOut: () -> Unit
) {
    val context = LocalContext.current
    val isBleSupported = BlePermissionHelper.isBleSupported(context)
    val isBtEnabled = BlePermissionHelper.isBluetoothEnabled(context)
    val isAdvertisingSupported = BlePermissionHelper.isAdvertisingSupported(context)

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = ParchmentBackground
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
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
                            text = "Profile & Settings",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = CharcoalText
                        )
                        Text(
                            text = "Academic Identity & Device Configuration",
                            fontSize = 12.sp,
                            color = SecondaryText
                        )
                    }
                }

                // Profile Card
                Card(
                    colors = CardDefaults.cardColors(containerColor = CreamSurface),
                    shape = RoundedCornerShape(8.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, SubtleBorder),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(52.dp)
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(BurgundyPrimary),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = (currentUser?.name ?: "U").take(1),
                                    fontSize = 24.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = CreamSurface
                                )
                            }
                            Spacer(modifier = Modifier.width(14.dp))
                            Column {
                                Text(
                                    text = currentUser?.name ?: "Alex Rivera",
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = CharcoalText
                                )
                                Text(
                                    text = currentUser?.email ?: "student@university.edu",
                                    fontSize = 12.sp,
                                    color = SecondaryText
                                )
                                Text(
                                    text = "Role: ${currentUser?.role?.name ?: "STUDENT"}",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = BurgundyPrimary
                                )
                            }
                        }

                        Divider(color = SubtleBorder, thickness = 1.dp, modifier = Modifier.padding(vertical = 14.dp))

                        Text(
                            text = "Matriculation / Faculty ID",
                            fontSize = 11.sp,
                            color = SecondaryText
                        )
                        Text(
                            text = currentUser?.studentId ?: currentUser?.facultyId ?: "STU-2026-8814",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Medium,
                            color = CharcoalText
                        )

                        Spacer(modifier = Modifier.height(10.dp))

                        Text(
                            text = "Academic Department",
                            fontSize = 11.sp,
                            color = SecondaryText
                        )
                        Text(
                            text = currentUser?.department ?: "Computer Science & Engineering",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Medium,
                            color = CharcoalText
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Hardware & Diagnostic Information
                Card(
                    colors = CardDefaults.cardColors(containerColor = CreamSurface),
                    shape = RoundedCornerShape(8.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, SubtleBorder),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = "Hardware & BLE Telemetry",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = CharcoalText
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("BLE Hardware Support", fontSize = 12.sp, color = SecondaryText)
                            Text(if (isBleSupported) "Available" else "Unsupported", fontSize = 12.sp, fontWeight = FontWeight.Medium, color = if (isBleSupported) MutedGreen else BurgundyPrimary)
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Bluetooth Radio Status", fontSize = 12.sp, color = SecondaryText)
                            Text(if (isBtEnabled) "Powered ON" else "OFF", fontSize = 12.sp, fontWeight = FontWeight.Medium, color = if (isBtEnabled) MutedGreen else BurgundyPrimary)
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Peripheral Advertising", fontSize = 12.sp, color = SecondaryText)
                            Text(if (isAdvertisingSupported) "Supported" else "Central Only", fontSize = 12.sp, fontWeight = FontWeight.Medium, color = CharcoalText)
                        }
                    }
                }
            }

            // Sign Out Button
            Button(
                onClick = {
                    authViewModel.signOut(onSignOut)
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp)
                    .padding(top = 16.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = PaleBurgundy,
                    contentColor = BurgundyPrimary
                ),
                shape = RoundedCornerShape(6.dp)
            ) {
                Text("Sign Out of Session", fontSize = 14.sp, fontWeight = FontWeight.Medium)
            }
        }
    }
}
