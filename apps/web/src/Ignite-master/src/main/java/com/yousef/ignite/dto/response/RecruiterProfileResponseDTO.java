package com.yousef.ignite.dto.response;

import com.yousef.ignite.dto.enums.RecruiterStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class RecruiterProfileResponseDTO {
    private Long id;
    private Long userId;
    private String companyName;
    private RecruiterStatus status;
    private LocalDateTime subscriptionStartDate;
    private LocalDateTime subscriptionEndDate;
}
