package com.yousef.ignite.repository;

import com.yousef.ignite.entity.CandidateComment;
import com.yousef.ignite.entity.CandidateProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CandidateCommentRepository extends JpaRepository<CandidateComment, Long> {
    List<CandidateComment> findByCandidateProfileOrderByCreatedAtDesc(CandidateProfile candidateProfile);
}

