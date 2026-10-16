package edu.university.proxyproof.data.repository

import com.google.firebase.firestore.FirebaseFirestore
import edu.university.proxyproof.data.model.AttendanceRecord
import edu.university.proxyproof.data.model.AttendanceSession
import edu.university.proxyproof.data.model.CorrectionRequest
import edu.university.proxyproof.data.model.SessionStatus
import edu.university.proxyproof.data.model.VerificationMethod
import edu.university.proxyproof.data.model.VerificationStatus
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.UUID

sealed class AttendanceSubmissionResult {
    data class Success(val record: AttendanceRecord) : AttendanceSubmissionResult()
    data class Duplicate(val message: String) : AttendanceSubmissionResult()
    data class Error(val message: String) : AttendanceSubmissionResult()
}

class AttendanceRepository {

    private val firestore: FirebaseFirestore? by lazy {
        try {
            FirebaseFirestore.getInstance()
        } catch (_: Exception) {
            null
        }
    }

    // Currently active live session (simulated or remote)
    private val _activeSession = MutableStateFlow<AttendanceSession?>(
        AttendanceSession(
            id = "sess-live-401",
            courseId = "c-101",
            courseCode = "CS-401",
            courseTitle = "Distributed Systems & Cloud Computing",
            instructorId = "fac-marcus",
            instructorName = "Dr. Marcus Vance",
            room = "Turing Hall 304",
            startedAt = System.currentTimeMillis() - 10 * 60 * 1000,
            expiresAt = System.currentTimeMillis() + 15 * 60 * 1000,
            status = SessionStatus.ACTIVE,
            minRssiThreshold = -75,
            currentRotatingToken = "CS401-LIVE",
            tokenExpiresAt = System.currentTimeMillis() + 15000L
        )
    )
    val activeSession: StateFlow<AttendanceSession?> = _activeSession.asStateFlow()

    // Records ledger
    private val _records = MutableStateFlow<List<AttendanceRecord>>(
        listOf(
            AttendanceRecord(
                id = "rec-001",
                sessionId = "sess-past-1",
                courseId = "c-101",
                courseCode = "CS-401",
                studentId = "stu-alex",
                studentName = "Alex Rivera",
                timestamp = System.currentTimeMillis() - 86400000L * 2,
                method = VerificationMethod.BLE,
                status = VerificationStatus.VERIFIED,
                rssi = -64,
                deviceFingerprint = "Pixel-8-Pro-B4A1"
            ),
            AttendanceRecord(
                id = "rec-002",
                sessionId = "sess-past-2",
                courseId = "c-102",
                courseCode = "CS-302",
                studentId = "stu-alex",
                studentName = "Alex Rivera",
                timestamp = System.currentTimeMillis() - 86400000L * 3,
                method = VerificationMethod.BLE,
                status = VerificationStatus.VERIFIED,
                rssi = -58,
                deviceFingerprint = "Pixel-8-Pro-B4A1"
            ),
            AttendanceRecord(
                id = "rec-003",
                sessionId = "sess-past-3",
                courseId = "c-103",
                courseCode = "MATH-240",
                studentId = "stu-alex",
                studentName = "Alex Rivera",
                timestamp = System.currentTimeMillis() - 86400000L * 5,
                method = VerificationMethod.QR,
                status = VerificationStatus.VERIFIED,
                rssi = null,
                deviceFingerprint = "Pixel-8-Pro-B4A1"
            ),
            AttendanceRecord(
                id = "rec-004",
                sessionId = "sess-live-401",
                courseId = "c-101",
                courseCode = "CS-401",
                studentId = "stu-2",
                studentName = "Devon Chen",
                timestamp = System.currentTimeMillis() - 120000L,
                method = VerificationMethod.BLE,
                status = VerificationStatus.VERIFIED,
                rssi = -61,
                deviceFingerprint = "Galaxy-S24-E901"
            ),
            AttendanceRecord(
                id = "rec-005",
                sessionId = "sess-live-401",
                courseId = "c-101",
                courseCode = "CS-401",
                studentId = "stu-3",
                studentName = "Kavita Rao",
                timestamp = System.currentTimeMillis() - 180000L,
                method = VerificationMethod.BLE,
                status = VerificationStatus.NEEDS_REVIEW,
                rssi = -88,
                deviceFingerprint = "OnePlus-12-8821",
                failureReason = "Weak signal (-88 dBm). Proximity border."
            )
        )
    )
    val records: StateFlow<List<AttendanceRecord>> = _records.asStateFlow()

    // Correction requests
    private val _corrections = MutableStateFlow<List<CorrectionRequest>>(
        listOf(
            CorrectionRequest(
                id = "cor-01",
                studentId = "stu-alex",
                studentName = "Alex Rivera",
                courseId = "c-103",
                courseCode = "MATH-240",
                sessionDate = "Oct 12, 2026",
                requestedStatus = "Duty Leave",
                reason = "Attended ACM collegiate hackathon finals representing the university.",
                status = "Pending"
            )
        )
    )
    val corrections: StateFlow<List<CorrectionRequest>> = _corrections.asStateFlow()

