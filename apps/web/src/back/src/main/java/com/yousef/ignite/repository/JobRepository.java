package com.yousef.ignite.repository;

import com.yousef.ignite.entity.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {

    Page<Job> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            String title, String description, Pageable pageable
    );


    @Query("SELECT j FROM Job j " +
            "JOIN j.categories cat " +
            "WHERE LOWER(cat.name) IN :categories " +
            "ORDER BY j.createdAt DESC")
    Page<Job> findByCategoriesOrdered(
            @Param("categories") List<String> categories,
            Pageable pageable
    );

    @Query("SELECT j FROM Job j " +
            "JOIN j.categories cat " +
            "WHERE LOWER(cat.name) IN :categories " +
            "AND (LOWER(j.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "     OR LOWER(j.description) LIKE LOWER(CONCAT('%', :query, '%'))) " +
            "ORDER BY j.createdAt DESC")
    Page<Job> findByCategoriesAndQueryOrdered(
            @Param("categories") List<String> categories,
            @Param("query") String query,
            Pageable pageable
    );


    @Query("""
    SELECT j FROM Job j
    JOIN j.appliedCandidates ca
    WHERE ca.candidate.id = :candidateId
""")
Page<Job> findAppliedJobsByCandidateId(@Param("candidateId") Long candidateId, Pageable pageable);



    @Query("SELECT j FROM Job j WHERE j.postedBy.id = :recruiterId")
    Page<Job> findJobsByRecruiterId(@Param("recruiterId") Long recruiterId, Pageable pageable);


}
