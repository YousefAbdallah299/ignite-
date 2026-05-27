package com.yousef.ignite.dto.request;


import com.yousef.ignite.dto.enums.UserRole;
import jakarta.annotation.Nullable;
import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;


@AllArgsConstructor
@NoArgsConstructor
@Builder
@Setter
@Getter
public class RegisterRequestDTO {

    @NotBlank
    private String first_name;

    @NotBlank
    private String last_name;

    @NotBlank
    @Email
    private String email;

    @Size(min = 8)
    private String password;

    @Size(min = 8)
    private String confirmPassword;

    @NotBlank
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "user_role", nullable = false)
    private UserRole role;

    // Fields for job seekers (CANDIDATE role)
    private String expectedPosition;
    private Double expectedSalary;
    private String expectedSalaryCurrency;
    private String currentPosition; // Optional current position for job seekers

    // Fields for recruiters (RECRUITER role)
    @Email
    private String businessEmail; // Business email for recruiters

}