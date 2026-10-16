package edu.university.proxyproof.ui.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import edu.university.proxyproof.data.model.UserRole
import edu.university.proxyproof.data.repository.CourseRepository
import edu.university.proxyproof.ui.screens.attendance.AttendanceHistoryScreen
import edu.university.proxyproof.ui.screens.attendance.BleVerificationScreen
import edu.university.proxyproof.ui.screens.attendance.QrFallbackScreen
import edu.university.proxyproof.ui.screens.auth.StudentRegisterScreen
import edu.university.proxyproof.ui.screens.auth.StudentSignInScreen
import edu.university.proxyproof.ui.screens.auth.TeacherSignInScreen
import edu.university.proxyproof.ui.screens.course.CourseTimetableScreen
import edu.university.proxyproof.ui.screens.profile.ProfileSettingsScreen
import edu.university.proxyproof.ui.screens.reports.AttendanceReportsScreen
import edu.university.proxyproof.ui.screens.student.StudentDashboardScreen
import edu.university.proxyproof.ui.screens.teacher.TeacherDashboardScreen
import edu.university.proxyproof.ui.screens.welcome.WelcomeScreen
import edu.university.proxyproof.ui.viewmodel.AuthViewModel
import edu.university.proxyproof.ui.viewmodel.BleViewModel
import edu.university.proxyproof.ui.viewmodel.StudentViewModel
import edu.university.proxyproof.ui.viewmodel.TeacherViewModel

@Composable
fun ProxyProofNavGraph(
    navController: NavHostController,
    authViewModel: AuthViewModel,
    studentViewModel: StudentViewModel,
    teacherViewModel: TeacherViewModel,
    bleViewModel: BleViewModel,
    courseRepository: CourseRepository
) {
    val authState by authViewModel.uiState.collectAsState()
    val startDestination = if (authState.currentUser != null) {
        if (authState.currentUser?.role == UserRole.TEACHER) Screen.TeacherDashboard.route
        else Screen.StudentDashboard.route
    } else {
        Screen.Welcome.route
    }

    NavHost(
        navController = navController,
        startDestination = startDestination
    ) {
        composable(Screen.Welcome.route) {
            WelcomeScreen(
                onNavigateToStudentSignIn = { navController.navigate(Screen.StudentSignIn.route) },
                onNavigateToTeacherSignIn = { navController.navigate(Screen.TeacherSignIn.route) },
                onNavigateToStudentRegister = { navController.navigate(Screen.StudentRegister.route) },
                onUseDemo = { role ->
                    authViewModel.useDemoPersona(role) {
                        if (role == UserRole.TEACHER) {
                            navController.navigate(Screen.TeacherDashboard.route) {
                                popUpTo(Screen.Welcome.route) { inclusive = true }
                            }
                        } else {
                            navController.navigate(Screen.StudentDashboard.route) {
                                popUpTo(Screen.Welcome.route) { inclusive = true }
                            }
                        }
                    }
                }
            )
        }

        composable(Screen.StudentRegister.route) {
            StudentRegisterScreen(
                authViewModel = authViewModel,
                onNavigateBack = { navController.popBackStack() },
                onRegistrationSuccess = {
                    navController.navigate(Screen.StudentDashboard.route) {
                        popUpTo(Screen.Welcome.route) { inclusive = true }
                    }
                }
            )
        }

        composable(Screen.StudentSignIn.route) {
            StudentSignInScreen(
                authViewModel = authViewModel,
                onNavigateBack = { navController.popBackStack() },
                onSignInSuccess = {
                    navController.navigate(Screen.StudentDashboard.route) {
                        popUpTo(Screen.Welcome.route) { inclusive = true }
                    }
                },
                onNavigateToRegister = { navController.navigate(Screen.StudentRegister.route) }
            )
        }

        composable(Screen.TeacherSignIn.route) {
            TeacherSignInScreen(
                authViewModel = authViewModel,
                onNavigateBack = { navController.popBackStack() },
                onSignInSuccess = {
                    navController.navigate(Screen.TeacherDashboard.route) {
                        popUpTo(Screen.Welcome.route) { inclusive = true }
                    }
                }
            )
        }

        composable(Screen.StudentDashboard.route) {
            StudentDashboardScreen(
                studentViewModel = studentViewModel,
                currentUser = authState.currentUser,
                onNavigateToBle = { navController.navigate(Screen.BleVerification.route) },
                onNavigateToQr = { navController.navigate(Screen.QrFallback.route) },
                onNavigateToTimetable = { navController.navigate(Screen.CourseTimetable.route) },
                onNavigateToHistory = { navController.navigate(Screen.AttendanceHistory.route) },
                onNavigateToProfile = { navController.navigate(Screen.ProfileSettings.route) }
            )
        }

        composable(Screen.TeacherDashboard.route) {
            TeacherDashboardScreen(
                teacherViewModel = teacherViewModel,
                bleViewModel = bleViewModel,
                currentUser = authState.currentUser,
                onNavigateToReports = { navController.navigate(Screen.AttendanceReports.route) },
                onNavigateToTimetable = { navController.navigate(Screen.CourseTimetable.route) },
                onNavigateToProfile = { navController.navigate(Screen.ProfileSettings.route) }
            )
        }

        composable(Screen.CourseTimetable.route) {
            CourseTimetableScreen(
                courseRepository = courseRepository,
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable(Screen.BleVerification.route) {
            BleVerificationScreen(
                bleViewModel = bleViewModel,
                studentViewModel = studentViewModel,
                currentUser = authState.currentUser,
                onNavigateBack = { navController.popBackStack() },
                onNavigateToQr = { navController.navigate(Screen.QrFallback.route) }
            )
        }

        composable(Screen.QrFallback.route) {
            QrFallbackScreen(
                studentViewModel = studentViewModel,
                currentUser = authState.currentUser,
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable(Screen.AttendanceHistory.route) {
            AttendanceHistoryScreen(
                studentViewModel = studentViewModel,
                currentUser = authState.currentUser,
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable(Screen.AttendanceReports.route) {
            AttendanceReportsScreen(
                teacherViewModel = teacherViewModel,
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable(Screen.ProfileSettings.route) {
            ProfileSettingsScreen(
                authViewModel = authViewModel,
                currentUser = authState.currentUser,
                onNavigateBack = { navController.popBackStack() },
                onSignOut = {
                    navController.navigate(Screen.Welcome.route) {
                        popUpTo(0) { inclusive = true }
                    }
                }
            )
        }
    }
}
