package com.yousef.ignite.controller;

import com.yousef.ignite.dto.request.UpdateRecruiterProfileRequestDTO;
import com.yousef.ignite.dto.response.RecruiterProfileResponseDTO;
import com.yousef.ignite.service.RecruiterProfileService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/recruiters")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
@Tag(name = "Recruiters")
public class RecruiterProfileController {

    private final RecruiterProfileService recruiterProfileService;

    @GetMapping("/me")
    public ResponseEntity<RecruiterProfileResponseDTO> getMyProfile(@RequestHeader("Authorization") String token) {
        return new ResponseEntity<>(recruiterProfileService.getMyProfile(token), HttpStatus.OK);
    }

    @PutMapping("/me")
    public ResponseEntity<RecruiterProfileResponseDTO> updateMyProfile(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody UpdateRecruiterProfileRequestDTO request
    ) {
        return ResponseEntity.ok(recruiterProfileService.updateMyProfile(token, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecruiterProfileResponseDTO> getRecruiterById(@RequestHeader("Authorization") String token,
                                                                        @PathVariable Long id) {
        return new ResponseEntity<>(recruiterProfileService.getRecruiterById(token, id), HttpStatus.OK);
    }

    // Admin: get recruiter profile by the underlying user id
    @GetMapping("/user/{userId}")
    public ResponseEntity<RecruiterProfileResponseDTO> getRecruiterByUserId(
            @RequestHeader("Authorization") String token,
            @PathVariable Long userId
    ) {
        return new ResponseEntity<>(recruiterProfileService.getRecruiterByUserId(token, userId), HttpStatus.OK);
    }



}
