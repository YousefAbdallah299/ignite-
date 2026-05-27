package com.yousef.ignite.controller;

import com.yousef.ignite.dto.request.AdRequestDTO;
import com.yousef.ignite.dto.response.AdResponseDTO;
import com.yousef.ignite.service.AdService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/ads")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
@Tag(name = "Admin Ads")
public class AdminAdController {

    private final AdService adService;

    @GetMapping
    public ResponseEntity<List<AdResponseDTO>> getAllAds(
            @RequestHeader("Authorization") String token
    ) {
        return ResponseEntity.ok(adService.getAllAds(token));
    }

    @PostMapping
    public ResponseEntity<AdResponseDTO> createAd(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody AdRequestDTO request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adService.createAd(token, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAd(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id
    ) {
        adService.deleteAd(token, id);
        return ResponseEntity.noContent().build();
    }
}
