package com.yousef.ignite.dto.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateProfileResponseDTO {
    private Long id;
    private Long userId;
    private String name;
    private String title;
    private String summary;
    private String resumeFilePath; // Changed from resumeUrl to resumeFilePath
    private String location;
    private LocalDateTime createdAt;
    private Double expectedSalary;
    private String expectedPosition;
    // skill name -> rating
    private Map<String, Integer> skills;
}


