package com.yousef.ignite.service;

import com.yousef.ignite.dto.enums.UserRole;
import com.yousef.ignite.dto.request.CreateCustomAdminDTO;
import com.yousef.ignite.dto.request.UpdateAdminPrivilegesDTO;
import com.yousef.ignite.dto.response.AdminPrivilegeResponseDTO;
import com.yousef.ignite.dto.response.UserSummaryDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

public interface AdminService {
    void ensureAdmin(String bearerToken);
    void ensureFullAdmin(String bearerToken); // Full admin (not custom admin)
    boolean hasPrivilege(String bearerToken, String privilegeName);
    ResponseEntity<List<UserSummaryDTO>> listUsers(String token);
    public ResponseEntity<Void> updateUserRole(String token, Long userId, UserRole role);
    public ResponseEntity<UserSummaryDTO> addRecruiter(String token,Long userId);
    ResponseEntity<AdminPrivilegeResponseDTO> createCustomAdmin(String token, CreateCustomAdminDTO request);
    ResponseEntity<List<AdminPrivilegeResponseDTO>> getAllCustomAdmins(String token);
    ResponseEntity<AdminPrivilegeResponseDTO> getCustomAdminPrivileges(String token, Long userId);
    ResponseEntity<AdminPrivilegeResponseDTO> updateCustomAdminPrivileges(String token, Long userId, UpdateAdminPrivilegesDTO request);
    ResponseEntity<Void> deleteCustomAdmin(String token, Long userId);
}
