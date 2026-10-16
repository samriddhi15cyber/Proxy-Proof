package edu.university.proxyproof

import android.app.Application
import edu.university.proxyproof.data.repository.AttendanceRepository
import edu.university.proxyproof.data.repository.AuthRepository
import edu.university.proxyproof.data.repository.CourseRepository

class ProxyProofApplication : Application() {

    lateinit var authRepository: AuthRepository
        private set

    lateinit var attendanceRepository: AttendanceRepository
        private set

    lateinit var courseRepository: CourseRepository
        private set

    override fun onCreate() {
        super.onCreate()
        authRepository = AuthRepository(this)
        attendanceRepository = AttendanceRepository()
        courseRepository = CourseRepository()
    }
}
