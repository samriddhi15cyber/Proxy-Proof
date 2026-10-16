package edu.university.proxyproof.data.model

import java.io.Serializable

enum class UserRole {
    STUDENT,
    TEACHER,
    ADMIN;

    companion object {
        fun fromString(role: String?): UserRole = when (role?.lowercase()) {
            "teacher", "faculty", "instructor" -> TEACHER
            "admin", "administrator" -> ADMIN
            else -> STUDENT
        }
    }
}

enum class VerificationMethod {
    BLE,
    QR,
    MANUAL_OVERRIDE;

    companion object {
        fun fromString(method: String?): VerificationMethod = when (method?.lowercase()) {
            "qr" -> QR
            "manual", "manual_override" -> MANUAL_OVERRIDE
            else -> BLE
        }
    }
}

enum class VerificationStatus {
    VERIFIED,
    PENDING,
    NEEDS_REVIEW,
    FAILED,
    EXCUSED;

    companion object {
        fun fromString(status: String?): VerificationStatus = when (status?.lowercase()) {
            "pending" -> PENDING
            "needs_review" -> NEEDS_REVIEW
            "failed" -> FAILED
            "excused" -> EXCUSED
            else -> VERIFIED
        }
    }
}

enum class SessionStatus {
    ACTIVE,
    PAUSED,
    ENDED
}

data class User(
    val id: String = "",
    val name: String = "",
    val email: String = "",
    val role: UserRole = UserRole.STUDENT,
    val studentId: String? = null,
    val facultyId: String? = null,
    val department: String = "Computer Science & Engineering",
    val avatarUrl: String = "",
    val enrolledCourseIds: List<String> = emptyList(),
    val assignedCourseIds: List<String> = emptyList()
) : Serializable

data class Course(
    val id: String = "",
    val code: String = "",
    val title: String = "",
    val section: String = "Section A",
    val instructorId: String = "",
    val instructorName: String = "",
    val room: String = "",
    val scheduleDay: String = "Mon / Wed",
    val scheduleTime: String = "10:00 - 11:30 AM",
    val credits: Int = 4,
    val totalSessionsHeld: Int = 24,
    val enrolledStudentIds: List<String> = emptyList()
) : Serializable

data class AttendanceSession(
    val id: String = "",
    val courseId: String = "",
    val courseCode: String = "",
    val courseTitle: String = "",
    val instructorId: String = "",
    val instructorName: String = "",
    val room: String = "",
    val startedAt: Long = System.currentTimeMillis(),
    val expiresAt: Long = System.currentTimeMillis() + 15 * 60 * 1000,
    val status: SessionStatus = SessionStatus.ACTIVE,
    val allowedMethods: List<String> = listOf("ble", "qr"),
    val minRssiThreshold: Int = -75,
    val currentRotatingToken: String = "",
    val tokenExpiresAt: Long = 0L
) : Serializable

data class AttendanceRecord(
    val id: String = "",
    val sessionId: String = "",
    val courseId: String = "",
    val courseCode: String = "",
    val studentId: String = "",
    val studentName: String = "",
    val timestamp: Long = System.currentTimeMillis(),
    val method: VerificationMethod = VerificationMethod.BLE,
    val status: VerificationStatus = VerificationStatus.VERIFIED,
    val rssi: Int? = null,
    val deviceFingerprint: String = "",
    val failureReason: String? = null
) : Serializable

data class CorrectionRequest(
    val id: String = "",
    val studentId: String = "",
    val studentName: String = "",
    val courseId: String = "",
    val courseCode: String = "",
    val sessionDate: String = "",
    val requestedStatus: String = "Present",
    val reason: String = "",
    val documentationUrl: String? = null,
    val status: String = "Pending", // Pending, Approved, Rejected
    val submittedAt: Long = System.currentTimeMillis()
) : Serializable

data class BleBeaconPayload(
    val serviceUuid: String,
    val courseId: String,
    val sessionId: String,
    val rotatingSalt: String,
    val rssi: Int,
    val detectedAt: Long = System.currentTimeMillis()
)
