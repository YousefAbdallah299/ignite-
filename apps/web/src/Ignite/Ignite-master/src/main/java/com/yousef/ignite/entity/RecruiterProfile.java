package com.yousef.ignite.entity;

import com.yousef.ignite.dto.enums.RecruiterStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "recruiter_profiles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecruiterProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private String companyName;


    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RecruiterStatus status;

    @OneToMany(mappedBy = "postedBy", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Job> jobs = new HashSet<>();


    private LocalDateTime subscriptionStartDate;
    private LocalDateTime subscriptionEndDate;
}
