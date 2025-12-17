package com.yousef.ignite.controller;

import com.yousef.ignite.dto.request.CandidateSkillRatingRequestDTO;
import com.yousef.ignite.dto.request.CandidateSkillsAddRequestDTO;
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
            @RequestParam(required = false) List<String> skills
    ) {
        return ResponseEntity.ok(
                candidateService.getAllCandidates(page, size, query, skills)
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
    public ResponseEntity<CandidateProfileResponseDTO> getCandidateById(@PathVariable Long candidateProfileId) {
        return new ResponseEntity<>(candidateService.getCandidateById(candidateProfileId), HttpStatus.OK);
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

    @GetMapping("/skills")
    public ResponseEntity<List<SkillResponseDTO>> getAllSkills() {
        return ResponseEntity.ok(candidateService.getAllSkills());
    }

    @PostMapping("/me/resume")
    public ResponseEntity<CandidateProfileResponseDTO> uploadResume(
            @RequestHeader("Authorization") String token,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(candidateService.uploadResume(token, file));
    }

}


