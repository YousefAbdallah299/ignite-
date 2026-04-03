package com.yousef.ignite.controller;

import com.yousef.ignite.dto.request.AdRequestDTO;
import com.yousef.ignite.dto.request.CreateCustomAdminRequestDTO;
import com.yousef.ignite.dto.request.SuspendUserRequestDTO;
import com.yousef.ignite.dto.response.AdminPrivilegeResponseDTO;
import com.yousef.ignite.dto.response.AdResponseDTO;
import com.yousef.ignite.dto.response.UserSummaryDTO;
import com.yousef.ignite.service.AdminService;
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
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
@Tag(name = "Admin")
public class AdminController {

    private final AdminService adminService;
    private final AdService adService;

    @PostMapping(value = "/custom-admin", consumes = "application/json", produces = "application/json")
    public ResponseEntity<UserSummaryDTO> createCustomAdmin(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody CreateCustomAdminRequestDTO request
    ) {
        return adminService.createCustomAdmin(token, request);
    }

    @GetMapping(value = "/my-privileges", produces = "application/json")
    public ResponseEntity<List<AdminPrivilegeResponseDTO>> getMyPrivileges(
            @RequestHeader("Authorization") String token
    ) {
        return adminService.getMyPrivileges(token);
    }

    @PutMapping(value = "/users/{userId}/suspend", produces = "application/json")
    public ResponseEntity<Void> suspendUser(
            @RequestHeader("Authorization") String token,
            @PathVariable Long userId,
            @Valid @RequestBody SuspendUserRequestDTO request
    ) {
        return adminService.suspendUser(token, userId, request.getSuspended());
    }

    @PostMapping(value = "/ads", consumes = "application/json", produces = "application/json")
    @Operation(summary = "Create ad", description = "Creates a new advertisement. Admin only.")
    public ResponseEntity<AdResponseDTO> createAd(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody AdRequestDTO request
    ) {
        return new ResponseEntity<>(adService.createAd(token, request), HttpStatus.CREATED);
    }

    @DeleteMapping(value = "/ads/{id}", produces = "application/json")
    @Operation(summary = "Delete ad", description = "Deletes an advertisement by ID. Admin only.")
    public ResponseEntity<Void> deleteAd(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id
    ) {
        adService.deleteAd(token, id);
        return ResponseEntity.noContent().build();
    }
}

