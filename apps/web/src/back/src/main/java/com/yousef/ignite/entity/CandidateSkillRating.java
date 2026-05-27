package com.yousef.ignite.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;


@Entity
@Table(name = "candidate_skill_ratings",
        uniqueConstraints = {@UniqueConstraint(columnNames = {"candidate_id", "skill_id"})})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateSkillRating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "candidate_id", nullable = false)
    @JsonIgnore
    private CandidateProfile candidate;

    @ManyToOne(optional = false)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Column(nullable = false)
    private Integer rating; // 0-100 scale
}


