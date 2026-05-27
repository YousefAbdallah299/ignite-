package com.yousef.ignite.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateSkillsAddRequestDTO {

    @NotEmpty(message = "At least one skill is required")
    private List<String> skillNames;
}
