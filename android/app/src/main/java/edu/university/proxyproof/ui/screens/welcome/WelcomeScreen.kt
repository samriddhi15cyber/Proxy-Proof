package edu.university.proxyproof.ui.screens.welcome

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import edu.university.proxyproof.data.model.UserRole
import edu.university.proxyproof.ui.theme.*

@Composable
fun WelcomeScreen(
    onNavigateToStudentSignIn: () -> Unit,
    onNavigateToTeacherSignIn: () -> Unit,
    onNavigateToStudentRegister: () -> Unit,
    onUseDemo: (UserRole) -> Unit
) {
    Surface(
        modifier = Modifier.fillMaxSize(),
        color = ParchmentBackground
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // Top University Crest & Header
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.padding(top = 40.dp)
            ) {
                // Academic Verification Seal
                Box(
                    modifier = Modifier
                        .size(64.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(BurgundyPrimary),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "P",
                        fontSize = 28.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = CreamSurface
                    )
                }

                Spacer(modifier = Modifier.height(20.dp))

                Text(
                    text = "ProxyProof",
                    fontSize = 28.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = CharcoalText,
                    letterSpacing = (-0.5).sp
                )

                Spacer(modifier = Modifier.height(6.dp))

                Text(
                    text = "University Academic Attendance & Verification Platform",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Normal,
                    color = SecondaryText,
                    textAlign = TextAlign.Center
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Subtle Institutional Badge
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .clip(RoundedCornerShape(4.dp))
                        .background(PaleBurgundy)
                        .border(1.dp, SubtleBorder, RoundedCornerShape(4.dp))
                        .padding(horizontal = 10.dp, vertical = 4.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(6.dp)
                            .clip(RoundedCornerShape(3.dp))
                            .background(AntiqueGold)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Secure Bluetooth Low Energy & Cryptographic Salts",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium,
                        color = BurgundyPrimary
                    )
                }
            }

            // Main Action Cards
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 24.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                // Student Sign In Button
                Button(
                    onClick = onNavigateToStudentSignIn,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = BurgundyPrimary,
                        contentColor = CreamSurface
                    ),
                    shape = RoundedCornerShape(6.dp)
                ) {
                    Text(
                        text = "Student Portal Sign In",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Medium
                    )
                }

                // Faculty Sign In Button
                OutlinedButton(
                    onClick = onNavigateToTeacherSignIn,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    colors = ButtonDefaults.outlinedButtonColors(
                        contentColor = BurgundyPrimary
                    ),
                    border = ButtonDefaults.outlinedButtonBorder.copy(
                        brush = androidx.compose.ui.graphics.SolidColor(BurgundyPrimary)
                    ),
                    shape = RoundedCornerShape(6.dp)
                ) {
                    Text(
                        text = "Faculty & Instructor Sign In",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Medium
                    )
                }

                // Student Enrolment
                TextButton(
                    onClick = onNavigateToStudentRegister,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = "New student? Register matriculation profile",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Medium,
                        color = SecondaryText
                    )
                }
            }

            // Sandbox / Demo Persona Footer
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(8.dp))
                    .background(CreamSurface)
                    .border(1.dp, SubtleBorder, RoundedCornerShape(8.dp))
                    .padding(16.dp)
            ) {
                Text(
                    text = "Demonstration Sandbox",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = CharcoalText
                )
                Text(
                    text = "Explore the application immediately with collegiate test personas",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Normal,
                    color = SecondaryText,
                    textAlign = TextAlign.Center
                )
                Spacer(modifier = Modifier.height(10.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Button(
                        onClick = { onUseDemo(UserRole.STUDENT) },
                        modifier = Modifier.weight(1f).height(38.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = PaleBurgundy, contentColor = BurgundyPrimary),
                        shape = RoundedCornerShape(4.dp)
                    ) {
                        Text("Demo Student", fontSize = 12.sp, fontWeight = FontWeight.Medium)
                    }
                    Button(
                        onClick = { onUseDemo(UserRole.TEACHER) },
                        modifier = Modifier.weight(1f).height(38.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = PaleBurgundy, contentColor = BurgundyPrimary),
                        shape = RoundedCornerShape(4.dp)
                    ) {
                        Text("Demo Faculty", fontSize = 12.sp, fontWeight = FontWeight.Medium)
                    }
                }
            }
        }
    }
}
