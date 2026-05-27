package com.yousef.ignite.service;

import com.yousef.ignite.dto.request.UpdateSiteSettingsRequestDTO;
import com.yousef.ignite.dto.response.SiteSettingsResponseDTO;
import com.yousef.ignite.entity.SiteSettings;
import com.yousef.ignite.repository.SiteSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SiteSettingsServiceImpl implements SiteSettingsService {

    private static final String MANAGE_SITE_SETTINGS = "MANAGE_SITE_SETTINGS";

    private final SiteSettingsRepository siteSettingsRepository;
    private final AdminService adminService;

    private SiteSettings getOrCreateSettings() {
        return siteSettingsRepository.findTopByOrderByIdAsc()
                .orElseGet(() -> siteSettingsRepository.save(SiteSettings.builder().build()));
    }

    private SiteSettingsResponseDTO toResponse(SiteSettings settings) {
        return SiteSettingsResponseDTO.builder()
                .recruiterPriceDisplay(settings.getRecruiterPriceDisplay())
                .contactEmail(settings.getContactEmail())
                .supportEmail(settings.getSupportEmail())
                .privacyEmail(settings.getPrivacyEmail())
                .contactPhone(settings.getContactPhone())
                .build();
    }

    @Override
    public ResponseEntity<SiteSettingsResponseDTO> getPublicSettings() {
        return new ResponseEntity<>(toResponse(getOrCreateSettings()), HttpStatus.OK);
    }

    @Override
    @Transactional
    public ResponseEntity<SiteSettingsResponseDTO> updateSettings(String token, UpdateSiteSettingsRequestDTO request) {
        adminService.ensurePrivilege(token, MANAGE_SITE_SETTINGS);

        SiteSettings settings = getOrCreateSettings();
        settings.setRecruiterPriceDisplay(request.getRecruiterPriceDisplay());
        settings.setContactEmail(request.getContactEmail());
        settings.setSupportEmail(request.getSupportEmail());
        settings.setPrivacyEmail(request.getPrivacyEmail());
        settings.setContactPhone(request.getContactPhone());

        SiteSettings saved = siteSettingsRepository.save(settings);
        return new ResponseEntity<>(toResponse(saved), HttpStatus.OK);
    }
}
