package com.yousef.ignite.dto.response;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CareerHistoryResponseDTO {
    private Long id;
    private String companyName;
    private String position;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private String location;
    private LocalDateTime createdAt;
}

