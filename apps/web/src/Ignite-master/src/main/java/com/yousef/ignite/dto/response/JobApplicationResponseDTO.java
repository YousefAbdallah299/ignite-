package com.yousef.ignite.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobApplicationResponseDTO {
    private Long id;
    private Long candidateId;
    private String candidateName;
    private String candidateEmail;
    private String candidatePhone;
    private String candidateTitle;
    private String candidateLocation;
    private String candidateSummary;
    private String resumeFilePath; // Changed from resumeUrl to resumeFilePath
    private LocalDateTime appliedAt;
}
