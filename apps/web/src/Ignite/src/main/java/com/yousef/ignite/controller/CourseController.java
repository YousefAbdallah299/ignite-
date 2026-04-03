package com.yousef.ignite.controller;

import com.yousef.ignite.dto.request.CourseRequestDTO;
import com.yousef.ignite.dto.response.CourseLessonResponseDTO;
import com.yousef.ignite.dto.response.CourseProgressResponseDTO;
import com.yousef.ignite.dto.response.CourseResponseDTO;
import com.yousef.ignite.dto.response.CourseSummaryResponseDTO;
import com.yousef.ignite.dto.response.PagedResponse;
import com.yousef.ignite.service.CourseService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/courses")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
@Validated
@Tag(name = "Courses", description = "Endpoints for courses management.")

public class CourseController {
    private final CourseService courseService;

    @GetMapping
    public PagedResponse<CourseSummaryResponseDTO> getAllCourses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) List<String> categories
    ) {
        return courseService.getAllCourses(page, size, query, categories);
    }

    @PostMapping("/request")
    public ResponseEntity<Void> requestCourse(
            @RequestHeader("Authorization") String token,
            @RequestBody @Valid com.yousef.ignite.dto.request.CourseRequestCreateDTO dto) {
        courseService.requestCourse(token, dto);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public PagedResponse<CourseSummaryResponseDTO> getEnrolledCourses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestHeader("Authorization") String token)
    {
        return courseService.getEnrolledCourses(page, size, token);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseResponseDTO> getCourseById(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }


    @PostMapping
    public ResponseEntity<CourseResponseDTO> createCourse(
            @RequestHeader("Authorization") String token,
            @RequestBody CourseRequestDTO dto) {
        return ResponseEntity.ok(courseService.createCourse(token, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id) {
        courseService.deleteCourse(token, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/enroll")
    public ResponseEntity<Void> enrollCourse(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id) {
        courseService.enrollCourse(token, id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelEnrollment(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id) {
        courseService.cancelEnrollment(token, id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/sections/{sectionId}/lessons")
    public ResponseEntity<List<CourseLessonResponseDTO>> getLessonsBySection(
            @PathVariable Long sectionId) {
        return ResponseEntity.ok(courseService.getLessonsBySection(sectionId));
    }

    @GetMapping("/sections/{sectionId}/number-of-lessons")
    public ResponseEntity<Integer> getNumberOfLessonsBySection(
            @PathVariable Long sectionId) {
        return ResponseEntity.ok(courseService.getNumberOfLessonsBySection(sectionId));
    }

    // Course Progress Endpoints
    @GetMapping("/{courseId}/progress")
    public ResponseEntity<CourseProgressResponseDTO> getProgress(
            @RequestHeader("Authorization") String token,
            @PathVariable Long courseId
    ) {
        return ResponseEntity.ok(courseService.getProgress(token, courseId));
    }

    @PostMapping("/{courseId}/lessons/{lessonId}/complete")
    public ResponseEntity<CourseProgressResponseDTO> markLessonComplete(
            @RequestHeader("Authorization") String token,
            @PathVariable Long courseId,
            @PathVariable Long lessonId,
            @RequestParam(defaultValue = "true") boolean completed
    ) {
        return ResponseEntity.ok(courseService.markLessonComplete(token, courseId, lessonId, completed));
    }

    @PostMapping(value = "/upload-image", consumes = {"multipart/form-data"})
    public ResponseEntity<Map<String, String>> uploadCourseImage(
            @RequestHeader("Authorization") String token,
            @RequestPart("file") MultipartFile file
    ) {
        String imageUrl = courseService.uploadCourseImage(token, file);
        Map<String, String> response = new HashMap<>();
        response.put("imageUrl", imageUrl);
        return ResponseEntity.ok(response);
    }

}
