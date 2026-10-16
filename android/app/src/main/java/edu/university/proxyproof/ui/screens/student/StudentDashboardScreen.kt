package edu.university.proxyproof.ui.screens.student

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import edu.university.proxyproof.data.model.User
import edu.university.proxyproof.data.model.VerificationStatus
import edu.university.proxyproof.ui.theme.*
import edu.university.proxyproof.ui.viewmodel.StudentViewModel

@Composable
fun StudentDashboardScreen(
    studentViewModel: StudentViewModel,
    currentUser: User?,
    onNavigateToBle: () -> Unit,
    onNavigateToQr: () -> Unit,
    onNavigateToTimetable: () -> Unit,
    onNavigateToHistory: () -> Unit,
    onNavigateToProfile: () -> Unit
) {
    val uiState by studentViewModel.uiState.collectAsState()
    val studentName = currentUser?.name ?: "Alex Rivera"
    val studentId = currentUser?.studentId ?: "STU-2026-8814"

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = ParchmentBackground
    ) {
        Scaffold(
            containerColor = ParchmentBackground,
            topBar = {
                // Editorial Top Bar
                Surface(
                    color = CreamSurface,
                    shadowElevation = 0.dp,
                    modifier = Modifier.border(1.dp, SubtleBorder)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(32.dp)
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(BurgundyPrimary),
                                contentAlignment = Alignment.Center
                            ) {
                                Text("P", color = CreamSurface, fontWeight = FontWeight.SemiBold, fontSize = 16.sp)
                            }
                            Spacer(modifier = Modifier.width(10.dp))
                            Column {
                                Text("ProxyProof", fontSize = 15.sp, fontWeight = FontWeight.SemiBold, color = CharcoalText)
                                Text("Student Portal", fontSize = 11.sp, color = SecondaryText)
                            }
                        }

                        IconButton(onClick = onNavigateToProfile) {
                            Icon(Icons.Default.AccountCircle, contentDescription = "Profile", tint = BurgundyPrimary)
                        }
                    }
                }
            },
            bottomBar = {
                // Editorial Bottom Nav
                NavigationBar(
                    containerColor = CreamSurface,
                    modifier = Modifier.border(1.dp, SubtleBorder)
                ) {
                    NavigationBarItem(
                        selected = true,
                        onClick = {},
                        icon = { Icon(Icons.Default.Dashboard, contentDescription = "Dashboard") },
                        label = { Text("Portal", fontSize = 11.sp) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = BurgundyPrimary,
                            selectedTextColor = BurgundyPrimary,
                            indicatorColor = PaleBurgundy
                        )
                    )
                    NavigationBarItem(
                        selected = false,
                        onClick = onNavigateToTimetable,
                        icon = { Icon(Icons.Default.CalendarToday, contentDescription = "Schedule") },
                        label = { Text("Timetable", fontSize = 11.sp) },
                        colors = NavigationBarItemDefaults.colors(
                            unselectedIconColor = SecondaryText,
                            unselectedTextColor = SecondaryText
                        )
                    )
                    NavigationBarItem(
                        selected = false,
                        onClick = onNavigateToHistory,
                        icon = { Icon(Icons.Default.History, contentDescription = "History") },
                        label = { Text("Records", fontSize = 11.sp) },
                        colors = NavigationBarItemDefaults.colors(
                            unselectedIconColor = SecondaryText,
                            unselectedTextColor = SecondaryText
                        )
                    )
                }
            }
        ) { paddingValues ->
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // 1. Personalised Greeting & Academic Status
                item {
                    Column {
                        Text(
                            text = "Autumn Term 2026 · Week 08",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium,
                            color = SecondaryText
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = "Welcome, $studentName",
                            fontSize = 22.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = CharcoalText,
                            letterSpacing = (-0.5).sp
                        )
                        Text(
                            text = "Matriculation: $studentId · Computer Science & Engineering",
                            fontSize = 12.sp,
                            color = SecondaryText
                        )
                    }
                }

                // 2. Active Classroom Attendance Banner (Primary Action)
                item {
                    val activeSession = uiState.activeSession
                    if (activeSession != null) {
                        Card(
                            colors = CardDefaults.cardColors(containerColor = CreamSurface),
                            shape = RoundedCornerShape(8.dp),
                            border = androidx.compose.foundation.BorderStroke(1.5.dp, BurgundyPrimary),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Box(
                                            modifier = Modifier
                                                .size(8.dp)
                                                .clip(RoundedCornerShape(4.dp))
                                                .background(MutedGreen)
                                        )
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text(
                                            text = "LIVE ATTENDANCE WINDOW",
                                            fontSize = 10.sp,
                                            fontWeight = FontWeight.SemiBold,
                                            color = MutedGreen
                                        )
                                    }
                                    Text(
                                        text = activeSession.room,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Medium,
                                        color = SecondaryText
                                    )
                                }

                                Spacer(modifier = Modifier.height(8.dp))

                                Text(
                                    text = "${activeSession.courseCode}: ${activeSession.courseTitle}",
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = CharcoalText
                                )

                                Text(
                                    text = "Instructor: ${activeSession.instructorName}",
                                    fontSize = 12.sp,
                                    color = SecondaryText,
                                    modifier = Modifier.padding(top = 2.dp, bottom = 14.dp)
                                )

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                                ) {
                                    Button(
                                        onClick = onNavigateToBle,
                                        modifier = Modifier.weight(1.3f).height(42.dp),
                                        colors = ButtonDefaults.buttonColors(
                                            containerColor = BurgundyPrimary,
                                            contentColor = CreamSurface
                                        ),
                                        shape = RoundedCornerShape(6.dp)
                                    ) {
                                        Icon(Icons.Default.Bluetooth, contentDescription = null, modifier = Modifier.size(16.dp))
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text("Verify via BLE", fontSize = 13.sp, fontWeight = FontWeight.Medium)
                                    }

                                    OutlinedButton(
                                        onClick = onNavigateToQr,
                                        modifier = Modifier.weight(1f).height(42.dp),
                                        colors = ButtonDefaults.outlinedButtonColors(contentColor = BurgundyPrimary),
                                        shape = RoundedCornerShape(6.dp)
                                    ) {
                                        Icon(Icons.Default.QrCodeScanner, contentDescription = null, modifier = Modifier.size(16.dp))
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text("QR Fallback", fontSize = 13.sp, fontWeight = FontWeight.Medium)
                                    }
                                }
                            }
                        }
                    }
                }

                // 3. Attendance Statistics (Large Elegant Numbers)
                item {
                    Card(
                        colors = CardDefaults.cardColors(containerColor = CreamSurface),
                        shape = RoundedCornerShape(8.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, SubtleBorder),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "Attendance Standing",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = CharcoalText
                                )
                                Text(
                                    text = "Req: ${uiState.selectedThreshold}%",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = BurgundyPrimary
                                )
                            }

                            Spacer(modifier = Modifier.height(14.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceAround,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text(
                                        text = "${uiState.attendancePct}%",
                                        fontSize = 32.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = if (uiState.attendancePct >= uiState.selectedThreshold) MutedGreen else BurgundyPrimary
                                    )
                                    Text("Term Average", fontSize = 11.sp, color = SecondaryText)
                                }

                                Box(
                                    modifier = Modifier
                                        .width(1.dp)
                                        .height(40.dp)
                                        .background(SubtleBorder)
                                )

                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text(
                                        text = "${uiState.attendedClasses}/${uiState.totalSessions}",
                                        fontSize = 24.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = CharcoalText
                                    )
                                    Text("Sessions Attended", fontSize = 11.sp, color = SecondaryText)
                                }
                            }

                            Spacer(modifier = Modifier.height(14.dp))

                            // Restrained Progress Indicator
                            LinearProgressIndicator(
                                progress = (uiState.attendancePct / 100f).toFloat(),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(6.dp)
                                    .clip(RoundedCornerShape(3.dp)),
                                color = if (uiState.attendancePct >= uiState.selectedThreshold) MutedGreen else BurgundyPrimary,
                                trackColor = PaleBurgundy
                            )
                        }
                    }
                }

                // 4. Today's Timetable Section
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Today's Timetable",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = CharcoalText
                        )
                        Text(
                            text = "View Schedule →",
                            fontSize = 12.sp,
                            color = BurgundyPrimary,
                            fontWeight = FontWeight.Medium,
                            modifier = Modifier.clickable { onNavigateToTimetable() }
                        )
                    }
                }

                items(uiState.enrolledCourses.take(2)) { course ->
                    Card(
                        colors = CardDefaults.cardColors(containerColor = CreamSurface),
                        shape = RoundedCornerShape(6.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, SubtleBorder),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(14.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "${course.code} · ${course.room}",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = BurgundyPrimary
                                )
                                Text(
                                    text = course.title,
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = CharcoalText
                                )
                                Text(
                                    text = "${course.instructorName} · ${course.scheduleTime}",
                                    fontSize = 12.sp,
                                    color = SecondaryText
                                )
                            }
                        }
                    }
                }

                // 5. Recent Attendance Records
                item {
                    Text(
                        text = "Recent Attendance Log",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = CharcoalText,
                        modifier = Modifier.padding(top = 8.dp)
                    )
                }

                items(uiState.records.take(3)) { record ->
                    Card(
                        colors = CardDefaults.cardColors(containerColor = CreamSurface),
                        shape = RoundedCornerShape(6.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, SubtleBorder),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    text = record.courseCode,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = CharcoalText
                                )
                                Text(
                                    text = "Via ${record.method.name} ${if (record.rssi != null) "(${record.rssi} dBm)" else ""}",
                                    fontSize = 11.sp,
                                    color = SecondaryText
                                )
                            }

                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(4.dp))
                                    .background(
                                        when (record.status) {
                                            VerificationStatus.VERIFIED -> StatusVerifiedBg
                                            VerificationStatus.NEEDS_REVIEW -> StatusReviewBg
                                            else -> StatusFailedBg
                                        }
                                    )
                                    .padding(horizontal = 8.dp, vertical = 4.dp)
                            ) {
                                Text(
                                    text = record.status.name,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = when (record.status) {
                                        VerificationStatus.VERIFIED -> StatusVerifiedText
                                        VerificationStatus.NEEDS_REVIEW -> StatusReviewText
                                        else -> StatusFailedText
                                    }
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
