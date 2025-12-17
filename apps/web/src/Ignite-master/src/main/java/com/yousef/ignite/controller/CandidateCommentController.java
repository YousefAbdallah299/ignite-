package com.yousef.ignite.controller;

import com.yousef.ignite.dto.request.CreateCandidateCommentDTO;
import com.yousef.ignite.dto.response.CandidateCommentResponseDTO;
import com.yousef.ignite.service.CandidateCommentService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/candidates/comments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
@Tag(name = "Candidate Comments")
public class CandidateCommentController {

    private final CandidateCommentService commentService;

    @PostMapping
    public ResponseEntity<CandidateCommentResponseDTO> createComment(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody CreateCandidateCommentDTO request) {
        return ResponseEntity.ok(commentService.createComment(token, request));
    }

    @GetMapping("/{candidateProfileId}")
    public ResponseEntity<List<CandidateCommentResponseDTO>> getComments(
            @RequestHeader("Authorization") String token,
            @PathVariable Long candidateProfileId) {
        return ResponseEntity.ok(commentService.getComments(token, candidateProfileId));
    }
}

