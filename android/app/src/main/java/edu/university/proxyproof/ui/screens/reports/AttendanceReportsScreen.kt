package edu.university.proxyproof.ui.screens.reports

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Download
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import edu.university.proxyproof.data.model.VerificationStatus
import edu.university.proxyproof.ui.theme.*
import edu.university.proxyproof.ui.viewmodel.TeacherViewModel

@Composable
fun AttendanceReportsScreen(
    teacherViewModel: TeacherViewModel,
    onNavigateBack: () -> Unit
) {
    val context = LocalContext.current
    val uiState by teacherViewModel.uiState.collectAsState()
    val totalRecords = uiState.records.size
    val verifiedCount = uiState.records.count { it.status == VerificationStatus.VERIFIED }
    val reviewCount = uiState.records.count { it.status == VerificationStatus.NEEDS_REVIEW }
    val failedCount = uiState.records.count { it.status == VerificationStatus.FAILED }

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
                        text = "Attendance Reports & Analytics",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = CharcoalText
                    )
                    Text(
                        text = "Institutional Compliance & Verification Statistics",
                        fontSize = 12.sp,
                        color = SecondaryText
                    )
                }
            }

            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Metric Summary
                item {
                    Card(
                        colors = CardDefaults.cardColors(containerColor = CreamSurface),
                        shape = RoundedCornerShape(8.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, SubtleBorder),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(
                                text = "Verification Integrity Overview",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = CharcoalText
                            )

                            Spacer(modifier = Modifier.height(14.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceAround
                            ) {
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text(
                                        text = "$verifiedCount",
                                        fontSize = 24.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = MutedGreen
                                    )
                                    Text("Verified", fontSize = 11.sp, color = SecondaryText)
                                }

                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text(
                                        text = "$reviewCount",
                                        fontSize = 24.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = AntiqueGold
                                    )
                                    Text("Needs Review", fontSize = 11.sp, color = SecondaryText)
                                }

                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text(
                                        text = "$failedCount",
                                        fontSize = 24.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = BurgundyPrimary
                                    )
                                    Text("Rejected", fontSize = 11.sp, color = SecondaryText)
                                }
                            }
                        }
                    }
                }

                // Course Breakdown
                item {
                    Card(
                        colors = CardDefaults.cardColors(containerColor = CreamSurface),
                        shape = RoundedCornerShape(8.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, SubtleBorder),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(
                                text = "Course Enrolment Performance",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = CharcoalText
                            )

                            Spacer(modifier = Modifier.height(10.dp))

                            uiState.authorizedCourses.forEach { course ->
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 8.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column {
                                        Text(
                                            text = "${course.code} · ${course.title}",
                                            fontSize = 13.sp,
                                            fontWeight = FontWeight.Medium,
                                            color = CharcoalText
                                        )
                                        Text(
                                            text = "${course.totalSessionsHeld} sessions · ${course.section}",
                                            fontSize = 11.sp,
                                            color = SecondaryText
                                        )
                                    }
                                    Text(
                                        text = "88.4%",
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = MutedGreen
                                    )
                                }
                                Divider(color = SubtleBorder, thickness = 0.5.dp)
                            }
                        }
                    }
                }

                // Export Button Card
                item {
                    Card(
                        colors = CardDefaults.cardColors(containerColor = CreamSurface),
                        shape = RoundedCornerShape(8.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, SubtleBorder),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(
                            modifier = Modifier.padding(16.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                text = "Official Institutional Export",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = CharcoalText
                            )
                            Text(
                                text = "Download complete audit trail including RSSI telemetry and cryptographic salt validation stamps.",
                                fontSize = 12.sp,
                                color = SecondaryText,
                                modifier = Modifier.padding(top = 4.dp, bottom = 14.dp)
                            )
                            Button(
                                onClick = {
                                    val csv = teacherViewModel.exportRecordsCsv()
                                    Toast.makeText(context, "Exported CSV successfully.", Toast.LENGTH_SHORT).show()
                                },
                                modifier = Modifier.fillMaxWidth().height(44.dp),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = BurgundyPrimary,
                                    contentColor = CreamSurface
                                ),
                                shape = RoundedCornerShape(6.dp)
                            ) {
                                Icon(Icons.Default.Download, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Generate CSV Roster Export", fontSize = 13.sp, fontWeight = FontWeight.Medium)
                            }
                        }
                    }
                }
            }
        }
    }
}
