package edu.university.proxyproof.ui.screens.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import edu.university.proxyproof.ui.theme.*
import edu.university.proxyproof.ui.viewmodel.AuthViewModel

@Composable
fun StudentRegisterScreen(
    authViewModel: AuthViewModel,
    onNavigateBack: () -> Unit,
    onRegistrationSuccess: () -> Unit
) {
    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var studentId by remember { mutableStateOf("") }
    var department by remember { mutableStateOf("Computer Science & Engineering") }
    var password by remember { mutableStateOf("") }
    val uiState by authViewModel.uiState.collectAsState()

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = ParchmentBackground
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(24.dp)
        ) {
            TextButton(
                onClick = onNavigateBack,
                contentPadding = PaddingValues(0.dp)
            ) {
                Text("← Back to Welcome", color = BurgundyPrimary, fontSize = 13.sp, fontWeight = FontWeight.Medium)
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "Student Registration",
                fontSize = 24.sp,
                fontWeight = FontWeight.SemiBold,
                color = CharcoalText,
                letterSpacing = (-0.5).sp
            )

            Text(
                text = "Enrol your university matriculation identity with ProxyProof.",
                fontSize = 14.sp,
                color = SecondaryText,
                modifier = Modifier.padding(top = 4.dp, bottom = 24.dp)
            )

            // Registration Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = CreamSurface),
                shape = RoundedCornerShape(8.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, SubtleBorder)
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    if (uiState.errorMessage != null) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(4.dp))
                                .background(StatusFailedBg)
                                .border(1.dp, StatusFailedText.copy(alpha = 0.3f), RoundedCornerShape(4.dp))
                                .padding(12.dp)
                        ) {
                            Text(
                                text = uiState.errorMessage ?: "",
                                color = StatusFailedText,
                                fontSize = 13.sp
                            )
                        }
                    }

                    OutlinedTextField(
                        value = name,
                        onValueChange = { name = it },
                        label = { Text("Full Name") },
                        placeholder = { Text("e.g. Alex Rivera") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = BurgundyPrimary,
                            unfocusedBorderColor = SubtleBorder
                        )
                    )

                    OutlinedTextField(
                        value = studentId,
                        onValueChange = { studentId = it },
                        label = { Text("Student Matriculation ID") },
                        placeholder = { Text("e.g. STU-2026-8814") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = BurgundyPrimary,
                            unfocusedBorderColor = SubtleBorder
                        )
                    )

                    OutlinedTextField(
                        value = department,
                        onValueChange = { department = it },
                        label = { Text("Academic Department") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = BurgundyPrimary,
                            unfocusedBorderColor = SubtleBorder
                        )
                    )

                    OutlinedTextField(
                        value = email,
                        onValueChange = { email = it },
                        label = { Text("University Email") },
                        placeholder = { Text("student@university.edu") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = BurgundyPrimary,
                            unfocusedBorderColor = SubtleBorder
                        )
                    )

                    OutlinedTextField(
                        value = password,
                        onValueChange = { password = it },
                        label = { Text("Password (min 6 characters)") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        visualTransformation = PasswordVisualTransformation(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = BurgundyPrimary,
                            unfocusedBorderColor = SubtleBorder
                        )
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Button(
                        onClick = {
                            authViewModel.registerStudent(
                                name = name,
                                email = email,
                                pass = password,
                                studentId = studentId,
                                dept = department,
                                onSuccess = onRegistrationSuccess
                            )
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = BurgundyPrimary,
                            contentColor = CreamSurface
                        ),
                        shape = RoundedCornerShape(6.dp),
                        enabled = !uiState.isLoading
                    ) {
                        if (uiState.isLoading) {
                            CircularProgressIndicator(color = CreamSurface, modifier = Modifier.size(20.dp))
                        } else {
                            Text("Enrol Student Profile", fontSize = 15.sp, fontWeight = FontWeight.Medium)
                        }
                    }
                }
            }
        }
    }
}
