package edu.university.proxyproof.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import edu.university.proxyproof.data.model.AttendanceRecord
import edu.university.proxyproof.data.model.AttendanceSession
import edu.university.proxyproof.data.model.CorrectionRequest
import edu.university.proxyproof.data.model.Course
import edu.university.proxyproof.data.model.VerificationMethod
import edu.university.proxyproof.data.repository.AttendanceRepository
import edu.university.proxyproof.data.repository.AttendanceSubmissionResult
import edu.university.proxyproof.data.repository.CourseRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class StudentUiState(
    val enrolledCourses: List<Course> = emptyList(),
    val activeSession: AttendanceSession? = null,
    val records: List<AttendanceRecord> = emptyList(),
    val corrections: List<CorrectionRequest> = emptyList(),
    val attendedClasses: Int = 23,
    val totalSessions: Int = 28,
    val attendancePct: Double = 82.1,
    val selectedThreshold: Int = 75,
    val submissionMessage: String? = null,
    val isSubmissionSuccess: Boolean = false
)

class StudentViewModel(
    private val attendanceRepository: AttendanceRepository,
    private val courseRepository: CourseRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(StudentUiState())
    val uiState: StateFlow<StudentUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            attendanceRepository.activeSession.collect { session ->
                _uiState.value = _uiState.value.copy(activeSession = session)
            }
        }
        viewModelScope.launch {
            attendanceRepository.records.collect { allRecords ->
                _uiState.value = _uiState.value.copy(records = allRecords)
            }
        }
        viewModelScope.launch {
            attendanceRepository.corrections.collect { allCorrections ->
                _uiState.value = _uiState.value.copy(corrections = allCorrections)
            }
        }
        viewModelScope.launch {
            courseRepository.courses.collect { courses ->
                _uiState.value = _uiState.value.copy(enrolledCourses = courses)
            }
        }
    }

    fun setThreshold(threshold: Int) {
        _uiState.value = _uiState.value.copy(selectedThreshold = threshold)
    }

    fun submitAttendance(
        studentId: String,
        studentName: String,
        sessionId: String,
        courseId: String,
        courseCode: String,
        method: VerificationMethod,
        rssi: Int?,
        onComplete: (Boolean, String) -> Unit
    ) {
        val deviceFingerprint = "Android-" + android.os.Build.MODEL.replace(" ", "_")
        val result = attendanceRepository.submitAttendance(
            studentId = studentId,
            studentName = studentName,
            sessionId = sessionId,
            courseId = courseId,
            courseCode = courseCode,
            method = method,
            rssi = rssi,
            deviceFingerprint = deviceFingerprint
        )

        when (result) {
            is AttendanceSubmissionResult.Success -> {
                val msg = "Verification confirmed via ${method.name}. Recorded at ${java.text.SimpleDateFormat("hh:mm a", java.util.Locale.getDefault()).format(java.util.Date())}"
                _uiState.value = _uiState.value.copy(
                    submissionMessage = msg,
                    isSubmissionSuccess = true
                )
                onComplete(true, msg)
            }
            is AttendanceSubmissionResult.Duplicate -> {
                _uiState.value = _uiState.value.copy(
                    submissionMessage = result.message,
                    isSubmissionSuccess = false
                )
                onComplete(false, result.message)
            }
            is AttendanceSubmissionResult.Error -> {
                _uiState.value = _uiState.value.copy(
                    submissionMessage = result.message,
                    isSubmissionSuccess = false
                )
                onComplete(false, result.message)
            }
        }
    }

    fun submitCorrection(studentId: String, studentName: String, courseId: String, courseCode: String, sessionDate: String, reason: String) {
        attendanceRepository.submitCorrectionRequest(
            studentId = studentId,
            studentName = studentName,
            courseId = courseId,
            courseCode = courseCode,
            sessionDate = sessionDate,
            reason = reason
        )
    }

    fun clearSubmissionMessage() {
        _uiState.value = _uiState.value.copy(submissionMessage = null)
    }
}
