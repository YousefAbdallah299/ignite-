package com.yousef.ignite.service;

import com.yousef.ignite.dto.enums.UserRole;
import com.yousef.ignite.dto.response.PagedResponse;
import com.yousef.ignite.dto.response.UserSummaryDTO;
import com.yousef.ignite.entity.User;
import com.yousef.ignite.exception.custom.ResourceNotFoundException;
import com.yousef.ignite.exception.custom.UnauthorizedAccessException;
import com.yousef.ignite.repository.UserRepository;
import com.yousef.ignite.service.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;


    @Override
    public PagedResponse<UserSummaryDTO> getAllUsers(
            String bearerToken, int page, int size, String query, UserRole role) {

        User me = getUser(bearerToken);

        if (me.getRole() != UserRole.ADMIN) {
            throw new UnauthorizedAccessException("You are not authorized to perform this operation");
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<User> userPage;

        boolean hasQuery = query != null && !query.trim().isEmpty();
        boolean hasRole = role != null;

        // Split query into first + last name
        String firstName = null;
        String lastName = null;
        if (hasQuery) {
            String[] parts = query.trim().split("\\s+", 2);
            firstName = parts[0];
            lastName = (parts.length > 1) ? parts[1] : null;
        }

        if (hasQuery && hasRole) {
            userPage = userRepository.searchByRoleAndName(role, query, firstName, lastName, pageable);
        } else if (hasQuery) {
            userPage = userRepository.searchByName(query, firstName, lastName, pageable);
        } else if (hasRole) {
            userPage = userRepository.findByRole(role, pageable);
        } else {
            userPage = userRepository.findAll(pageable);
        }

        return new PagedResponse<>(
                userPage.getContent().stream().map(this::mapToDTO).toList(),
                userPage.getNumber(),
                userPage.getSize(),
                userPage.getTotalElements(),
                userPage.getTotalPages(),
                userPage.isLast()
        );
    }




    @Override
    public UserSummaryDTO getUserById(String token, Long id) {

        User me = getUser(token);

        if (me.getRole() != UserRole.ADMIN) {
            throw new UnauthorizedAccessException("You are not authorized to perform this operation");
        }

        User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return mapToDTO(user);
    }

    @Override
    public void deleteUserById(String token, Long id) {

        User me = getUser(token);

        if (me.getRole() != UserRole.ADMIN) {
            throw new UnauthorizedAccessException("You are not authorized to perform this operation");
        }

        userRepository.deleteById(id);

    }

    @Override
    public PagedResponse<UserSummaryDTO> searchUsersByEmail(
            String bearerToken, int page, int size, String email, UserRole role) {

        User me = getUser(bearerToken); // assume you already have this helper

        if (me.getRole() != UserRole.ADMIN) {
            throw new UnauthorizedAccessException("You are not authorized to perform this operation");
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<User> userPage;

        boolean hasEmail = email != null && !email.trim().isEmpty();
        boolean hasRole = role != null;

        if (hasEmail && hasRole) {
            userPage = userRepository.searchByRoleAndEmail(role, email, pageable);
        } else if (hasEmail) {
            userPage = userRepository.searchByEmail(email, pageable);
        } else if (hasRole) {
            userPage = userRepository.findByRole(role, pageable);
        } else {
            userPage = userRepository.findAll(pageable);
        }

        return new PagedResponse<>(
                userPage.getContent().stream().map(this::mapToDTO).toList(),
                userPage.getNumber(),
                userPage.getSize(),
                userPage.getTotalElements(),
                userPage.getTotalPages(),
                userPage.isLast()
        );
    }

    private User getUser(String bearerToken) {
        String token = bearerToken.substring(7);
        String email = jwtUtils.getEmailFromJwtToken(token);
        return userRepository.findUserByEmail(email)
                .orElseThrow(() -> new UnauthorizedAccessException("User not found"));
    }

    private UserSummaryDTO mapToDTO(User user) {
        return UserSummaryDTO.builder()
                .id(user.getId())
                .first_name(user.getFirstName())
                .last_name(user.getLastName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .suspended(user.getSuspended() != null ? user.getSuspended() : false)
                .build();
    }
}
