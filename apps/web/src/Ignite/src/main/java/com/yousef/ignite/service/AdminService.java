package com.yousef.ignite.service;

import com.yousef.ignite.dto.enums.UserRole;
import com.yousef.ignite.dto.request.CreateCustomAdminRequestDTO;
import com.yousef.ignite.dto.response.AdminPrivilegeResponseDTO;
import com.yousef.ignite.dto.response.UserSummaryDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

public interface AdminService {
    void ensureAdmin(String bearerToken);
    void ensurePrivilege(String bearerToken, String privilegeName);
    ResponseEntity<List<UserSummaryDTO>> listUsers(String token);
    public ResponseEntity<Void> updateUserRole(String token, Long userId, UserRole role);
    public ResponseEntity<UserSummaryDTO> addRecruiter(String token,Long userId);
    ResponseEntity<UserSummaryDTO> createCustomAdmin(String token, CreateCustomAdminRequestDTO request);
    ResponseEntity<List<AdminPrivilegeResponseDTO>> getMyPrivileges(String token);
    boolean hasPrivilege(String bearerToken, String privilegeName);
    ResponseEntity<Void> suspendUser(String token, Long userId, Boolean suspended);

}
