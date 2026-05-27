package com.yousef.ignite.service;

import com.yousef.ignite.dto.enums.UserRole;
import com.yousef.ignite.dto.request.UpdateRecruiterProfileRequestDTO;
import com.yousef.ignite.dto.response.PagedResponse;
import com.yousef.ignite.dto.response.RecruiterProfileResponseDTO;
import com.yousef.ignite.entity.RecruiterProfile;
import com.yousef.ignite.entity.User;
import com.yousef.ignite.exception.custom.ResourceNotFoundException;
import com.yousef.ignite.exception.custom.UnauthorizedAccessException;
import com.yousef.ignite.repository.RecruiterProfileRepository;
import com.yousef.ignite.repository.UserRepository;
import com.yousef.ignite.service.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RecruiterProfileServiceImpl implements RecruiterProfileService {

    private final RecruiterProfileRepository recruiterProfileRepository;
    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;

    private User getUser(String bearerToken) {
        String token = bearerToken.substring(7);
        String email = jwtUtils.getEmailFromJwtToken(token);
        return userRepository.findUserByEmail(email)
                .orElseThrow(() -> new UnauthorizedAccessException("User not found"));
    }

    private RecruiterProfileResponseDTO mapToDTO(RecruiterProfile recruiter) {
        return RecruiterProfileResponseDTO.builder()
                .id(recruiter.getId())
                .userId(recruiter.getUser().getId())
                .firstName(recruiter.getUser().getFirstName())
                .lastName(recruiter.getUser().getLastName())
                .email(recruiter.getUser().getEmail())
                .phoneNumber(recruiter.getUser().getPhoneNumber())
                .status(recruiter.getStatus())
                .companyName(recruiter.getCompanyName())
                .businessEmail(recruiter.getBusinessEmail())
                .subscriptionStartDate(recruiter.getSubscriptionStartDate())
                .subscriptionEndDate(recruiter.getSubscriptionEndDate())
                .build();
    }


    @Override
    @Transactional
    public RecruiterProfileResponseDTO updateMyProfile(String bearerToken, UpdateRecruiterProfileRequestDTO request) {
        User me = getUserFromToken(bearerToken);


        RecruiterProfile profile = recruiterProfileRepository.findByUser(me)
                .orElseGet(() -> RecruiterProfile.builder().user(me).build());

        profile.setCompanyName(request.getCompanyName());

        RecruiterProfile saved = recruiterProfileRepository.save(profile);

        return mapToDTO(saved);
    }

    @Override
    public RecruiterProfileResponseDTO getRecruiterById(String token, Long id) {
        User me = getUser(token);

        if (me.getRole() != UserRole.ADMIN) {
            throw new UnauthorizedAccessException("You are not authorized to perform this operation");
        }
        RecruiterProfile profile = recruiterProfileRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Profile not found"));
        return mapToDTO(profile);
    }

    @Override
    public RecruiterProfileResponseDTO getRecruiterByUserId(String token, Long userId) {
        User me = getUser(token);

        if (me.getRole() != UserRole.ADMIN) {
            throw new UnauthorizedAccessException("You are not authorized to perform this operation");
        }

        RecruiterProfile profile = recruiterProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter profile not found"));
        return mapToDTO(profile);
    }

    @Override
    public RecruiterProfileResponseDTO getMyProfile(String bearerToken) {
        User me = getUserFromToken(bearerToken);
        RecruiterProfile profile = recruiterProfileRepository.findByUser(me).orElseThrow(() -> new ResourceNotFoundException("Profile not found"));
        return mapToDTO(profile);
    }

    private User getUserFromToken(String bearerToken) {
        String token = bearerToken.substring(7);
        String email = jwtUtils.getEmailFromJwtToken(token);
        return userRepository.findUserByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

}
