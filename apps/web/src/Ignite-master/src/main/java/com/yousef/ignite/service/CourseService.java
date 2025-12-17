package com.yousef.ignite.service;

import com.yousef.ignite.dto.request.CourseRequestCreateDTO;
import com.yousef.ignite.dto.request.CourseRequestDTO;
import com.yousef.ignite.dto.response.CourseLessonResponseDTO;
import com.yousef.ignite.dto.response.CourseProgressResponseDTO;
import com.yousef.ignite.dto.response.CourseResponseDTO;
import com.yousef.ignite.dto.response.CourseSummaryResponseDTO;
import com.yousef.ignite.dto.response.PagedResponse;

import java.util.List;

public interface CourseService {
    PagedResponse<CourseSummaryResponseDTO> getAllCourses(
            int page, int size, String query, List<String> categories);
    CourseResponseDTO createCourse(String token, CourseRequestDTO dto);
    void deleteCourse(String token, Long id);
    void enrollCourse(String token, Long courseId);
    void cancelEnrollment(String token, Long courseId);
    PagedResponse<CourseSummaryResponseDTO> getEnrolledCourses(int page, int size, String token);

    void requestCourse(String token, CourseRequestCreateDTO dto);
    List<CourseLessonResponseDTO> getLessonsBySection(Long sectionId);
    CourseResponseDTO getCourseById(Long id);

    Integer getNumberOfLessonsBySection(Long sectionId);

    // Progress tracking
    CourseProgressResponseDTO getProgress(String token, Long courseId);
    CourseProgressResponseDTO markLessonComplete(String token, Long courseId, Long lessonId, boolean completed);
}
