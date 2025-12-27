package com.yousef.ignite.service;

import com.yousef.ignite.dto.enums.UserRole;
import com.yousef.ignite.dto.response.UserSummaryDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

public interface AdminService {
    void ensureAdmin(String bearerToken);
    ResponseEntity<List<UserSummaryDTO>> listUsers(String token);
    public ResponseEntity<Void> updateUserRole(String token, Long userId, UserRole role);
    public ResponseEntity<UserSummaryDTO> addRecruiter(String token,Long userId);
}
