package edu.university.proxyproof.ui.screens.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import edu.university.proxyproof.data.model.UserRole
import edu.university.proxyproof.ui.theme.*
import edu.university.proxyproof.ui.viewmodel.AuthViewModel

@Composable
fun TeacherSignInScreen(
    authViewModel: AuthViewModel,
    onNavigateBack: () -> Unit,
    onSignInSuccess: () -> Unit
) {
    var email by remember { mutableStateOf("m.vance@university.edu") }
    var password by remember { mutableStateOf("faculty123") }
    val uiState by authViewModel.uiState.collectAsState()

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = ParchmentBackground
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Column {
                TextButton(
                    onClick = onNavigateBack,
                    contentPadding = PaddingValues(0.dp)
                ) {
                    Text("← Back to Welcome", color = BurgundyPrimary, fontSize = 13.sp, fontWeight = FontWeight.Medium)
                }

                Spacer(modifier = Modifier.height(20.dp))

                Text(
                    text = "Faculty Sign In",
                    fontSize = 26.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = CharcoalText,
                    letterSpacing = (-0.5).sp
                )

                Text(
                    text = "Instructor portal for launching classroom BLE beacons and verifying rosters.",
                    fontSize = 14.sp,
                    color = SecondaryText,
                    modifier = Modifier.padding(top = 4.dp, bottom = 24.dp)
                )

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
                            value = email,
                            onValueChange = { email = it },
                            label = { Text("Faculty Institutional Email") },
                            placeholder = { Text("m.vance@university.edu") },
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
                            label = { Text("Faculty Password") },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            visualTransformation = PasswordVisualTransformation(),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = BurgundyPrimary,
                                unfocusedBorderColor = SubtleBorder
                            )
                        )

                        Button(
                            onClick = {
                                authViewModel.signIn(
                                    email = email,
                                    pass = password,
                                    role = UserRole.TEACHER,
                                    onSuccess = onSignInSuccess
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
                                Text("Sign In to Faculty Portal", fontSize = 15.sp, fontWeight = FontWeight.Medium)
                            }
                        }
                    }
                }
            }

            // Trust note
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(6.dp))
                    .background(PaleBurgundy)
                    .padding(12.dp)
            ) {
                Text(
                    text = "Note: Faculty roles require institutional credential verification. Contact the department registrar for new instructor onboarding.",
                    fontSize = 11.sp,
                    color = BurgundyPrimary
                )
            }
        }
    }
}
