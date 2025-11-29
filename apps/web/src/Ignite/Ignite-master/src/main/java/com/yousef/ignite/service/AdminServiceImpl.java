package com.yousef.ignite.service;

import com.yousef.ignite.dto.enums.UserRole;
import com.yousef.ignite.dto.response.UserSummaryDTO;
import com.yousef.ignite.entity.User;
import com.yousef.ignite.exception.custom.ResourceNotFoundException;
import com.yousef.ignite.exception.custom.UnauthorizedAccessException;
import com.yousef.ignite.repository.UserRepository;
import com.yousef.ignite.service.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {
    private final JwtUtils jwtUtils;
    UserRepository userRepository;

    @Override
    public void ensureAdmin(String bearerToken) throws UnauthorizedAccessException, ResourceNotFoundException {
        String token = bearerToken.substring(7);
        String email = jwtUtils.getEmailFromJwtToken(token);
        User me = userRepository.findUserByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!me.getRole().equals(UserRole.ADMIN)) {
            throw new UnauthorizedAccessException("Admin only endpoint");
        }
    }

    @Override
    public ResponseEntity<List<UserSummaryDTO>> listUsers(String token) {
        ensureAdmin(token);
        List<UserSummaryDTO> users = userRepository.findAll().stream().map(u -> UserSummaryDTO.builder()
                .id(u.getId())
                .first_name(u.getFirstName())
                .last_name(u.getLastName())
                .email(u.getEmail())
                .phoneNumber(u.getPhoneNumber())
                .role(u.getRole())
                .build()).toList();
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    @Override
    public ResponseEntity<Void> updateUserRole(String token, Long userId, UserRole role) {
        ensureAdmin(token);
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setRole(role);
        userRepository.save(user);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @Override
    public ResponseEntity<UserSummaryDTO> addRecruiter(String token, Long userId) {
        ensureAdmin(token);
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setRole(UserRole.RECRUITER);
        userRepository.save(user);
        return new ResponseEntity<>(UserSummaryDTO.builder()
                .id(user.getId())
                .first_name(user.getFirstName())
                .last_name(user.getLastName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .build(), HttpStatus.OK);
    }
}
