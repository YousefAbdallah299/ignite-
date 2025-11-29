package com.yousef.ignite.dto.response;

import com.yousef.ignite.dto.enums.OfferStatus;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfferResponseDTO {
    private Long id;
    private OfferStatus status;
    private String title;
    private Double salary;
    private String currency;
    private LocalDateTime createdAt;
}


