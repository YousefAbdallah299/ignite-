package com.yousef.ignite.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SendOfferDTO {
    @NotNull
    private Long candidateProfileId;
    @NotBlank
    private String title;
    private Double salary;
    private String currency;

}


