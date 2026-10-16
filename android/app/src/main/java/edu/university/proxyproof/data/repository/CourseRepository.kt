package edu.university.proxyproof.data.repository

import edu.university.proxyproof.data.model.Course
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class CourseRepository {

    private val sampleCourses = listOf(
        Course(
            id = "c-101",
            code = "CS-401",
            title = "Distributed Systems & Cloud Computing",
            section = "Lecture Section 01",
            instructorId = "fac-marcus",
            instructorName = "Dr. Marcus Vance",
            room = "Turing Hall 304",
            scheduleDay = "Mon / Wed",
            scheduleTime = "09:00 - 10:30 AM",
            credits = 4,
            totalSessionsHeld = 28,
            enrolledStudentIds = listOf("stu-alex", "stu-2", "stu-3")
        ),
        Course(
            id = "c-102",
            code = "CS-302",
            title = "Cryptography & Network Security",
            section = "Lab Section 02",
            instructorId = "fac-marcus",
            instructorName = "Dr. Marcus Vance",
            room = "Shannon Lab 102",
            scheduleDay = "Mon / Wed",
            scheduleTime = "11:00 AM - 12:30 PM",
            credits = 4,
            totalSessionsHeld = 26,
            enrolledStudentIds = listOf("stu-alex", "stu-2")
        ),
        Course(
            id = "c-103",
            code = "MATH-240",
            title = "Probability & Discrete Mathematics",
            section = "Lecture Section 03",
            instructorId = "fac-elena",
            instructorName = "Prof. Elena Rostova",
            room = "Euler Hall 108",
            scheduleDay = "Tue / Thu",
            scheduleTime = "01:30 - 03:00 PM",
            credits = 3,
            totalSessionsHeld = 24,
            enrolledStudentIds = listOf("stu-alex")
        ),
        Course(
            id = "c-104",
            code = "ENG-210",
            title = "Technical Writing for Engineers",
            section = "Seminar Section 01",
            instructorId = "fac-clara",
            instructorName = "Dr. Clara Oswald",
            room = "Humanities Quad 215",
            scheduleDay = "Fri",
            scheduleTime = "10:00 AM - 12:00 PM",
            credits = 2,
            totalSessionsHeld = 14,
            enrolledStudentIds = listOf("stu-alex")
        )
    )

    private val _courses = MutableStateFlow<List<Course>>(sampleCourses)
    val courses: StateFlow<List<Course>> = _courses.asStateFlow()

    fun getCourseById(courseId: String): Course? {
        return _courses.value.firstOrNull { it.id == courseId || it.code == courseId }
    }

    fun getStudentCourses(enrolledIds: List<String>): List<Course> {
        return _courses.value.filter { enrolledIds.contains(it.id) || enrolledIds.isEmpty() }
    }

    fun getTeacherCourses(instructorId: String): List<Course> {
        return _courses.value.filter { it.instructorId == instructorId }
    }
}
