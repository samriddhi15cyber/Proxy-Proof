package edu.university.proxyproof.ui.navigation

sealed class Screen(val route: String) {
    object Welcome : Screen("welcome")
    object StudentRegister : Screen("student_register")
    object StudentSignIn : Screen("student_sign_in")
    object TeacherSignIn : Screen("teacher_sign_in")
    object StudentDashboard : Screen("student_dashboard")
    object TeacherDashboard : Screen("teacher_dashboard")
    object CourseTimetable : Screen("course_timetable")
    object BleVerification : Screen("ble_verification")
    object QrFallback : Screen("qr_fallback")
    object AttendanceHistory : Screen("attendance_history")
    object AttendanceReports : Screen("attendance_reports")
    object ProfileSettings : Screen("profile_settings")
}
