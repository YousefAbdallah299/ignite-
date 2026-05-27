package com.yousef.ignite.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSiteSettingsRequestDTO {
    @NotBlank
    private String recruiterPriceDisplay;

    @NotBlank
    @Email
    private String contactEmail;

    @NotBlank
    @Email
    private String supportEmail;

    @NotBlank
    @Email
    private String privacyEmail;

    @NotBlank
    private String contactPhone;
}
