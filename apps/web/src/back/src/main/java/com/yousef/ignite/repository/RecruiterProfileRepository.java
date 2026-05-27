package com.yousef.ignite.repository;

import com.yousef.ignite.entity.RecruiterProfile;
import com.yousef.ignite.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RecruiterProfileRepository extends JpaRepository<RecruiterProfile, Long> {
    Optional<RecruiterProfile> findByUserId(Long userId);
    Optional<RecruiterProfile> findByUser(User user);

}
