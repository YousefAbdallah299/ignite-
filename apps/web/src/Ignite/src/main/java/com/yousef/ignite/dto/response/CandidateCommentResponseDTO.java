package com.yousef.ignite.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateCommentResponseDTO {
    private Long id;
    private String comment;
    private String adminName;
    private String adminEmail;
    private LocalDateTime createdAt;
}

