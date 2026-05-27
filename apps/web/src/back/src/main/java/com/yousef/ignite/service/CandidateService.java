package com.yousef.ignite.service;

import com.yousef.ignite.dto.request.CandidateCommentRequestDTO;
import com.yousef.ignite.dto.request.CandidateSkillRatingRequestDTO;
import com.yousef.ignite.dto.request.CandidateSkillsAddRequestDTO;
import com.yousef.ignite.dto.request.CareerHistoryRequestDTO;
import com.yousef.ignite.dto.request.UpdateCandidateProfileDTO;
import com.yousef.ignite.dto.response.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface CandidateService {
    CandidateProfileResponseDTO getMyProfile(String bearerToken);


    CandidateProfileResponseDTO getCandidateByUserId(Long userId, String bearerToken);

    CandidateProfileResponseDTO getCandidateById(Long candidateProfileId, String bearerToken);

    PagedResponse<CandidateProfileResponseDTO> getAllCandidates(
            int page, int size, String query, List<String> skills, String bearerToken);

    List<SkillResponseDTO> getAllSkills();


    CandidateProfileResponseDTO rateCandidateSkill(String token, Long candidateId, CandidateSkillRatingRequestDTO request);

    CandidateProfileResponseDTO addSkillsToMyProfile(String token, CandidateSkillsAddRequestDTO request);

    CandidateProfileResponseDTO removeSkillsFromMyProfile(String token, CandidateSkillsAddRequestDTO request);

    CandidateProfileResponseDTO updateMyProfile(String bearerToken, UpdateCandidateProfileDTO request);

    CandidateProfileResponseDTO uploadResume(String bearerToken, MultipartFile file);

    CandidateCommentResponseDTO addComment(String bearerToken, Long candidateId, CandidateCommentRequestDTO request);

    List<CandidateCommentResponseDTO> getComments(Long candidateId, String bearerToken);

    CareerHistoryResponseDTO addCareerHistory(String bearerToken, CareerHistoryRequestDTO request);

    CareerHistoryResponseDTO updateCareerHistory(String bearerToken, Long careerHistoryId, CareerHistoryRequestDTO request);

    void deleteCareerHistory(String bearerToken, Long careerHistoryId);

    List<CareerHistoryResponseDTO> getMyCareerHistory(String bearerToken);
}


