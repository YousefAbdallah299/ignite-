package com.yousef.ignite.service;

import com.yousef.ignite.dto.enums.UserRole;
import com.yousef.ignite.dto.request.CreateCustomAdminRequestDTO;
import com.yousef.ignite.dto.response.AdminPrivilegeResponseDTO;
import com.yousef.ignite.dto.response.UserSummaryDTO;
import com.yousef.ignite.entity.AdminPrivilege;
import com.yousef.ignite.entity.User;
import com.yousef.ignite.exception.custom.EmailAlreadyExistsException;
import com.yousef.ignite.exception.custom.ResourceNotFoundException;
import com.yousef.ignite.exception.custom.UnauthorizedAccessException;
import com.yousef.ignite.repository.AdminPrivilegeRepository;
import com.yousef.ignite.repository.UserRepository;
import com.yousef.ignite.service.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;
    private final AdminPrivilegeRepository adminPrivilegeRepository;
    private final PasswordEncoder passwordEncoder;

    private User getUserFromToken(String bearerToken) {
        String token = bearerToken.substring(7);
        String email = jwtUtils.getEmailFromJwtToken(token);
        return userRepository.findUserByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Override
    public void ensureAdmin(String bearerToken) throws UnauthorizedAccessException, ResourceNotFoundException {
        User me = getUserFromToken(bearerToken);
        if (!me.getRole().equals(UserRole.ADMIN)) {
            throw new UnauthorizedAccessException("Admin only endpoint");
        }
    }

    @Override
    public void ensurePrivilege(String bearerToken, String privilegeName) throws UnauthorizedAccessException, ResourceNotFoundException {
        User me = getUserFromToken(bearerToken);
        if (!me.getRole().equals(UserRole.ADMIN)) {
            throw new UnauthorizedAccessException("Admin only endpoint");
        }

        // Full admins have all privileges
        if (me.getIsCustomAdmin() == null || !me.getIsCustomAdmin()) {
            return; // Full admin, has all privileges
        }

        // Check if custom admin has this privilege
        boolean hasPrivilege = adminPrivilegeRepository.findByUserAndPrivilegeName(me, privilegeName)
                .map(AdminPrivilege::getEnabled)
                .orElse(false);

        if (!hasPrivilege) {
            throw new UnauthorizedAccessException("You don't have permission for: " + privilegeName);
        }
    }

    @Override
    public boolean hasPrivilege(String bearerToken, String privilegeName) {
        try {
            User me = getUserFromToken(bearerToken);
            if (!me.getRole().equals(UserRole.ADMIN)) {
                return false;
            }

            // Full admins have all privileges
            if (me.getIsCustomAdmin() == null || !me.getIsCustomAdmin()) {
                return true;
            }

            // Check if custom admin has this privilege
            return adminPrivilegeRepository.findByUserAndPrivilegeName(me, privilegeName)
                    .map(AdminPrivilege::getEnabled)
                    .orElse(false);
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public ResponseEntity<Void> suspendUser(String token, Long userId, Boolean suspended) {
        ensureAdmin(token);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // The system's auth flow checks `user.suspended`, not `user.enabled`.
        // So suspension must update the correct field.
        boolean suspendedValue = suspended != null && suspended;
        user.setSuspended(suspendedValue);
        userRepository.save(user);

        return ResponseEntity.noContent().build();
    }


    @Override
    public ResponseEntity<List<UserSummaryDTO>> listUsers(String token) {
        ensureAdmin(token);
        List<UserSummaryDTO> users = userRepository.findAllUserSummaries();
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

    @Override
    @Transactional
    public ResponseEntity<UserSummaryDTO> createCustomAdmin(String token, CreateCustomAdminRequestDTO request) {
        ensureAdmin(token);

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email already exists");
        }

        // Create user with ADMIN role and isCustomAdmin = true
        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.ADMIN)
                .isCustomAdmin(true)
                .enabled(true)
                .phoneNumber("")
                .build();

        User savedUser = userRepository.save(user);

        // Create privileges
        if (request.getPrivileges() != null) {
            for (String privilegeName : request.getPrivileges()) {
                AdminPrivilege privilege = AdminPrivilege.builder()
                        .user(savedUser)
                        .privilegeName(privilegeName)
                        .enabled(true)
                        .build();
                adminPrivilegeRepository.save(privilege);
            }
        }

        return new ResponseEntity<>(UserSummaryDTO.builder()
                .id(savedUser.getId())
                .first_name(savedUser.getFirstName())
                .last_name(savedUser.getLastName())
                .email(savedUser.getEmail())
                .phoneNumber(savedUser.getPhoneNumber())
                .role(savedUser.getRole())
                .build(), HttpStatus.CREATED);
    }

    @Override
    public ResponseEntity<List<AdminPrivilegeResponseDTO>> getMyPrivileges(String token) {
        User me = getUserFromToken(token);
        if (!me.getRole().equals(UserRole.ADMIN)) {
            throw new UnauthorizedAccessException("Admin only endpoint");
        }

        // Full admins don't have privilege records, return empty list or all privileges
        if (me.getIsCustomAdmin() == null || !me.getIsCustomAdmin()) {
            // Return all available privileges as enabled for full admins
            return new ResponseEntity<>(List.of(
                    AdminPrivilegeResponseDTO.builder().privilegeName("MANAGE_COURSES").enabled(true).build(),
                    AdminPrivilegeResponseDTO.builder().privilegeName("MANAGE_USERS").enabled(true).build(),
                    AdminPrivilegeResponseDTO.builder().privilegeName("MANAGE_WORKSHOPS").enabled(true).build(),
                    AdminPrivilegeResponseDTO.builder().privilegeName("RATE_SKILLS").enabled(true).build(),
                    AdminPrivilegeResponseDTO.builder().privilegeName("MANAGE_ADS").enabled(true).build(),
                    AdminPrivilegeResponseDTO.builder().privilegeName("MANAGE_OFFERS").enabled(true).build(),
                    AdminPrivilegeResponseDTO.builder().privilegeName("MANAGE_SITE_SETTINGS").enabled(true).build()
            ), HttpStatus.OK);
        }

        List<AdminPrivilegeResponseDTO> privileges = adminPrivilegeRepository.findByUser(me).stream()
                .map(p -> AdminPrivilegeResponseDTO.builder()
                        .id(p.getId())
                        .privilegeName(p.getPrivilegeName())
                        .enabled(p.getEnabled())
                        .build())
                .collect(Collectors.toList());

        return new ResponseEntity<>(privileges, HttpStatus.OK);
    }
}
