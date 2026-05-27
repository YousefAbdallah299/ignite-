package com.yousef.ignite.service;

import com.yousef.ignite.dto.request.AdRequestDTO;
import com.yousef.ignite.dto.response.AdResponseDTO;

import java.util.List;

public interface AdService {
    List<AdResponseDTO> getActiveAds();
    List<AdResponseDTO> getAllAds(String bearerToken);
    AdResponseDTO createAd(String bearerToken, AdRequestDTO request);
    void deleteAd(String bearerToken, Long id);
}

