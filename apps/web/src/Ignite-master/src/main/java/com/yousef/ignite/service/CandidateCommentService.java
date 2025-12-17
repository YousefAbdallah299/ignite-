package com.yousef.ignite.service;

import com.yousef.ignite.dto.enums.RecruiterStatus;
import com.yousef.ignite.dto.enums.UserRole;
import com.yousef.ignite.dto.request.CreateCandidateCommentDTO;
import com.yousef.ignite.dto.response.CandidateCommentResponseDTO;
import com.yousef.ignite.entity.CandidateComment;
import com.yousef.ignite.entity.CandidateProfile;
import com.yousef.ignite.entity.RecruiterProfile;
import com.yousef.ignite.entity.User;
import com.yousef.ignite.exception.custom.ResourceNotFoundException;
import com.yousef.ignite.exception.custom.UnauthorizedAccessException;
import com.yousef.ignite.repository.CandidateCommentRepository;
import com.yousef.ignite.repository.CandidateProfileRepository;
import com.yousef.ignite.repository.RecruiterProfileRepository;
import com.yousef.ignite.repository.UserRepository;
import com.yousef.ignite.service.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CandidateCommentService {

    private final CandidateCommentRepository commentRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final UserRepository userRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final JwtUtils jwtUtils;

    private User getUserFromToken(String bearerToken) {
        String token = bearerToken.substring(7);
        String email = jwtUtils.getEmailFromJwtToken(token);
        return userRepository.findUserByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Transactional
    public CandidateCommentResponseDTO createComment(String bearerToken, CreateCandidateCommentDTO request) {
        User admin = getUserFromToken(bearerToken);
        
        // Only admins can create comments
        if (!admin.getRole().equals(UserRole.ADMIN)) {
            throw new UnauthorizedAccessException("Only admins can create comments");
        }

        CandidateProfile candidateProfile = candidateProfileRepository.findById(request.getCandidateProfileId())
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile not found"));

        CandidateComment comment = CandidateComment.builder()
                .candidateProfile(candidateProfile)
                .admin(admin)
                .content(request.getContent())
                .build();

        comment = commentRepository.save(comment);
        return toResponseDTO(comment);
    }

    public List<CandidateCommentResponseDTO> getComments(String bearerToken, Long candidateProfileId) {
        User user = getUserFromToken(bearerToken);
        CandidateProfile candidateProfile = candidateProfileRepository.findById(candidateProfileId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile not found"));

        // Check if user can view comments
        boolean canView = false;
        
        if (user.getRole().equals(UserRole.ADMIN)) {
            canView = true; // All admins can view
        } else if (user.getRole().equals(UserRole.RECRUITER)) {
            // Only subscribed recruiters can view
            RecruiterProfile recruiterProfile = recruiterProfileRepository.findByUser(user).orElse(null);
            if (recruiterProfile != null && recruiterProfile.getStatus().equals(RecruiterStatus.SUBSCRIBED)) {
                canView = true;
            }
        }

        if (!canView) {
            throw new UnauthorizedAccessException("You don't have permission to view comments");
        }

        List<CandidateComment> comments = commentRepository.findByCandidateProfileOrderByCreatedAtDesc(candidateProfile);
        return comments.stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    private CandidateCommentResponseDTO toResponseDTO(CandidateComment comment) {
        User admin = comment.getAdmin();
        return CandidateCommentResponseDTO.builder()
                .id(comment.getId())
                .candidateProfileId(comment.getCandidateProfile().getId())
                .adminId(admin.getId())
                .adminName(admin.getFirstName() + " " + admin.getLastName())
                .adminEmail(admin.getEmail())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}

