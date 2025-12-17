package com.yousef.ignite.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateAdminPrivilegesDTO {

    @NotNull
    private Boolean canManageCourses = false;

    @NotNull
    private Boolean canManageUsers = false;

    @NotNull
    private Boolean canRateSkills = false;

    @NotNull
    private Boolean canManageWorkshops = false;
}

