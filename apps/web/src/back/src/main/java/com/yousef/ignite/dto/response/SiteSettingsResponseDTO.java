package com.yousef.ignite.dto.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SiteSettingsResponseDTO {
    private String recruiterPriceDisplay;
    private String contactEmail;
    private String supportEmail;
    private String privacyEmail;
    private String contactPhone;
}
