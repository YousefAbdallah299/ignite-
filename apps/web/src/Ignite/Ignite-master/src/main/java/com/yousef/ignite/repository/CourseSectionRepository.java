package com.yousef.ignite.repository;

import com.yousef.ignite.entity.CourseSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CourseSectionRepository extends JpaRepository<CourseSection, Long> {
    @Query("SELECT s FROM CourseSection s " +
            "LEFT JOIN FETCH s.lessons " +
            "WHERE s.id = :id")
    Optional<CourseSection> findByIdWithLessons(@Param("id") Long id);


    @Query("SELECT COUNT(l) FROM CourseLesson l WHERE l.section.id = :sectionId")
    int countLessonsBySectionId(@Param("sectionId") Long sectionId);


}
