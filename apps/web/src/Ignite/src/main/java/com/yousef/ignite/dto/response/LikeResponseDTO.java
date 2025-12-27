package com.yousef.ignite.dto.response;

import com.yousef.ignite.dto.enums.UserRole;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LikeResponseDTO {
    private Long userId;
    private String username;
    private UserRole userRole;
}
