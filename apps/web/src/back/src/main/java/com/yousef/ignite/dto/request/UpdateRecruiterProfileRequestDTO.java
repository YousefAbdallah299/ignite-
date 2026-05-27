package com.yousef.ignite.dto.request;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UpdateRecruiterProfileRequestDTO {
    @NotBlank
    private String companyName;
}
