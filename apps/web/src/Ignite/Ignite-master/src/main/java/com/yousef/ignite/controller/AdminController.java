package com.yousef.ignite.controller;

import com.yousef.ignite.dto.request.CreateCustomAdminRequestDTO;
import com.yousef.ignite.dto.response.AdminPrivilegeResponseDTO;
import com.yousef.ignite.dto.response.UserSummaryDTO;
import com.yousef.ignite.service.AdminService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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

    @PostMapping("/custom-admin")
    public ResponseEntity<UserSummaryDTO> createCustomAdmin(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody CreateCustomAdminRequestDTO request
    ) {
        return adminService.createCustomAdmin(token, request);
    }

    @GetMapping("/my-privileges")
    public ResponseEntity<List<AdminPrivilegeResponseDTO>> getMyPrivileges(
            @RequestHeader("Authorization") String token
    ) {
        return adminService.getMyPrivileges(token);
    }
}

