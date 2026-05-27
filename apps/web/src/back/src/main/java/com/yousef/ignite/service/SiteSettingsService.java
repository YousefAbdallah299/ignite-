package com.yousef.ignite.service;

import com.yousef.ignite.dto.request.UpdateSiteSettingsRequestDTO;
import com.yousef.ignite.dto.response.SiteSettingsResponseDTO;
import org.springframework.http.ResponseEntity;

public interface SiteSettingsService {
    ResponseEntity<SiteSettingsResponseDTO> getPublicSettings();

    ResponseEntity<SiteSettingsResponseDTO> updateSettings(String token, UpdateSiteSettingsRequestDTO request);
}
