package com.yousef.ignite.repository;

import com.yousef.ignite.entity.CandidateAppliedJob;
import com.yousef.ignite.entity.CandidateProfile;
import com.yousef.ignite.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CandidateAppliedJobRepository extends JpaRepository<CandidateAppliedJob, Long> {

    List<CandidateAppliedJob> findByJob(Job job);

    List<CandidateAppliedJob> findByCandidate(CandidateProfile candidate);

    Optional<CandidateAppliedJob> findByCandidateAndJob(CandidateProfile candidate, Job job);

    void deleteByJob(Job job);

    void deleteByCandidate(CandidateProfile candidate);

    void deleteByCandidateAndJob(CandidateProfile candidate, Job job);

    boolean existsByCandidateAndJob(CandidateProfile candidate, Job job);
}
