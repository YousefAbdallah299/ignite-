package com.yousef.ignite.repository;

import com.yousef.ignite.entity.CandidateComment;
import com.yousef.ignite.entity.CandidateProfile;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CandidateCommentRepository extends JpaRepository<CandidateComment, Long> {
    List<CandidateComment> findByCandidateProfileOrderByCreatedAtDesc(CandidateProfile candidateProfile);
    void deleteByCandidateProfile(CandidateProfile candidateProfile);

    @Modifying
    @Transactional
    @Query("DELETE FROM CandidateComment cc WHERE cc.adminUser.id = :userId")
    void deleteByAdminUserId(@Param("userId") Long userId);
}

