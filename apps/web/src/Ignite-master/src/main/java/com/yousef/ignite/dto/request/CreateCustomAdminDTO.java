package com.yousef.ignite.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateCustomAdminDTO {

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String password;

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    // Privilege flags
    @NotNull
    private Boolean canManageCourses = false;

    @NotNull
    private Boolean canManageUsers = false;

    @NotNull
    private Boolean canRateSkills = false;

    @NotNull
    private Boolean canManageWorkshops = false;
}

