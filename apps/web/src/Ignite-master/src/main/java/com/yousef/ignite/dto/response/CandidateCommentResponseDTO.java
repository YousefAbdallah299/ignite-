package com.yousef.ignite.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateCommentResponseDTO {
    private Long id;
    private Long candidateProfileId;
    private Long adminId;
    private String adminName;
    private String adminEmail;
    private String content;
    private LocalDateTime createdAt;
}

