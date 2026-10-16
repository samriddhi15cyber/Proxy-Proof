package edu.university.proxyproof

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.navigation.compose.rememberNavController
import edu.university.proxyproof.ui.navigation.ProxyProofNavGraph
import edu.university.proxyproof.ui.theme.ProxyProofTheme
import edu.university.proxyproof.ui.viewmodel.AuthViewModel
import edu.university.proxyproof.ui.viewmodel.BleViewModel
import edu.university.proxyproof.ui.viewmodel.StudentViewModel
import edu.university.proxyproof.ui.viewmodel.TeacherViewModel

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val app = application as ProxyProofApplication
        val authViewModel = AuthViewModel(app.authRepository)
        val studentViewModel = StudentViewModel(app.attendanceRepository, app.courseRepository)
        val teacherViewModel = TeacherViewModel(app.attendanceRepository, app.courseRepository)
        val bleViewModel = BleViewModel(this)

        setContent {
            ProxyProofTheme {
                val navController = rememberNavController()
                ProxyProofNavGraph(
                    navController = navController,
                    authViewModel = authViewModel,
                    studentViewModel = studentViewModel,
                    teacherViewModel = teacherViewModel,
                    bleViewModel = bleViewModel,
                    courseRepository = app.courseRepository
                )
            }
        }
    }
}
