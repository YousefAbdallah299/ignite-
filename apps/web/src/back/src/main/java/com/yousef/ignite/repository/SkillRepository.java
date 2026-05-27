package com.yousef.ignite.repository;

import com.yousef.ignite.entity.Skill;
import com.yousef.ignite.dto.response.SkillResponseDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface SkillRepository extends JpaRepository<Skill, Long> {
    Optional<Skill> findByNameIgnoreCase(String name);

    @Query("SELECT new com.yousef.ignite.dto.response.SkillResponseDTO(s.id, s.name) FROM Skill s ORDER BY s.name ASC")
    List<SkillResponseDTO> findAllSkillResponses();
}


