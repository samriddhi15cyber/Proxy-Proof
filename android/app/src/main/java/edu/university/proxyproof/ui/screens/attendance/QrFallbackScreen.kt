package edu.university.proxyproof.ui.screens.attendance

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.QrCodeScanner
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import edu.university.proxyproof.data.model.User
import edu.university.proxyproof.data.model.VerificationMethod
import edu.university.proxyproof.ui.theme.*
import edu.university.proxyproof.ui.viewmodel.StudentViewModel

@Composable
fun QrFallbackScreen(
    studentViewModel: StudentViewModel,
    currentUser: User?,
    onNavigateBack: () -> Unit
) {
    val studentState by studentViewModel.uiState.collectAsState()
    val activeSession = studentState.activeSession
    var manualTokenInput by remember { mutableStateOf("") }
    var resultMessage by remember { mutableStateOf<String?>(null) }
    var isSuccess by remember { mutableStateOf(false) }

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
                            text = "QR Fallback Verification",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = CharcoalText
                        )
                        Text(
                            text = "Camera / Dynamic Token Verification",
                            fontSize = 12.sp,
                            color = SecondaryText
                        )
                    }
                }

                // Session Info Card
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
                            text = "Instructor: ${activeSession?.instructorName ?: "Dr. Marcus Vance"} · Room: ${activeSession?.room ?: "Turing Hall 304"}",
                            fontSize = 12.sp,
                            color = SecondaryText,
                            modifier = Modifier.padding(top = 2.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Scanner / Input Box
                Card(
                    colors = CardDefaults.cardColors(containerColor = CreamSurface),
                    shape = RoundedCornerShape(8.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, SubtleBorder),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(20.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Box(
                            modifier = Modifier
                                .size(110.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(PaleBurgundy)
                                .border(1.5.dp, BurgundyPrimary, RoundedCornerShape(8.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                Icons.Default.QrCodeScanner,
                                contentDescription = "QR Scanner",
                                tint = BurgundyPrimary,
                                modifier = Modifier.size(52.dp)
                            )
                        }

                        Spacer(modifier = Modifier.height(14.dp))

                        Text(
                            text = "Scan Classroom Podium Screen",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = CharcoalText
                        )

                        Text(
                            text = "Point camera at instructor's dynamic projection or enter the 8-character rotating token displayed on the board.",
                            fontSize = 12.sp,
                            color = SecondaryText,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.padding(top = 4.dp, bottom = 16.dp)
                        )

                        OutlinedTextField(
                            value = manualTokenInput,
                            onValueChange = { manualTokenInput = it.uppercase() },
                            label = { Text("Podium Rotating Token") },
                            placeholder = { Text("e.g. CS401-LIVE") },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = BurgundyPrimary,
                                unfocusedBorderColor = SubtleBorder
                            )
                        )

                        if (resultMessage != null) {
                            Spacer(modifier = Modifier.height(12.dp))
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(4.dp))
                                    .background(if (isSuccess) StatusVerifiedBg else StatusFailedBg)
                                    .padding(10.dp)
                            ) {
                                Text(
                                    text = resultMessage ?: "",
                                    color = if (isSuccess) StatusVerifiedText else StatusFailedText,
                                    fontSize = 12.sp,
                                    textAlign = TextAlign.Center
                                )
                            }
                        }
                    }
                }
            }

            // Submit Button
            Button(
                onClick = {
                    val session = activeSession
                    if (session == null) {
                        resultMessage = "No active session available."
                        isSuccess = false
                        return@Button
                    }
                    if (manualTokenInput.isBlank()) {
                        resultMessage = "Please scan or enter the rotating session token."
                        isSuccess = false
                        return@Button
                    }

                    studentViewModel.submitAttendance(
                        studentId = currentUser?.studentId ?: "stu-alex",
                        studentName = currentUser?.name ?: "Alex Rivera",
                        sessionId = session.id,
                        courseId = session.courseId,
                        courseCode = session.courseCode,
                        method = VerificationMethod.QR,
                        rssi = null
                    ) { success, msg ->
                        isSuccess = success
                        resultMessage = msg
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
                Text("Verify Fallback Attendance", fontSize = 14.sp, fontWeight = FontWeight.Medium)
            }
        }
    }
}
