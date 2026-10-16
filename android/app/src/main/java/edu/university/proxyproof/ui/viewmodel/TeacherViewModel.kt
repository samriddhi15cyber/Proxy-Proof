package edu.university.proxyproof.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import edu.university.proxyproof.data.model.AttendanceRecord
import edu.university.proxyproof.data.model.AttendanceSession
import edu.university.proxyproof.data.model.CorrectionRequest
import edu.university.proxyproof.data.model.Course
import edu.university.proxyproof.data.model.SessionStatus
import edu.university.proxyproof.data.repository.AttendanceRepository
import edu.university.proxyproof.data.repository.CourseRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class TeacherUiState(
    val authorizedCourses: List<Course> = emptyList(),
    val activeSession: AttendanceSession? = null,
    val records: List<AttendanceRecord> = emptyList(),
    val corrections: List<CorrectionRequest> = emptyList(),
    val isAdvertisingBle: Boolean = false
)

class TeacherViewModel(
    private val attendanceRepository: AttendanceRepository,
    private val courseRepository: CourseRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(TeacherUiState())
    val uiState: StateFlow<TeacherUiState> = _uiState.asStateFlow()

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
                _uiState.value = _uiState.value.copy(authorizedCourses = courses)
            }
        }
    }

    fun startSession(course: Course, instructorId: String, instructorName: String): AttendanceSession {
        val session = attendanceRepository.startSession(
            courseId = course.id,
            courseCode = course.code,
            courseTitle = course.title,
            instructorId = instructorId,
            instructorName = instructorName,
            room = course.room
        )
        return session
    }

    fun endSession() {
        attendanceRepository.endSession()
    }

    fun reviewCorrection(correctionId: String, approved: Boolean) {
        attendanceRepository.updateCorrectionStatus(correctionId, approved)
    }

    fun exportRecordsCsv(): String {
        return attendanceRepository.exportRecordsCsv()
    }
}
