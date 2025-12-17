package com.yousef.ignite.repository;

import com.yousef.ignite.entity.AdminPrivilege;
import com.yousef.ignite.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminPrivilegeRepository extends JpaRepository<AdminPrivilege, Long> {
    Optional<AdminPrivilege> findByUser(User user);
}

