package com.yousef.ignite.repository;

import com.yousef.ignite.entity.CandidateProfile;
import com.yousef.ignite.entity.Offer;
import com.yousef.ignite.entity.RecruiterProfile;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OfferRepository extends JpaRepository<Offer, Long> {
    @EntityGraph(attributePaths = {"candidate", "candidate.user", "recruiter", "recruiter.user"})
    List<Offer> findAll();

    @EntityGraph(attributePaths = {"candidate", "candidate.user", "recruiter", "recruiter.user"})
    List<Offer> findAllByCandidate(CandidateProfile candidate);

    @EntityGraph(attributePaths = {"candidate", "candidate.user", "recruiter", "recruiter.user"})
    List<Offer> findAllByRecruiter(RecruiterProfile recruiter);
}


