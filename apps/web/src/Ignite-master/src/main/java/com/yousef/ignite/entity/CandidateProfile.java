package com.yousef.ignite.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;


@Entity
@Table(name = "candidate_profiles")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @JsonIgnoreProperties("candidateProfile")
    private User user;

    @Column(nullable = false)
    private String title;

    private Double expectedSalary;

    private String expectedPosition;


    private String summary;
    private String location;
    private LocalDateTime createdAt;
    private String resumeFilePath; // Changed from resumeUrl to resumeFilePath for file uploads

    @OneToMany(mappedBy = "candidate", cascade = CascadeType.REMOVE, orphanRemoval = true)
    @JsonIgnore
    private Set<Offer> offers = new HashSet<>();

    @ManyToMany
    @JoinTable(
            name = "candidate_courses",
            joinColumns = @JoinColumn(name = "candidate_id"),
            inverseJoinColumns = @JoinColumn(name = "course_id")
    )
    private Set<Course> enrolledCourses = new HashSet<>();

    @OneToMany(mappedBy = "candidate")
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonIgnore
    private Set<CandidateAppliedJob> applications = new HashSet<>();

    @OneToMany(mappedBy = "candidate", cascade = CascadeType.REMOVE, orphanRemoval = true)
    @JsonIgnore
    private List<CandidateSkillRating> skillRatings;
}
