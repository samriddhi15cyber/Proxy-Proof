package edu.university.proxyproof.ui.screens.teacher

import android.widget.Toast
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import edu.university.proxyproof.data.model.SessionStatus
import edu.university.proxyproof.data.model.User
import edu.university.proxyproof.data.model.VerificationStatus
import edu.university.proxyproof.ui.theme.*
import edu.university.proxyproof.ui.viewmodel.BleViewModel
import edu.university.proxyproof.ui.viewmodel.TeacherViewModel

@Composable
fun TeacherDashboardScreen(
    teacherViewModel: TeacherViewModel,
    bleViewModel: BleViewModel,
    currentUser: User?,
    onNavigateToReports: () -> Unit,
    onNavigateToTimetable: () -> Unit,
    onNavigateToProfile: () -> Unit
) {
    val context = LocalContext.current
    val uiState by teacherViewModel.uiState.collectAsState()
    val bleState by bleViewModel.uiState.collectAsState()
    val instructorName = currentUser?.name ?: "Dr. Marcus Vance"
    val activeSession = uiState.activeSession

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = ParchmentBackground
    ) {
        Scaffold(
            containerColor = ParchmentBackground,
            topBar = {
                Surface(
                    color = CreamSurface,
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
                                Text("Faculty Console", fontSize = 11.sp, color = SecondaryText)
                            }
                        }

                        IconButton(onClick = onNavigateToProfile) {
                            Icon(Icons.Default.AccountCircle, contentDescription = "Profile", tint = BurgundyPrimary)
                        }
                    }
                }
            },
            bottomBar = {
                NavigationBar(
                    containerColor = CreamSurface,
                    modifier = Modifier.border(1.dp, SubtleBorder)
                ) {
                    NavigationBarItem(
                        selected = true,
                        onClick = {},
                        icon = { Icon(Icons.Default.Dashboard, contentDescription = "Console") },
                        label = { Text("Workspace", fontSize = 11.sp) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = BurgundyPrimary,
                            selectedTextColor = BurgundyPrimary,
                            indicatorColor = PaleBurgundy
                        )
                    )
                    NavigationBarItem(
                        selected = false,
                        onClick = onNavigateToReports,
                        icon = { Icon(Icons.Default.Assessment, contentDescription = "Reports") },
                        label = { Text("Reports", fontSize = 11.sp) },
                        colors = NavigationBarItemDefaults.colors(
                            unselectedIconColor = SecondaryText,
                            unselectedTextColor = SecondaryText
                        )
                    )
                    NavigationBarItem(
                        selected = false,
                        onClick = onNavigateToTimetable,
                        icon = { Icon(Icons.Default.CalendarToday, contentDescription = "Timetable") },
                        label = { Text("Timetable", fontSize = 11.sp) },
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
                // Header
                item {
                    Column {
                        Text(
                            text = "Faculty Academic Workspace",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium,
                            color = SecondaryText
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = instructorName,
                            fontSize = 22.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = CharcoalText,
                            letterSpacing = (-0.5).sp
                        )
                        Text(
                            text = "Department of Computer Science & Engineering",
                            fontSize = 12.sp,
                            color = SecondaryText
                        )
                    }
                }

                // Session Status & Launch Control
                item {
                    val isSessionActive = activeSession != null && activeSession.status == SessionStatus.ACTIVE
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
                                    text = "Classroom Attendance Session",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = CharcoalText
                                )
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(4.dp))
                                        .background(if (isSessionActive) StatusVerifiedBg else PaleBurgundy)
                                        .padding(horizontal = 8.dp, vertical = 3.dp)
                                ) {
                                    Text(
                                        text = if (isSessionActive) "ACTIVE BROADCAST" else "INACTIVE",
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = if (isSessionActive) StatusVerifiedText else BurgundyPrimary
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(10.dp))

                            if (isSessionActive) {
                                Text(
                                    text = "${activeSession?.courseCode} · ${activeSession?.courseTitle}",
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = CharcoalText
                                )
                                Text(
                                    text = "Room ${activeSession?.room} · Proximity Threshold: ${activeSession?.minRssiThreshold} dBm",
                                    fontSize = 12.sp,
                                    color = SecondaryText,
                                    modifier = Modifier.padding(bottom = 12.dp)
                                )

                                if (bleState.isAdvertising) {
                                    Box(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .clip(RoundedCornerShape(6.dp))
                                            .background(PaleBurgundy)
                                            .padding(10.dp)
                                    ) {
                                        Text(
                                            text = "Broadcasting Rotating Salt: ${bleState.advertisingToken ?: "ACTIVE"} (changes every 15s)",
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.Medium,
                                            color = BurgundyPrimary
                                        )
                                    }
                                    Spacer(modifier = Modifier.height(12.dp))
                                }

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                                ) {
                                    OutlinedButton(
                                        onClick = {
                                            teacherViewModel.endSession()
                                            bleViewModel.stopTeacherBeacon()
                                            Toast.makeText(context, "Attendance session closed.", Toast.LENGTH_SHORT).show()
                                        },
                                        modifier = Modifier.weight(1f).height(44.dp),
                                        colors = ButtonDefaults.outlinedButtonColors(contentColor = BurgundyPrimary),
                                        shape = RoundedCornerShape(6.dp)
                                    ) {
                                        Text("End Attendance Session", fontSize = 13.sp, fontWeight = FontWeight.Medium)
                                    }

                                    if (!bleState.isAdvertising) {
                                        Button(
                                            onClick = {
                                                bleViewModel.startTeacherBeacon(activeSession?.id ?: "sess-1")
                                            },
                                            modifier = Modifier.weight(1f).height(44.dp),
                                            colors = ButtonDefaults.buttonColors(
                                                containerColor = BurgundyPrimary,
                                                contentColor = CreamSurface
                                            ),
                                            shape = RoundedCornerShape(6.dp)
                                        ) {
                                            Text("Broadcast BLE", fontSize = 13.sp, fontWeight = FontWeight.Medium)
                                        }
                                    }
                                }
                            } else {
                                Text(
                                    text = "Select a scheduled lecture to open proximity verification window.",
                                    fontSize = 13.sp,
                                    color = SecondaryText,
                                    modifier = Modifier.padding(bottom = 14.dp)
                                )

                                val firstCourse = uiState.authorizedCourses.firstOrNull()
                                Button(
                                    onClick = {
                                        if (firstCourse != null) {
                                            val sess = teacherViewModel.startSession(firstCourse, currentUser?.id ?: "fac-1", instructorName)
                                            bleViewModel.startTeacherBeacon(sess.id)
                                            Toast.makeText(context, "Session started for ${firstCourse.code}", Toast.LENGTH_SHORT).show()
                                        }
                                    },
                                    modifier = Modifier.fillMaxWidth().height(46.dp),
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = BurgundyPrimary,
                                        contentColor = CreamSurface
                                    ),
                                    shape = RoundedCornerShape(6.dp)
                                ) {
                                    Icon(Icons.Default.PlayArrow, contentDescription = null, modifier = Modifier.size(18.dp))
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text("Start Attendance Window", fontSize = 14.sp, fontWeight = FontWeight.Medium)
                                }
                            }
                        }
                    }
                }

                // Student Attendance Register
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Student Attendance Register",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = CharcoalText
                        )

                        TextButton(onClick = {
                            val csv = teacherViewModel.exportRecordsCsv()
                            Toast.makeText(context, "Exported ${uiState.records.size} records to CSV format", Toast.LENGTH_SHORT).show()
                        }) {
                            Icon(Icons.Default.Download, contentDescription = null, modifier = Modifier.size(14.dp), tint = BurgundyPrimary)
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Export CSV", fontSize = 12.sp, color = BurgundyPrimary, fontWeight = FontWeight.Medium)
                        }
                    }
                }

                items(uiState.records) { record ->
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
                                    text = record.studentName,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = CharcoalText
                                )
                                Text(
                                    text = "Matriculation: ${record.studentId} · ${record.courseCode}",
                                    fontSize = 11.sp,
                                    color = SecondaryText
                                )
                                if (record.rssi != null) {
                                    Text(
                                        text = "Hardware RSSI: ${record.rssi} dBm",
                                        fontSize = 10.sp,
                                        color = SecondaryText
                                    )
                                }
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

                // Correction Requests Queue
                item {
                    Text(
                        text = "Correction Appeals Queue (${uiState.corrections.size})",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = CharcoalText,
                        modifier = Modifier.padding(top = 8.dp)
                    )
                }

                items(uiState.corrections) { appeal ->
                    Card(
                        colors = CardDefaults.cardColors(containerColor = CreamSurface),
                        shape = RoundedCornerShape(6.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, SubtleBorder),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    text = "${appeal.studentName} (${appeal.courseCode})",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = CharcoalText
                                )
                                Text(
                                    text = appeal.status,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = if (appeal.status == "Approved") MutedGreen else BurgundyPrimary
                                )
                            }
                            Text(
                                text = "Reason: ${appeal.reason}",
                                fontSize = 12.sp,
                                color = SecondaryText,
                                modifier = Modifier.padding(vertical = 6.dp)
                            )
                            if (appeal.status == "Pending") {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.End,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    TextButton(onClick = { teacherViewModel.reviewCorrection(appeal.id, false) }) {
                                        Text("Reject", color = SecondaryText, fontSize = 12.sp)
                                    }
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Button(
                                        onClick = { teacherViewModel.reviewCorrection(appeal.id, true) },
                                        colors = ButtonDefaults.buttonColors(containerColor = BurgundyPrimary, contentColor = CreamSurface),
                                        shape = RoundedCornerShape(4.dp),
                                        modifier = Modifier.height(34.dp)
                                    ) {
                                        Text("Approve Appeal", fontSize = 12.sp)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
