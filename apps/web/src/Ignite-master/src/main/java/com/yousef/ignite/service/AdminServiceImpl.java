package com.yousef.ignite.service;

import com.yousef.ignite.dto.enums.UserRole;
import com.yousef.ignite.dto.request.CreateCustomAdminDTO;
import com.yousef.ignite.dto.request.UpdateAdminPrivilegesDTO;
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
    public void ensureFullAdmin(String bearerToken) throws UnauthorizedAccessException, ResourceNotFoundException {
        String token = bearerToken.substring(7);
        String email = jwtUtils.getEmailFromJwtToken(token);
        User me = userRepository.findUserByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!me.getRole().equals(UserRole.ADMIN)) {
            throw new UnauthorizedAccessException("Admin only endpoint");
        }
        // Check if user is a custom admin (has privileges) - only full admins can manage custom admins
        AdminPrivilege privilege = adminPrivilegeRepository.findByUser(me).orElse(null);
        if (privilege != null) {
            throw new UnauthorizedAccessException("Only full admins can perform this action");
        }
    }

    @Override
    public boolean hasPrivilege(String bearerToken, String privilegeName) {
        try {
            String token = bearerToken.substring(7);
            String email = jwtUtils.getEmailFromJwtToken(token);
            User me = userRepository.findUserByEmail(email).orElse(null);
            if (me == null || !me.getRole().equals(UserRole.ADMIN)) {
                return false;
            }
            // Full admins have all privileges
            AdminPrivilege privilege = adminPrivilegeRepository.findByUser(me).orElse(null);
            if (privilege == null) {
                return true; // Full admin
            }
            // Check specific privilege
            return switch (privilegeName) {
                case "canManageCourses" -> privilege.getCanManageCourses();
                case "canManageUsers" -> privilege.getCanManageUsers();
                case "canRateSkills" -> privilege.getCanRateSkills();
                case "canManageWorkshops" -> privilege.getCanManageWorkshops();
                default -> false;
            };
        } catch (Exception e) {
            return false;
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

    @Override
    @Transactional
    public ResponseEntity<AdminPrivilegeResponseDTO> createCustomAdmin(String token, CreateCustomAdminDTO request) {
        ensureFullAdmin(token); // Only full admins can create custom admins

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email already exists");
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(UserRole.ADMIN)
                .enabled(true)
                .build();
        user = userRepository.save(user);

        AdminPrivilege privilege = AdminPrivilege.builder()
                .user(user)
                .canManageCourses(request.getCanManageCourses())
                .canManageUsers(request.getCanManageUsers())
                .canRateSkills(request.getCanRateSkills())
                .canManageWorkshops(request.getCanManageWorkshops())
                .canManageCustomAdmins(false) // Custom admins cannot manage other custom admins
                .build();
        privilege = adminPrivilegeRepository.save(privilege);

        return new ResponseEntity<>(toPrivilegeResponseDTO(privilege), HttpStatus.CREATED);
    }

    @Override
    public ResponseEntity<List<AdminPrivilegeResponseDTO>> getAllCustomAdmins(String token) {
        ensureFullAdmin(token);
        List<AdminPrivilege> privileges = adminPrivilegeRepository.findAll();
        List<AdminPrivilegeResponseDTO> response = privileges.stream()
                .map(this::toPrivilegeResponseDTO)
                .collect(Collectors.toList());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Override
    public ResponseEntity<AdminPrivilegeResponseDTO> getCustomAdminPrivileges(String token, Long userId) {
        ensureFullAdmin(token);
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        AdminPrivilege privilege = adminPrivilegeRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Custom admin not found"));
        return new ResponseEntity<>(toPrivilegeResponseDTO(privilege), HttpStatus.OK);
    }

    @Override
    @Transactional
    public ResponseEntity<AdminPrivilegeResponseDTO> updateCustomAdminPrivileges(String token, Long userId, UpdateAdminPrivilegesDTO request) {
        ensureFullAdmin(token);
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        AdminPrivilege privilege = adminPrivilegeRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Custom admin not found"));

        privilege.setCanManageCourses(request.getCanManageCourses());
        privilege.setCanManageUsers(request.getCanManageUsers());
        privilege.setCanRateSkills(request.getCanRateSkills());
        privilege.setCanManageWorkshops(request.getCanManageWorkshops());
        privilege = adminPrivilegeRepository.save(privilege);

        return new ResponseEntity<>(toPrivilegeResponseDTO(privilege), HttpStatus.OK);
    }

    @Override
    @Transactional
    public ResponseEntity<Void> deleteCustomAdmin(String token, Long userId) {
        ensureFullAdmin(token);
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        AdminPrivilege privilege = adminPrivilegeRepository.findByUser(user).orElse(null);
        if (privilege != null) {
            adminPrivilegeRepository.delete(privilege);
        }
        userRepository.delete(user);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    private AdminPrivilegeResponseDTO toPrivilegeResponseDTO(AdminPrivilege privilege) {
        User user = privilege.getUser();
        return AdminPrivilegeResponseDTO.builder()
                .id(privilege.getId())
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .canManageCourses(privilege.getCanManageCourses())
                .canManageUsers(privilege.getCanManageUsers())
                .canRateSkills(privilege.getCanRateSkills())
                .canManageWorkshops(privilege.getCanManageWorkshops())
                .build();
    }
}
