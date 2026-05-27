package com.yousef.ignite.repository;

import com.yousef.ignite.entity.CandidateProfile;
import com.yousef.ignite.entity.Offer;
import com.yousef.ignite.entity.RecruiterProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OfferRepository extends JpaRepository<Offer, Long> {
    List<Offer> findAllByCandidate(CandidateProfile candidate);
    List<Offer> findAllByRecruiter(RecruiterProfile recruiter);
}


