package com.yousef.ignite.entity;

import com.yousef.ignite.dto.enums.UserRole;
import com.yousef.ignite.dto.response.RegisterResponseDTO;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;


@Entity
@Table(name = "users")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, name = "first_name")
    private String firstName;

    @Column(nullable = false, name = "last_name")
    private String lastName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, name = "password_hash")
    private String passwordHash;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "user_role")
    private UserRole role;

    private boolean enabled = false;

    private String verificationToken;

    private String resetPasswordToken;

    private LocalDateTime resetTokenExpiry;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private RecruiterProfile recruiterProfile;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private CandidateProfile candidateProfile;

    @Column(name = "is_custom_admin")
    private Boolean isCustomAdmin = false;

    public RegisterResponseDTO toRegisterResponseDTO() {
        return RegisterResponseDTO.builder()
                .id(this.id)
                .name(this.firstName + " " + this.lastName)
                .email(this.email)
                .phoneNumber(this.phoneNumber)
                .build();
    }
}
