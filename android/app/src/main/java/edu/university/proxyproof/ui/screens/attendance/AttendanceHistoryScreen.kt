package edu.university.proxyproof.ui.screens.attendance

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import edu.university.proxyproof.data.model.User
import edu.university.proxyproof.data.model.VerificationStatus
import edu.university.proxyproof.ui.theme.*
import edu.university.proxyproof.ui.viewmodel.StudentViewModel

@Composable
fun AttendanceHistoryScreen(
    studentViewModel: StudentViewModel,
    currentUser: User?,
    onNavigateBack: () -> Unit
) {
    val studentState by studentViewModel.uiState.collectAsState()
    var showCorrectionDialog by remember { mutableStateOf(false) }
    var appealReason by remember { mutableStateOf("") }
    var appealCourseCode by remember { mutableStateOf("CS-401") }

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = ParchmentBackground
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
        ) {
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
                        text = "Attendance History & Logs",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = CharcoalText
                    )
                    Text(
                        text = "Verified Collegiate Attendance Ledger",
                        fontSize = 12.sp,
                        color = SecondaryText
                    )
                }
            }

            // Summary Banner
            Card(
                colors = CardDefaults.cardColors(containerColor = CreamSurface),
                shape = RoundedCornerShape(8.dp),
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
                    Column {
                        Text(
                            text = "${studentState.attendedClasses} Verified Sessions",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = CharcoalText
                        )
                        Text(
                            text = "Semester Average: ${studentState.attendancePct}%",
                            fontSize = 12.sp,
                            color = SecondaryText
                        )
                    }

                    Button(
                        onClick = { showCorrectionDialog = true },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = PaleBurgundy,
                            contentColor = BurgundyPrimary
                        ),
                        shape = RoundedCornerShape(4.dp),
                        modifier = Modifier.height(36.dp)
                    ) {
                        Text("Submit Appeal", fontSize = 12.sp, fontWeight = FontWeight.Medium)
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "Verification Records",
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold,
                color = CharcoalText,
                modifier = Modifier.padding(bottom = 8.dp)
            )

            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(studentState.records) { record ->
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
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = CharcoalText
                                )
                                Text(
                                    text = "Session: ${record.sessionId} · ${record.method.name}",
                                    fontSize = 11.sp,
                                    color = SecondaryText
                                )
                                if (record.rssi != null) {
                                    Text(
                                        text = "BLE Proximity Signal: ${record.rssi} dBm",
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
            }

            if (showCorrectionDialog) {
                AlertDialog(
                    onDismissRequest = { showCorrectionDialog = false },
                    title = { Text("Submit Attendance Appeal") },
                    text = {
                        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                            Text(
                                text = "Request duty leave, hackathon representation, or medical attendance waiver.",
                                fontSize = 12.sp,
                                color = SecondaryText
                            )
                            OutlinedTextField(
                                value = appealCourseCode,
                                onValueChange = { appealCourseCode = it },
                                label = { Text("Course Code") },
                                singleLine = true,
                                modifier = Modifier.fillMaxWidth()
                            )
                            OutlinedTextField(
                                value = appealReason,
                                onValueChange = { appealReason = it },
                                label = { Text("Reason for Appeal") },
                                modifier = Modifier.fillMaxWidth()
                            )
                        }
                    },
                    confirmButton = {
                        Button(
                            onClick = {
                                if (appealReason.isNotBlank()) {
                                    studentViewModel.submitCorrection(
                                        studentId = currentUser?.studentId ?: "stu-alex",
                                        studentName = currentUser?.name ?: "Alex Rivera",
                                        courseId = "c-101",
                                        courseCode = appealCourseCode,
                                        sessionDate = "Oct 16, 2026",
                                        reason = appealReason
                                    )
                                    showCorrectionDialog = false
                                }
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = BurgundyPrimary)
                        ) {
                            Text("Submit to Faculty")
                        }
                    },
                    dismissButton = {
                        TextButton(onClick = { showCorrectionDialog = false }) {
                            Text("Cancel", color = SecondaryText)
                        }
                    }
                )
            }
        }
    }
}
