package com.yousef.ignite.repository;

import com.yousef.ignite.entity.AdminPrivilege;
import com.yousef.ignite.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdminPrivilegeRepository extends JpaRepository<AdminPrivilege, Long> {
    List<AdminPrivilege> findByUser(User user);
    List<AdminPrivilege> findByUserAndEnabledTrue(User user);
    Optional<AdminPrivilege> findByUserAndPrivilegeName(User user, String privilegeName);
    void deleteByUser(User user);
}

