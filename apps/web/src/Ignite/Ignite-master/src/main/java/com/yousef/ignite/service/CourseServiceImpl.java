package com.yousef.ignite.service;

import com.yousef.ignite.dto.enums.UserRole;
import com.yousef.ignite.dto.request.CourseRequestDTO;
import com.yousef.ignite.dto.response.*;
import com.yousef.ignite.entity.*;
import com.yousef.ignite.exception.custom.CourseAlreadyEnrolledException;
import com.yousef.ignite.exception.custom.ResourceNotFoundException;
import com.yousef.ignite.exception.custom.UnauthorizedAccessException;
import com.yousef.ignite.repository.*;
import com.yousef.ignite.service.security.JwtUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {
    private final CourseRepository courseRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;
    private final CandidateProfileRepository candidateProfileRepository;
    private final CourseProgressRepository progressRepository;
    private final CourseSectionRepository courseSectionRepository;
    private final EmailService emailService;


    @Override
    public PagedResponse<CourseSummaryResponseDTO> getAllCourses(
            int page, int size, String query, List<String> categories) {

        Pageable pageable = PageRequest.of(page, size);

        Page<Course> coursePage;

        if (query != null && !query.trim().isEmpty() && categories != null && !categories.isEmpty()) {
            // Categories + query filter, ordered
            coursePage = courseRepository.findByCategoriesAndQueryOrdered(categories.stream().map(String::toLowerCase).toList()
                    , query, pageable);
        } else if (query != null && !query.trim().isEmpty()) {
            // Query only
            coursePage = courseRepository
                    .findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(query, query, pageable);
        } else if (categories != null && !categories.isEmpty()) {
            // Categories only, ordered
            coursePage = courseRepository.findByCategoriesOrdered(categories.stream().map(String::toLowerCase).toList(), pageable);
        } else {
            // Default
            coursePage = courseRepository.findAllWithCategories(pageable);
        }

        return new PagedResponse<>(
                coursePage.getContent().stream().map(course ->
                        CourseSummaryResponseDTO.builder()
                                .id(course.getId())
                                .imageUrl(course.getImageUrl())
                                .title(course.getTitle())
                                .description(course.getDescription())
                                .categories(course.getCategories())
                                .skillLevel(course.getSkillLevel())
                                .build()
                ).toList(),
                coursePage.getNumber(),
                coursePage.getSize(),
                coursePage.getTotalElements(),
                coursePage.getTotalPages(),
                coursePage.isLast()
        );


    }




    @Override
    public CourseResponseDTO createCourse(String token, CourseRequestDTO dto) {
        User user = getUserFromToken(token);
        if (user.getRole() != UserRole.ADMIN) {
            throw new UnauthorizedAccessException("Only admins can create courses");
        }

        Course course = new Course();
        course.setTitle(dto.getTitle());
        course.setImageUrl(dto.getImageUrl());
        course.setSkillLevel(dto.getSkillLevel());
        course.setDescription(dto.getDescription());
        course.setSections(new ArrayList<>());

        if (dto.getCategories() != null && !dto.getCategories().isEmpty()) {
            Set<Category> categories = dto.getCategories().stream()
                    .map(name -> categoryRepository.findByName(name)
                            .orElseGet(() -> categoryRepository.save(
                                    Category.builder().name(name).build()
                            )))
                    .collect(Collectors.toSet());
            course.setCategories(categories);
        }

        if (dto.getSections() != null) {
            dto.getSections().forEach(sectionDTO -> {
                CourseSection section = CourseSection.builder()
                        .title(sectionDTO.getTitle())
                        .course(course)
                        .lessons(new ArrayList<>())
                        .build();

                if (sectionDTO.getLessons() != null) {
                    sectionDTO.getLessons().forEach(lessonDTO -> {
                        CourseLesson lesson = CourseLesson.builder()
                                .title(lessonDTO.getTitle())
                                .content(lessonDTO.getContent())
                                .videoUrl(lessonDTO.getVideoUrl())
                                .imageUrl(lessonDTO.getImageUrl())
                                .section(section)
                                .build();
                        section.getLessons().add(lesson);
                    });
                }

                course.getSections().add(section);
            });
        }

        return mapToDTO(courseRepository.save(course));
    }





    @Override
    @Transactional
    public void deleteCourse(String token, Long id) {
        User admin = getUserFromToken(token);
        if (admin.getRole() != UserRole.ADMIN) {
            throw new UnauthorizedAccessException("Only admins can delete courses");
        }

        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        // Remove course from all candidates who enrolled
        Set<CandidateProfile> enrolledCandidates = new HashSet<>(course.getEnrolledCandidates());
        for (CandidateProfile candidate : enrolledCandidates) {
            candidate.getEnrolledCourses().remove(course);
        }
        candidateProfileRepository.saveAll(enrolledCandidates);

        courseRepository.delete(course);
    }

    @Override
    @Transactional
    public void enrollCourse(String token, Long courseId) {
        User user = getUserFromToken(token);
        if (!user.getRole().equals(UserRole.CANDIDATE)) {
            throw new UnauthorizedAccessException("Only candidates can enroll in courses");
        }

        CandidateProfile candidate = candidateProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        if (candidate.getEnrolledCourses().contains(course)) {
            throw new CourseAlreadyEnrolledException("Course is already enrolled");
        }

        candidate.getEnrolledCourses().add(course);
        candidateProfileRepository.save(candidate);
    }

    @Override
    @Transactional
    public void cancelEnrollment(String token, Long courseId) {
        User user = getUserFromToken(token);
        if (!user.getRole().equals(UserRole.CANDIDATE)) {
            throw new UnauthorizedAccessException("Only candidates can cancel course enrollment");
        }

        CandidateProfile candidate = candidateProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        if (!candidate.getEnrolledCourses().contains(course)) {
            throw new ResourceNotFoundException("You are not currently enrolled in this course");
        }

        candidate.getEnrolledCourses().remove(course);
        candidateProfileRepository.save(candidate);

        // Delete course progress when unenrolling
        progressRepository.deleteByUserAndCourse(user, course);
    }

    @Override
    public PagedResponse<CourseSummaryResponseDTO> getEnrolledCourses(int page, int size, String token) {
        User user = getUserFromToken(token);
        if (!user.getRole().equals(UserRole.CANDIDATE)) {
            throw new UnauthorizedAccessException("Only candidates can view enrolled courses");
        }

        CandidateProfile candidate = candidateProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile not found"));

        Pageable pageable = PageRequest.of(page, size);

        Page<Course> coursePage = courseRepository.findByCandidateId(candidate.getId(), pageable);

        return new PagedResponse<>(
                coursePage.getContent().stream().map(course ->
                        CourseSummaryResponseDTO.builder()
                                .id(course.getId())
                                .title(course.getTitle())
                                .description(course.getDescription())
                                .categories(course.getCategories())
                                .skillLevel(course.getSkillLevel())
                                .build()
                ).toList(),
                coursePage.getNumber(),
                coursePage.getSize(),
                coursePage.getTotalElements(),
                coursePage.getTotalPages(),
                coursePage.isLast()
        );
    }



    private User getUserFromToken(String token) {
        token = token.substring(7);
        String email = jwtUtils.getEmailFromJwtToken(token);
        return userRepository.findUserByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Please login first."));
    }


    @Transactional
    public CourseResponseDTO getCourseById(Long id) {
        Course course = courseRepository.findByIdWithCategories(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        course = courseRepository.findByIdWithSections(id)
                .orElse(course);
        return mapToDTO(course);
    }

    @Override
    public Integer getNumberOfLessonsBySection(Long sectionId) {
        return courseSectionRepository.countLessonsBySectionId(sectionId);
    }


    @Transactional
    public List<CourseLessonResponseDTO> getLessonsBySection(Long sectionId) {
        CourseSection section = courseSectionRepository.findByIdWithLessons(sectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Section not found"));

        return section.getLessons().stream()
                .map(this::mapLessonToDTO)
                .toList();
    }


    private CourseLessonResponseDTO mapLessonToDTO(CourseLesson lesson) {
        return CourseLessonResponseDTO.builder()
                .id(lesson.getId())
                .title(lesson.getTitle())
                .content(lesson.getContent())
                .videoUrl(lesson.getVideoUrl())
                .imageURL(lesson.getImageUrl())
                .build();
    }






    private CourseResponseDTO mapToDTO(Course course) {
        return CourseResponseDTO.builder()
                .id(course.getId())
                .title(course.getTitle())
                .skillLevel(course.getSkillLevel())
                .description(course.getDescription())
                .sections(
                        course.getSections().stream().map(section ->
                                CourseSectionResponseDTO.builder()
                                        .id(section.getId())
                                        .title(section.getTitle())
                                        .build()
                        ).toList()
                )
                .categories(
                        course.getCategories() != null
                                ? course.getCategories().stream()
                                .map(Category::getName) // only return names
                                .toList()
                                : List.of()
                )
                .build();
    }

    // Progress tracking methods
    @Override
    public CourseProgressResponseDTO getProgress(String token, Long courseId) {
        User user = getUserFromToken(token);
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        CourseProgress progress = progressRepository.findByUserAndCourse(user, course)
                .orElse(null);

        if (progress == null) {
            // No progress yet - return empty progress
            return CourseProgressResponseDTO.builder()
                    .courseId(courseId)
                    .completionPercentage(0.0)
                    .completedLessonIds(new HashSet<>())
                    .lastUpdated(null)
                    .build();
        }

        return CourseProgressResponseDTO.builder()
                .courseId(courseId)
                .completionPercentage(progress.getCompletionPercentage())
                .completedLessonIds(progress.getCompletedLessonIds())
                .lastUpdated(progress.getLastUpdated())
                .build();
    }

    @Override
    @Transactional
    public CourseProgressResponseDTO markLessonComplete(String token, Long courseId, Long lessonId, boolean completed) {
        User user = getUserFromToken(token);
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        // Get or create progress
        CourseProgress progress = progressRepository.findByUserAndCourse(user, course)
                .orElse(CourseProgress.builder()
                        .user(user)
                        .course(course)
                        .completedLessonIds(new HashSet<>())
                        .completionPercentage(0.0)
                        .lastUpdated(LocalDateTime.now())
                        .build());

        // Update completed lessons
        if (completed) {
            progress.getCompletedLessonIds().add(lessonId);
        } else {
            progress.getCompletedLessonIds().remove(lessonId);
        }

        // Calculate total lessons in the course
        long totalLessons = course.getSections().stream()
                .mapToLong(section -> section.getLessons().size())
                .sum();

        // Calculate completion percentage
        double percentage = totalLessons > 0
                ? (progress.getCompletedLessonIds().size() * 100.0) / totalLessons
                : 0.0;

        progress.setCompletionPercentage(percentage);
        progress.setLastUpdated(LocalDateTime.now());

        CourseProgress saved = progressRepository.save(progress);

        return CourseProgressResponseDTO.builder()
                .courseId(courseId)
                .completionPercentage(saved.getCompletionPercentage())
                .completedLessonIds(saved.getCompletedLessonIds())
                .lastUpdated(saved.getLastUpdated())
                .build();
    }

    @Override
    public void requestCourse(String token) {
        User user = getUserFromToken(token);
        if (!user.getRole().equals(UserRole.CANDIDATE)) {
            throw new UnauthorizedAccessException("Only candidates can request courses");
        }
        emailService.sendCourseRequestEmailToIgnite(user, LocalDateTime.now());
        emailService.sendCourseRequestEmailToCandidate(user);
    }

}
