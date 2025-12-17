package com.yousef.ignite.controller;

import com.yousef.ignite.dto.request.CreateCustomAdminDTO;
import com.yousef.ignite.dto.request.UpdateAdminPrivilegesDTO;
import com.yousef.ignite.dto.response.AdminPrivilegeResponseDTO;
import com.yousef.ignite.service.AdminService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/custom-admins")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
@Tag(name = "Admin Privileges")
public class AdminPrivilegeController {

    private final AdminService adminService;

    @PostMapping
    public ResponseEntity<AdminPrivilegeResponseDTO> createCustomAdmin(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody CreateCustomAdminDTO request) {
        return adminService.createCustomAdmin(token, request);
    }

    @GetMapping
    public ResponseEntity<List<AdminPrivilegeResponseDTO>> getAllCustomAdmins(
            @RequestHeader("Authorization") String token) {
        return adminService.getAllCustomAdmins(token);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<AdminPrivilegeResponseDTO> getCustomAdminPrivileges(
            @RequestHeader("Authorization") String token,
            @PathVariable Long userId) {
        return adminService.getCustomAdminPrivileges(token, userId);
    }

    @PutMapping("/{userId}")
    public ResponseEntity<AdminPrivilegeResponseDTO> updateCustomAdminPrivileges(
            @RequestHeader("Authorization") String token,
            @PathVariable Long userId,
            @Valid @RequestBody UpdateAdminPrivilegesDTO request) {
        return adminService.updateCustomAdminPrivileges(token, userId, request);
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteCustomAdmin(
            @RequestHeader("Authorization") String token,
            @PathVariable Long userId) {
        return adminService.deleteCustomAdmin(token, userId);
    }
}

