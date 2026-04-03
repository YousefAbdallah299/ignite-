package com.yousef.ignite.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AdResponseDTO {
    private Long id;
    private String title;
    private String imageUrl;
    private String redirectUrl;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDateTime createdAt;
}

