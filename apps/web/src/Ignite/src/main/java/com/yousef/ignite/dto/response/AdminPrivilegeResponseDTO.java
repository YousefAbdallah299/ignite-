package com.yousef.ignite.dto.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminPrivilegeResponseDTO {
    private Long id;
    private String privilegeName;
    private Boolean enabled;
}

