package edu.university.proxyproof.data.repository

import android.content.Context
import android.content.SharedPreferences
import com.google.firebase.auth.FirebaseAuth
import edu.university.proxyproof.data.model.User
import edu.university.proxyproof.data.model.UserRole
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.tasks.await
import kotlinx.coroutines.withContext

sealed class AuthResult {
    data class Success(val user: User) : AuthResult()
    data class Error(val message: String) : AuthResult()
}

class AuthRepository(private val context: Context) {

    private val prefs: SharedPreferences = context.getSharedPreferences("proxyproof_auth", Context.MODE_PRIVATE)
    private val _currentUser = MutableStateFlow<User?>(null)
    val currentUser: StateFlow<User?> = _currentUser.asStateFlow()

    private val isDemoModeFlow = MutableStateFlow(false)
    val isDemoMode: StateFlow<Boolean> = isDemoModeFlow.asStateFlow()

    private val firebaseAuth: FirebaseAuth? by lazy {
        try {
            FirebaseAuth.getInstance()
        } catch (_: Exception) {
            null
        }
    }

    init {
        loadPersistedUser()
    }

    private fun loadPersistedUser() {
        val id = prefs.getString("user_id", null) ?: return
        val name = prefs.getString("user_name", "Student") ?: "Student"
        val email = prefs.getString("user_email", "") ?: ""
        val roleStr = prefs.getString("user_role", "STUDENT")
        val studentId = prefs.getString("user_student_id", null)
        val facultyId = prefs.getString("user_faculty_id", null)
        val dept = prefs.getString("user_dept", "Computer Science") ?: "Computer Science"
        val isDemo = prefs.getBoolean("is_demo", false)

        isDemoModeFlow.value = isDemo
        _currentUser.value = User(
            id = id,
            name = name,
            email = email,
            role = UserRole.fromString(roleStr),
            studentId = studentId,
            facultyId = facultyId,
            department = dept,
            enrolledCourseIds = listOf("c-101", "c-102", "c-103", "c-104"),
            assignedCourseIds = listOf("c-101", "c-102")
        )
    }

    suspend fun signInWithEmail(email: String, password: String, expectedRole: UserRole): AuthResult = withContext(Dispatchers.IO) {
        if (email.isBlank() || password.isBlank()) {
            return@withContext AuthResult.Error("Please enter both email and password")
        }

        // Try Firebase Authentication if initialized
        val auth = firebaseAuth
        if (auth != null) {
            try {
                val result = auth.signInWithEmailAndPassword(email, password).await()
                val firebaseUser = result.user
                if (firebaseUser != null) {
                    val user = User(
                        id = firebaseUser.uid,
                        name = firebaseUser.displayName ?: email.substringBefore("@").replace(".", " ").capitalizeWords(),
                        email = firebaseUser.email ?: email,
                        role = expectedRole,
                        studentId = if (expectedRole == UserRole.STUDENT) "STU-${firebaseUser.uid.take(6).uppercase()}" else null,
                        facultyId = if (expectedRole == UserRole.TEACHER) "FAC-${firebaseUser.uid.take(6).uppercase()}" else null,
                        department = "School of Computing & Engineering"
                    )
                    persistUser(user, isDemo = false)
                    return@withContext AuthResult.Success(user)
                }
            } catch (e: Exception) {
                // If Firebase fails with invalid credentials, report genuine error
                val msg = e.localizedMessage ?: "Authentication failed"
                if (!msg.contains("no app has been configured", ignoreCase = true) &&
                    !msg.contains("default firebaseapp is not initialized", ignoreCase = true)
                ) {
                    return@withContext AuthResult.Error(msg)
                }
            }
        }

        // Demo / Verification fallback for collegiate testing without configured Firebase
        if (password.length >= 6) {
            val user = User(
                id = if (expectedRole == UserRole.STUDENT) "stu-alex" else "fac-marcus",
                name = if (expectedRole == UserRole.STUDENT) "Alex Rivera" else "Dr. Marcus Vance",
                email = email,
                role = expectedRole,
                studentId = if (expectedRole == UserRole.STUDENT) "STU-2026-8814" else null,
                facultyId = if (expectedRole == UserRole.TEACHER) "FAC-7702-CS" else null,
                department = "Department of Computer Science"
            )
            persistUser(user, isDemo = true)
            return@withContext AuthResult.Success(user)
        } else {
            return@withContext AuthResult.Error("Password must be at least 6 characters")
        }
    }

    suspend fun registerStudent(name: String, email: String, password: String, studentId: String, department: String): AuthResult = withContext(Dispatchers.IO) {
        if (name.isBlank() || email.isBlank() || password.isBlank() || studentId.isBlank()) {
            return@withContext AuthResult.Error("All fields are required for student enrolment")
        }

        val auth = firebaseAuth
        if (auth != null) {
            try {
                val result = auth.createUserWithEmailAndPassword(email, password).await()
                val firebaseUser = result.user
                if (firebaseUser != null) {
                    val user = User(
                        id = firebaseUser.uid,
                        name = name,
                        email = email,
                        role = UserRole.STUDENT,
                        studentId = studentId,
                        department = department
                    )
                    persistUser(user, isDemo = false)
                    return@withContext AuthResult.Success(user)
                }
            } catch (e: Exception) {
                val msg = e.localizedMessage ?: "Registration error"
                if (!msg.contains("no app has been configured", ignoreCase = true) &&
                    !msg.contains("default firebaseapp is not initialized", ignoreCase = true)
                ) {
                    return@withContext AuthResult.Error(msg)
                }
            }
        }

        val user = User(
            id = "stu-" + studentId.lowercase().replace(" ", "-"),
            name = name,
            email = email,
            role = UserRole.STUDENT,
            studentId = studentId,
            department = department
        )
        persistUser(user, isDemo = true)
        return@withContext AuthResult.Success(user)
    }

    fun useDemoPersona(role: UserRole) {
        val user = if (role == UserRole.STUDENT) {
            User(
                id = "stu-alex",
                name = "Alex Rivera",
                email = "a.rivera@university.edu",
                role = UserRole.STUDENT,
                studentId = "STU-2026-8814",
                department = "Computer Science & Engineering",
                enrolledCourseIds = listOf("c-101", "c-102", "c-103", "c-104")
            )
        } else {
            User(
                id = "fac-marcus",
                name = "Dr. Marcus Vance",
                email = "m.vance@university.edu",
                role = UserRole.TEACHER,
                facultyId = "FAC-7702-CS",
                department = "Computer Science & Engineering",
                assignedCourseIds = listOf("c-101", "c-102")
            )
        }
        persistUser(user, isDemo = true)
    }

    fun signOut() {
        try {
            firebaseAuth?.signOut()
        } catch (_: Exception) {}

        prefs.edit().clear().apply()
        _currentUser.value = null
        isDemoModeFlow.value = false
    }

    private fun persistUser(user: User, isDemo: Boolean) {
        prefs.edit()
            .putString("user_id", user.id)
            .putString("user_name", user.name)
            .putString("user_email", user.email)
            .putString("user_role", user.role.name)
            .putString("user_student_id", user.studentId)
            .putString("user_faculty_id", user.facultyId)
            .putString("user_dept", user.department)
            .putBoolean("is_demo", isDemo)
            .apply()

        isDemoModeFlow.value = isDemo
        _currentUser.value = user
    }

    private fun String.capitalizeWords(): String = split(" ").joinToString(" ") { it.replaceFirstChar { char -> char.uppercase() } }
}
