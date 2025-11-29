package com.yousef.ignite.repository;

import com.yousef.ignite.entity.CandidateProfile;
import com.yousef.ignite.entity.CandidateSkillRating;
import com.yousef.ignite.entity.Skill;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CandidateSkillRatingRepository extends JpaRepository<CandidateSkillRating, Long> {
    Optional<CandidateSkillRating> findByCandidateAndSkill(CandidateProfile candidate, Skill skill);
    List<CandidateSkillRating> findAllByCandidate(CandidateProfile candidate);

    @Query("SELECT csr FROM CandidateSkillRating csr WHERE csr.skill.name = :skillName ORDER BY csr.rating DESC")
    Page<CandidateSkillRating> findTopBySkillName(@Param("skillName") String skillName, Pageable pageable);
}


