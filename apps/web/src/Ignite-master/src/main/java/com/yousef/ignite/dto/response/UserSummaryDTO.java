package com.yousef.ignite.dto.response;

import com.yousef.ignite.dto.enums.UserRole;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSummaryDTO {
    private Long id;
    private String first_name;
    private String last_name;
    private String email;
    private String phoneNumber;
    private UserRole role;
}


