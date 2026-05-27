package com.yousef.ignite.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "site_settings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SiteSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "recruiter_price_display", nullable = false)
    @Builder.Default
    private String recruiterPriceDisplay = "29 EGP";

    @Column(name = "contact_email", nullable = false)
    @Builder.Default
    private String contactEmail = "contact@ignite.com";

    @Column(name = "support_email", nullable = false)
    @Builder.Default
    private String supportEmail = "support@ignite.com";

    @Column(name = "privacy_email", nullable = false)
    @Builder.Default
    private String privacyEmail = "privacy@ignite.com";

    @Column(name = "contact_phone", nullable = false)
    @Builder.Default
    private String contactPhone = "+1 (555) 123-4567";
}
