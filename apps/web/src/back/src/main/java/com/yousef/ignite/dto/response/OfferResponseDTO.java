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
    private Long candidateId;
    private Long recruiterId;
    private String candidateName;
    private String candidateFirstName;
    private String candidateLastName;
    private String candidateEmail;
    private String recruiterCompanyName;
    private String recruiterFirstName;
    private String recruiterLastName;
    private String recruiterEmail;
    private OfferStatus status;
    private String title;
    private Double salary;
    private String currency;
    private LocalDateTime createdAt;
}


