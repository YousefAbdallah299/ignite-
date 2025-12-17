package com.yousef.ignite.dto.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminPrivilegeResponseDTO {
    private Long id;
    private Long userId;
    private String email;
    private String firstName;
    private String lastName;
    private Boolean canManageCourses;
    private Boolean canManageUsers;
    private Boolean canRateSkills;
    private Boolean canManageWorkshops;
}

