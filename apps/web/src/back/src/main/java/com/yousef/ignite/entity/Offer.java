package com.yousef.ignite.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.yousef.ignite.dto.enums.OfferStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "offers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Offer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    @JsonIgnoreProperties({"offers", "applications", "enrolledCourses", "user"})
    private CandidateProfile candidate;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "recruiter_id", nullable = false)
    @JsonIgnoreProperties({"offers", "user"})
    private RecruiterProfile recruiter;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OfferStatus status;

    @Column(nullable = false)
    private String title;

    private Double salary;

    private String currency;

    private LocalDateTime createdAt;
}
