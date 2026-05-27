package com.yousef.ignite.repository;

import com.yousef.ignite.entity.SiteSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SiteSettingsRepository extends JpaRepository<SiteSettings, Long> {
}
