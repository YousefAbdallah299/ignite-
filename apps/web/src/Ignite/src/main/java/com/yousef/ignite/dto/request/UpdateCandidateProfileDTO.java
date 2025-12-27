package com.yousef.ignite.dto.request;

import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCandidateProfileDTO {

    @NotBlank
    private String title;

    @Nullable
    private String summary;

    @Nullable
    private String resumeUrl;

    @Nullable
    private String location;

    @Nullable
    private Double expectedSalary;

    @Nullable
    private String expectedPosition;
}


