package com.yousef.ignite.service;
import com.yousef.ignite.dto.request.UpdateRecruiterProfileRequestDTO;
import com.yousef.ignite.dto.response.RecruiterProfileResponseDTO;


public interface RecruiterProfileService {

    RecruiterProfileResponseDTO updateMyProfile(String bearerToken, UpdateRecruiterProfileRequestDTO request);

    RecruiterProfileResponseDTO getRecruiterById(String token, Long id);

    RecruiterProfileResponseDTO getRecruiterByUserId(String token, Long userId);

    RecruiterProfileResponseDTO getMyProfile(String bearerToken);



}
