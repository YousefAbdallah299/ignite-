package com.yousef.ignite.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateCandidateCommentDTO {

    @NotNull
    private Long candidateProfileId;

    @NotBlank
    private String content;
}

