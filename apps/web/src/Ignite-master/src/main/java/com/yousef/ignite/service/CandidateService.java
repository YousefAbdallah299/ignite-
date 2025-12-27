package com.yousef.ignite.service;

import com.yousef.ignite.dto.request.CandidateSkillRatingRequestDTO;
import com.yousef.ignite.dto.request.CandidateSkillsAddRequestDTO;
import com.yousef.ignite.dto.request.UpdateCandidateProfileDTO;
import com.yousef.ignite.dto.response.*;

import java.util.List;

public interface CandidateService {
    CandidateProfileResponseDTO getMyProfile(String bearerToken);

    CandidateProfileResponseDTO getCandidateById(Long candidateProfileId);

    PagedResponse<CandidateProfileResponseDTO> getAllCandidates(
            int page, int size, String query, List<String> skills);

    List<SkillResponseDTO> getAllSkills();


    CandidateProfileResponseDTO rateCandidateSkill(String token, Long candidateId, CandidateSkillRatingRequestDTO request);

    CandidateProfileResponseDTO addSkillsToMyProfile(String token, CandidateSkillsAddRequestDTO request);

    CandidateProfileResponseDTO updateMyProfile(String bearerToken, UpdateCandidateProfileDTO request);
}


