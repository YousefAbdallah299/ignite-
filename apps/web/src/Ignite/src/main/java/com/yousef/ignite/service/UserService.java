package com.yousef.ignite.service;

import com.yousef.ignite.dto.enums.UserRole;
import com.yousef.ignite.dto.response.PagedResponse;
import com.yousef.ignite.dto.response.UserSummaryDTO;


public interface UserService {
    PagedResponse<UserSummaryDTO> getAllUsers(
            String bearerToken, int page, int size, String query, UserRole role);
    UserSummaryDTO getUserById(String token, Long id);
    void deleteUserById(String token,Long id);
    PagedResponse<UserSummaryDTO> searchUsersByEmail(
            String bearerToken, int page, int size, String email, UserRole role);
}
