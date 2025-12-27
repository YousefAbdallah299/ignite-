package com.yousef.ignite.controller;

import com.yousef.ignite.dto.enums.UserRole;
import com.yousef.ignite.dto.response.PagedResponse;
import com.yousef.ignite.dto.response.UserSummaryDTO;
import com.yousef.ignite.service.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
@Tag(name = "Users")
public class UserController {
    private final UserService userService;

    @GetMapping
    public PagedResponse<UserSummaryDTO> getAllUsers(
            @RequestHeader("Authorization") String token,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) UserRole role
    ) {
        return userService.getAllUsers(token, page, size, query, role);
    }



    @GetMapping("/{id}")
    public UserSummaryDTO getUserById(@RequestHeader("Authorization") String token, @PathVariable Long id) {
        return userService.getUserById(token, id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUserById(@RequestHeader("Authorization") String token, @PathVariable Long id) {
        userService.deleteUserById(token, id);
        return ResponseEntity.ok().build();

    }

    @GetMapping("/search-by-email")
    public PagedResponse<UserSummaryDTO> searchByEmail(
            @RequestHeader("Authorization") String token,
            @RequestParam(required = false) String emailPart,
            @RequestParam(required = false) UserRole role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return userService.searchUsersByEmail(token, page, size, emailPart, role);
    }
}
