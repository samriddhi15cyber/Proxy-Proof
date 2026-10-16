package edu.university.proxyproof.ui.screens.course

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CalendarToday
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import edu.university.proxyproof.data.repository.CourseRepository
import edu.university.proxyproof.ui.theme.*

@Composable
fun CourseTimetableScreen(
    courseRepository: CourseRepository,
    onNavigateBack: () -> Unit
) {
    val courses by courseRepository.courses.collectAsState()

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = ParchmentBackground
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(bottom = 16.dp)
            ) {
                IconButton(onClick = onNavigateBack) {
                    Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = BurgundyPrimary)
                }
                Spacer(modifier = Modifier.width(8.dp))
                Column {
                    Text(
                        text = "Academic Timetable & Courses",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = CharcoalText
                    )
                    Text(
                        text = "Autumn Term 2026 · Registered Course Sections",
                        fontSize = 12.sp,
                        color = SecondaryText
                    )
                }
            }

            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(courses) { course ->
                    Card(
                        colors = CardDefaults.cardColors(containerColor = CreamSurface),
                        shape = RoundedCornerShape(8.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, SubtleBorder),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(4.dp))
                                        .background(PaleBurgundy)
                                        .padding(horizontal = 8.dp, vertical = 3.dp)
                                ) {
                                    Text(
                                        text = course.code,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = BurgundyPrimary
                                    )
                                }

                                Text(
                                    text = "${course.credits} Credits",
                                    fontSize = 11.sp,
                                    color = SecondaryText
                                )
                            }

                            Spacer(modifier = Modifier.height(8.dp))

                            Text(
                                text = course.title,
                                fontSize = 15.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = CharcoalText
                            )

                            Text(
                                text = "${course.section} · Room: ${course.room}",
                                fontSize = 12.sp,
                                color = SecondaryText,
                                modifier = Modifier.padding(top = 2.dp, bottom = 10.dp)
                            )

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    Icons.Default.CalendarToday,
                                    contentDescription = null,
                                    tint = BurgundyPrimary,
                                    modifier = Modifier.size(14.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "${course.scheduleDay} · ${course.scheduleTime}",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = CharcoalText
                                )
                            }

                            Divider(
                                color = SubtleBorder,
                                thickness = 1.dp,
                                modifier = Modifier.padding(vertical = 10.dp)
                            )

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "Instructor: ${course.instructorName}",
                                    fontSize = 12.sp,
                                    color = SecondaryText
                                )
                                Text(
                                    text = "${course.totalSessionsHeld} sessions completed",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = CharcoalText
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
