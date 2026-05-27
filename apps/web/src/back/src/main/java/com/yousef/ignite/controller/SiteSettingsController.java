package com.yousef.ignite.controller;

import com.yousef.ignite.dto.response.SiteSettingsResponseDTO;
import com.yousef.ignite.service.SiteSettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/settings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
@Tag(name = "Site Settings")
public class SiteSettingsController {

    private final SiteSettingsService siteSettingsService;

    @GetMapping(produces = "application/json")
    @Operation(summary = "Get public site settings", description = "Returns pricing and contact information for the application.")
    public ResponseEntity<SiteSettingsResponseDTO> getPublicSettings() {
        return siteSettingsService.getPublicSettings();
    }
}
