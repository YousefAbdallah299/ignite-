package com.yousef.ignite.controller;

import com.yousef.ignite.dto.request.CandidateCommentRequestDTO;
import com.yousef.ignite.dto.request.CandidateSkillRatingRequestDTO;
import com.yousef.ignite.dto.request.CandidateSkillsAddRequestDTO;
import com.yousef.ignite.dto.request.CareerHistoryRequestDTO;
import com.yousef.ignite.dto.request.UpdateCandidateProfileDTO;
import com.yousef.ignite.dto.response.*;
import com.yousef.ignite.service.CandidateService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/candidates")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
@Tag(name = "Candidates")
public class CandidateController {

    private final CandidateService candidateService;

    @GetMapping
    public ResponseEntity<PagedResponse<CandidateProfileResponseDTO>> getAllCandidates(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) List<String> skills,
            @RequestHeader(value = "Authorization", required = false) String token
    ) {
        return ResponseEntity.ok(
                candidateService.getAllCandidates(page, size, query, skills, token)
        );
    }

    @GetMapping("/me")
    public ResponseEntity<CandidateProfileResponseDTO> getMyProfile(@RequestHeader("Authorization") String token) {
        return new ResponseEntity<>(candidateService.getMyProfile(token), HttpStatus.OK);
    }

    @PutMapping("/me")
    public ResponseEntity<CandidateProfileResponseDTO> updateMyProfile(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody UpdateCandidateProfileDTO request
    ) {
        return ResponseEntity.ok(candidateService.updateMyProfile(token, request));
    }


    @GetMapping("/{candidateProfileId}")
    public ResponseEntity<CandidateProfileResponseDTO> getCandidateById(
            @PathVariable Long candidateProfileId,
            @RequestHeader(value = "Authorization", required = false) String token) {
        return new ResponseEntity<>(candidateService.getCandidateById(candidateProfileId, token), HttpStatus.OK);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<CandidateProfileResponseDTO> getCandidateByUserId(
            @PathVariable Long userId,
            @RequestHeader(value = "Authorization", required = false) String token) {
        return new ResponseEntity<>(candidateService.getCandidateByUserId(userId, token), HttpStatus.OK);
    }

    @PostMapping("/{candidateId}/skills/rating")
    public ResponseEntity<CandidateProfileResponseDTO> rateCandidateSkill(
            @RequestHeader("Authorization") String token,
            @PathVariable Long candidateId,
            @Valid @RequestBody CandidateSkillRatingRequestDTO request
    ) {
        return ResponseEntity.ok(
                candidateService.rateCandidateSkill(token, candidateId, request)
        );
    }

    @PostMapping("/me/skills")
    public ResponseEntity<CandidateProfileResponseDTO> addSkillsToMyProfile(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody CandidateSkillsAddRequestDTO request
    ) {
        return ResponseEntity.ok(candidateService.addSkillsToMyProfile(token, request));
    }

    @DeleteMapping("/me/skills")
    public ResponseEntity<CandidateProfileResponseDTO> removeSkillsFromMyProfile(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody CandidateSkillsAddRequestDTO request
    ) {
        return ResponseEntity.ok(candidateService.removeSkillsFromMyProfile(token, request));
    }

    @GetMapping("/skills")
    public ResponseEntity<List<SkillResponseDTO>> getAllSkills() {
        return ResponseEntity.ok(candidateService.getAllSkills());
    }

    @PostMapping(value = "/me/resume", consumes = {"multipart/form-data"})
    public ResponseEntity<CandidateProfileResponseDTO> uploadResume(
            @RequestHeader("Authorization") String token,
            @RequestPart("file") MultipartFile file
    ) {
        return ResponseEntity.ok(candidateService.uploadResume(token, file));
    }

    @PostMapping("/{candidateId}/comments")
    public ResponseEntity<CandidateCommentResponseDTO> addComment(
            @RequestHeader("Authorization") String token,
            @PathVariable Long candidateId,
            @Valid @RequestBody CandidateCommentRequestDTO request
    ) {
        return ResponseEntity.ok(candidateService.addComment(token, candidateId, request));
    }

    @GetMapping("/{candidateId}/comments")
    public ResponseEntity<List<CandidateCommentResponseDTO>> getComments(
            @RequestHeader("Authorization") String token,
            @PathVariable Long candidateId
    ) {
        return ResponseEntity.ok(candidateService.getComments(candidateId, token));
    }

    @PostMapping("/me/career-history")
    public ResponseEntity<CareerHistoryResponseDTO> addCareerHistory(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody CareerHistoryRequestDTO request
    ) {
        return ResponseEntity.ok(candidateService.addCareerHistory(token, request));
    }

    @PutMapping("/me/career-history/{careerHistoryId}")
    public ResponseEntity<CareerHistoryResponseDTO> updateCareerHistory(
            @RequestHeader("Authorization") String token,
            @PathVariable Long careerHistoryId,
            @Valid @RequestBody CareerHistoryRequestDTO request
    ) {
        return ResponseEntity.ok(candidateService.updateCareerHistory(token, careerHistoryId, request));
    }

    @DeleteMapping("/me/career-history/{careerHistoryId}")
    public ResponseEntity<Void> deleteCareerHistory(
            @RequestHeader("Authorization") String token,
            @PathVariable Long careerHistoryId
    ) {
        candidateService.deleteCareerHistory(token, careerHistoryId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me/career-history")
    public ResponseEntity<List<CareerHistoryResponseDTO>> getMyCareerHistory(
            @RequestHeader("Authorization") String token
    ) {
        return ResponseEntity.ok(candidateService.getMyCareerHistory(token));
    }

}


