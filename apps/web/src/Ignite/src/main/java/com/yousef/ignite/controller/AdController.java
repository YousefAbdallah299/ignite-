package com.yousef.ignite.controller;

import com.yousef.ignite.dto.request.AdRequestDTO;
import com.yousef.ignite.dto.response.AdResponseDTO;
import com.yousef.ignite.service.AdService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ads")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
@Tag(name = "Ads", description = "Endpoints for advertisement management.")
public class AdController {

    private final AdService adService;

    @GetMapping("/active")
    @Operation(summary = "Get active ads", description = "Returns all currently active ads within their date range.")
    public ResponseEntity<List<AdResponseDTO>> getActiveAds() {
        return ResponseEntity.ok(adService.getActiveAds());
    }
}

