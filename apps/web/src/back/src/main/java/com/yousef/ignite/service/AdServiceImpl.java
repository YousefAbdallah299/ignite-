package com.yousef.ignite.service;

import com.yousef.ignite.dto.enums.UserRole;
import com.yousef.ignite.dto.request.AdRequestDTO;
import com.yousef.ignite.dto.response.AdResponseDTO;
import com.yousef.ignite.entity.Ad;
import com.yousef.ignite.entity.User;
import com.yousef.ignite.exception.custom.ResourceNotFoundException;
import com.yousef.ignite.exception.custom.UnauthorizedAccessException;
import com.yousef.ignite.repository.AdRepository;
import com.yousef.ignite.repository.UserRepository;
import com.yousef.ignite.service.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdServiceImpl implements AdService {

    private final AdRepository adRepository;
    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;

    private User getUserFromToken(String bearerToken) {
        String token = bearerToken.substring(7);
        String email = jwtUtils.getEmailFromJwtToken(token);
        return userRepository.findUserByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private AdResponseDTO toResponse(Ad ad) {
        return AdResponseDTO.builder()
                .id(ad.getId())
                .title(ad.getTitle())
                .imageUrl(ad.getImageUrl())
                .redirectUrl(ad.getRedirectUrl())
                .startDate(ad.getStartDate())
                .endDate(ad.getEndDate())
                .createdAt(ad.getCreatedAt())
                .build();
    }

    @Override
    public List<AdResponseDTO> getActiveAds() {
        LocalDate today = LocalDate.now();
        List<Ad> activeAds = adRepository.findByStartDateLessThanEqualAndEndDateGreaterThanEqual(
                today, today);
        return activeAds.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<AdResponseDTO> getAllAds(String bearerToken) {
        User user = getUserFromToken(bearerToken);
        if (user.getRole() != UserRole.ADMIN) {
            throw new UnauthorizedAccessException("Only admins can view all ads");
        }

        return adRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AdResponseDTO createAd(String bearerToken, AdRequestDTO request) {
        User user = getUserFromToken(bearerToken);
        if (user.getRole() != UserRole.ADMIN) {
            throw new UnauthorizedAccessException("Only admins can create ads");
        }

        Ad ad = Ad.builder()
                .title(request.getTitle())
                .imageUrl(request.getImageUrl())
                .redirectUrl(request.getRedirectUrl())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .build();

        Ad saved = adRepository.save(ad);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteAd(String bearerToken, Long id) {
        User user = getUserFromToken(bearerToken);
        if (user.getRole() != UserRole.ADMIN) {
            throw new UnauthorizedAccessException("Only admins can delete ads");
        }

        Ad ad = adRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ad not found"));

        adRepository.delete(ad);
    }
}

