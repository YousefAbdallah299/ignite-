package com.yousef.ignite.repository;

import com.yousef.ignite.entity.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CourseRepository extends JpaRepository<Course, Long> {

    Page<Course> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            String title, String description, Pageable pageable
    );


    @EntityGraph(attributePaths = {"categories"})
    @Query("""
        SELECT c FROM Course c
        LEFT JOIN c.categories cat
        WHERE (:query IS NULL OR LOWER(c.title) LIKE LOWER(CONCAT('%', :query, '%'))
                            OR LOWER(c.description) LIKE LOWER(CONCAT('%', :query, '%')))
          AND (:categories IS NULL OR cat.name IN :categories)
        GROUP BY c
        ORDER BY c.title ASC
        """)
     Page<Course> findByCategoriesAndQueryOrdered(
            @Param("categories") List<String> categories,
            @Param("query") String query,
            Pageable pageable);



    @Query("SELECT DISTINCT c FROM Course c " +
            "JOIN FETCH c.categories cat " +
            "WHERE LOWER(cat.name) IN :categories " +
            "ORDER BY c.title ASC")
    Page<Course> findByCategoriesOrdered(
            @Param("categories") List<String> categories,
            Pageable pageable
    );

    @Query("SELECT DISTINCT c FROM Course c " +
            "LEFT JOIN FETCH c.categories " +
            "WHERE c.id = :id")
    Optional<Course> findByIdWithCategories(@Param("id") Long id);

    @Query("SELECT DISTINCT c FROM Course c " +
            "LEFT JOIN FETCH c.sections s " +
            "WHERE c.id = :id")
    Optional<Course> findByIdWithSections(@Param("id") Long id);

    @Query("SELECT DISTINCT c FROM Course c LEFT JOIN FETCH c.categories")
    Page<Course> findAllWithCategories(Pageable pageable);

    @Query("SELECT c FROM Course c JOIN c.enrolledCandidates cp WHERE cp.id = :candidateId")
    Page<Course> findByCandidateId(@Param("candidateId") Long candidateId, Pageable pageable);


}
