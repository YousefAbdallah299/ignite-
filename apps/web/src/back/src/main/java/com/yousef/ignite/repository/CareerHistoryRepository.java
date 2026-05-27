package com.yousef.ignite.repository;

import com.yousef.ignite.entity.CareerHistory;
import com.yousef.ignite.entity.CandidateProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CareerHistoryRepository extends JpaRepository<CareerHistory, Long> {
    List<CareerHistory> findByCandidateOrderByStartDateDesc(CandidateProfile candidate);
    void deleteByCandidate(CandidateProfile candidate);
}

