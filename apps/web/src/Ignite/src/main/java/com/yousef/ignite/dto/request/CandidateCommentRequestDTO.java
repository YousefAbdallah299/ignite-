package com.yousef.ignite.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateCommentRequestDTO {
    @NotBlank
    private String comment;
}

