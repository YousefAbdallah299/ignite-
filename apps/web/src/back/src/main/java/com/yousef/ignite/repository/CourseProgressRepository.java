package com.yousef.ignite.repository;

import com.yousef.ignite.entity.Course;
import com.yousef.ignite.entity.CourseProgress;
import com.yousef.ignite.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CourseProgressRepository extends JpaRepository<CourseProgress, Long> {
    Optional<CourseProgress> findByUserAndCourse(User user, Course course);
    void deleteByUserAndCourse(User user, Course course);
    void deleteByCourse(Course course);
    void deleteByUser(User user);
}