    fun submitAttendance(
        studentId: String,
        studentName: String,
        sessionId: String,
        courseId: String,
        courseCode: String,
        method: VerificationMethod,
        rssi: Int?,
        deviceFingerprint: String
    ): AttendanceSubmissionResult {
        // Prevent duplicate submissions for a single session
        val existing = _records.value.firstOrNull { it.sessionId == sessionId && it.studentId == studentId }
        if (existing != null) {
            return AttendanceSubmissionResult.Duplicate("Attendance already registered for this session at ${formatTime(existing.timestamp)}")
        }

        val session = _activeSession.value
        if (session == null || session.status != SessionStatus.ACTIVE) {
            return AttendanceSubmissionResult.Error("Attendance session is no longer active.")
        }

        // Validate RSSI if BLE method
        val status = if (method == VerificationMethod.BLE && rssi != null) {
            if (rssi >= session.minRssiThreshold) VerificationStatus.VERIFIED
            else if (rssi >= session.minRssiThreshold - 15) VerificationStatus.NEEDS_REVIEW
            else VerificationStatus.FAILED
        } else {
            VerificationStatus.VERIFIED
        }

        val record = AttendanceRecord(
            id = "rec-" + UUID.randomUUID().toString().take(8),
            sessionId = sessionId,
            courseId = courseId,
            courseCode = courseCode,
            studentId = studentId,
            studentName = studentName,
            timestamp = System.currentTimeMillis(),
            method = method,
            status = status,
            rssi = rssi,
            deviceFingerprint = deviceFingerprint,
            failureReason = if (status == VerificationStatus.NEEDS_REVIEW) "Marginal signal strength ($rssi dBm)" else null
        )

        _records.value = listOf(record) + _records.value
        return AttendanceSubmissionResult.Success(record)
    }

    fun startSession(courseId: String, courseCode: String, courseTitle: String, instructorId: String, instructorName: String, room: String): AttendanceSession {
        val session = AttendanceSession(
            id = "sess-" + UUID.randomUUID().toString().take(8),
            courseId = courseId,
            courseCode = courseCode,
            courseTitle = courseTitle,
            instructorId = instructorId,
            instructorName = instructorName,
            room = room,
            startedAt = System.currentTimeMillis(),
            expiresAt = System.currentTimeMillis() + 15 * 60 * 1000,
            status = SessionStatus.ACTIVE,
            minRssiThreshold = -75,
            currentRotatingToken = courseCode + "-" + (1000..9999).random(),
            tokenExpiresAt = System.currentTimeMillis() + 15000L
        )
        _activeSession.value = session
        return session
    }

    fun endSession() {
        _activeSession.value = _activeSession.value?.copy(status = SessionStatus.ENDED)
    }

    fun submitCorrectionRequest(
        studentId: String,
        studentName: String,
        courseId: String,
        courseCode: String,
        sessionDate: String,
        reason: String
    ) {
        val correction = CorrectionRequest(
            id = "cor-" + UUID.randomUUID().toString().take(6),
            studentId = studentId,
            studentName = studentName,
            courseId = courseId,
            courseCode = courseCode,
            sessionDate = sessionDate,
            reason = reason,
            status = "Pending"
        )
        _corrections.value = listOf(correction) + _corrections.value
    }

    fun updateCorrectionStatus(correctionId: String, approved: Boolean) {
        _corrections.value = _corrections.value.map {
            if (it.id == correctionId) {
                it.copy(status = if (approved) "Approved" else "Rejected")
            } else it
        }
    }

    fun getStudentStats(studentId: String): Triple<Int, Int, Double> {
        val studentRecords = _records.value.filter { it.studentId == studentId && it.status == VerificationStatus.VERIFIED }
        val totalSessions = 28 // Current term session baseline
        val attended = studentRecords.size + 23 // Add semester historical base
        val pct = (attended.toDouble() / totalSessions.toDouble() * 100.0).coerceAtMost(100.0)
        return Triple(attended, totalSessions, pct)
    }

    fun exportRecordsCsv(): String {
        val sb = StringBuilder()
        sb.append("Record ID,Session ID,Course Code,Student ID,Student Name,Timestamp,Method,Status,RSSI,Device Fingerprint\n")
        _records.value.forEach {
            sb.append("${it.id},${it.sessionId},${it.courseCode},${it.studentId},\"${it.studentName}\",${it.timestamp},${it.method},${it.status},${it.rssi ?: ""},${it.deviceFingerprint}\n")
        }
        return sb.toString()
    }

    private fun formatTime(millis: Long): String {
        val sdf = java.text.SimpleDateFormat("hh:mm a", java.util.Locale.getDefault())
        return sdf.format(java.util.Date(millis))
    }
}
