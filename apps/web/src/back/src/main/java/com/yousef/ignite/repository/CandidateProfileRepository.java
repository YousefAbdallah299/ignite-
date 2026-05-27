package com.yousef.ignite.repository;

import com.yousef.ignite.entity.CandidateProfile;
import com.yousef.ignite.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CandidateProfileRepository extends JpaRepository<CandidateProfile, Long> {

    Optional<CandidateProfile> findByUser(User user);

    Page<CandidateProfile> findByTitleContainingIgnoreCaseOrSummaryContainingIgnoreCase(
            String title, String summary, Pageable pageable
    );


    @Query("SELECT cp FROM CandidateProfile cp " +
            "JOIN cp.skillRatings sr " +       // use the collection field name in CandidateProfile
            "JOIN sr.skill s " +
            "WHERE LOWER(s.name) IN :skills " +
            "ORDER BY sr.rating DESC")
    Page<CandidateProfile> findBySkillsOrdered(
            @Param("skills") List<String> skills,
            Pageable pageable
    );

    @Query("SELECT cp FROM CandidateProfile cp " +
            "JOIN cp.skillRatings sr " +
            "JOIN sr.skill s " +
            "WHERE LOWER(s.name) IN :skills " +
            "AND (LOWER(cp.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "     OR LOWER(cp.summary) LIKE LOWER(CONCAT('%', :query, '%'))) " +
            "ORDER BY sr.rating DESC")
    Page<CandidateProfile> findBySkillsAndQueryOrdered(
            @Param("skills") List<String> skills,
            @Param("query") String query,
            Pageable pageable
    );

}
