package com.yousef.ignite.service;

import com.yousef.ignite.dto.enums.RecruiterStatus;
import com.yousef.ignite.dto.enums.UserRole;
import com.yousef.ignite.dto.request.CandidateCommentRequestDTO;
import com.yousef.ignite.dto.request.CandidateSkillRatingRequestDTO;
import com.yousef.ignite.dto.request.CandidateSkillsAddRequestDTO;
import com.yousef.ignite.dto.request.UpdateCandidateProfileDTO;
import com.yousef.ignite.dto.response.CandidateCommentResponseDTO;
import com.yousef.ignite.dto.response.CandidateProfileResponseDTO;
import com.yousef.ignite.dto.response.PagedResponse;
import com.yousef.ignite.dto.response.SkillResponseDTO;
import com.yousef.ignite.entity.*;
import com.yousef.ignite.exception.custom.ResourceNotFoundException;
import com.yousef.ignite.exception.custom.UnauthorizedAccessException;
import com.yousef.ignite.repository.*;
import com.yousef.ignite.service.security.JwtUtils;
import com.yousef.ignite.util.FileUploadUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CandidateServiceImpl implements CandidateService {

    private final CandidateProfileRepository candidateProfileRepository;
    private final CandidateSkillRatingRepository candidateSkillRatingRepository;
    private final SkillRepository skillRepository;
    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;
    private final CandidateCommentRepository candidateCommentRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;

    private User getUserFromToken(String bearerToken) {
        String token = bearerToken.substring(7);
        String email = jwtUtils.getEmailFromJwtToken(token);
        return userRepository.findUserByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private CandidateProfileResponseDTO toResponse(CandidateProfile profile) {
        Map<String, Integer> skills = new HashMap<>();
        if (profile.getSkillRatings() != null) {
            for (CandidateSkillRating r : profile.getSkillRatings()) {
                skills.put(r.getSkill().getName(), r.getRating());
            }
        }
        String name = profile.getUser().getFirstName() + " " + profile.getUser().getLastName();
        return CandidateProfileResponseDTO.builder()
                .id(profile.getId())
                .userId(profile.getId())
                .name(name)
                .title(profile.getTitle())
                .summary(profile.getSummary())
                .resumeUrl(profile.getResumeUrl())
                .location(profile.getLocation())
                .createdAt(profile.getCreatedAt())
                .expectedSalary(profile.getExpectedSalary())
                .expectedPosition(profile.getExpectedPosition())
                .skills(skills)
                .build();
    }

    @Override
    public CandidateProfileResponseDTO getMyProfile(String bearerToken) {
        User me = getUserFromToken(bearerToken);
        CandidateProfile profile = candidateProfileRepository.findByUser(me).orElseThrow(() -> new ResourceNotFoundException("Profile not found"));
        return toResponse(profile);
    }

    @Override
    @Transactional
    public CandidateProfileResponseDTO updateMyProfile(String bearerToken, UpdateCandidateProfileDTO request) {
        User me = getUserFromToken(bearerToken);


        CandidateProfile profile = candidateProfileRepository.findByUser(me)
                .orElseGet(() -> CandidateProfile.builder().user(me).build());

        if (request.getTitle() != null) {
            profile.setTitle(request.getTitle());
        }
        if (request.getSummary() != null) {
            profile.setSummary(request.getSummary());
        }
        // Resume URL is no longer updated via this endpoint - use uploadResume instead
        if (request.getLocation() != null) {
            profile.setLocation(request.getLocation());
        }
        if (request.getExpectedSalary() != null) {
            profile.setExpectedSalary(request.getExpectedSalary());
        }
        if (request.getExpectedPosition() != null) {
            profile.setExpectedPosition(request.getExpectedPosition());
        }

        CandidateProfile saved = candidateProfileRepository.save(profile);

        return toResponse(saved);
    }



    @Override
    public CandidateProfileResponseDTO getCandidateById(Long candidateProfileId, String bearerToken) {
        CandidateProfile profile = candidateProfileRepository.findById(candidateProfileId).orElseThrow(() -> new ResourceNotFoundException("Candidate not found"));
        // Token is optional - profile can be viewed publicly, but comments require auth
        return toResponse(profile);
    }

    @Override
    public PagedResponse<CandidateProfileResponseDTO> getAllCandidates(
            int page, int size, String query, List<String> skills) {

        Pageable pageable = PageRequest.of(page, size);

        Page<CandidateProfile> candidatePage;

        if (query != null && !query.trim().isEmpty() && skills != null && !skills.isEmpty()) {
            // Skills + query filter, ordered
            candidatePage = candidateProfileRepository.findBySkillsAndQueryOrdered(skills, query, pageable);
        } else if (query != null && !query.trim().isEmpty()) {
            // Query only
            candidatePage = candidateProfileRepository
                    .findByTitleContainingIgnoreCaseOrSummaryContainingIgnoreCase(query, query, pageable);
        } else if (skills != null && !skills.isEmpty()) {
            // Skills only, ordered
            candidatePage = candidateProfileRepository.findBySkillsOrdered(skills, pageable);
        } else {
            // Default
            candidatePage = candidateProfileRepository.findAll(pageable);
        }

        return new PagedResponse<>(
                candidatePage.getContent().stream().map(this::toResponse).toList(),
                candidatePage.getNumber(),
                candidatePage.getSize(),
                candidatePage.getTotalElements(),
                candidatePage.getTotalPages(),
                candidatePage.isLast()
        );
    }

    @Transactional
    public CandidateProfileResponseDTO rateCandidateSkill(
            String token,
            Long candidateId,
            CandidateSkillRatingRequestDTO request
    ) {
        User user = getUserFromToken(token);
        if (user.getRole() != UserRole.ADMIN) {
            throw new UnauthorizedAccessException("Only admins can rate candidate skills");
        }

        CandidateProfile candidate = candidateProfileRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found"));

        Skill skill = skillRepository.findById(request.getSkillId())
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found"));

        // Find existing rating or create new
        CandidateSkillRating rating = candidateSkillRatingRepository
                .findByCandidateAndSkill(candidate, skill)
                .orElse(CandidateSkillRating.builder()
                        .candidate(candidate)
                        .skill(skill)
                        .build());

        rating.setRating(request.getRating());
        candidateSkillRatingRepository.save(rating);

        return toResponse(candidateProfileRepository.save(candidate));
    }


    @Override
    @Transactional
    public CandidateProfileResponseDTO addSkillsToMyProfile(String token, CandidateSkillsAddRequestDTO request) {
        User user = getUserFromToken(token);
        if (user.getRole() != UserRole.CANDIDATE) {
            throw new UnauthorizedAccessException("Only candidates can add their own skills");
        }

        CandidateProfile candidate = candidateProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile not found"));

        for (String skillName : request.getSkillNames()) {
            Skill skill = skillRepository.findByNameIgnoreCase(skillName.trim())
                    .orElseGet(() -> skillRepository.save(
                            Skill.builder().name(skillName.trim()).build()
                    ));

            boolean alreadyAdded = candidate.getSkillRatings().stream()
                    .anyMatch(r -> r.getSkill().getName().equalsIgnoreCase(skill.getName()));

            if (!alreadyAdded) {
                CandidateSkillRating rating = CandidateSkillRating.builder()
                        .candidate(candidate)
                        .skill(skill)
                        .rating(0) // no rating yet
                        .build();
                candidate.getSkillRatings().add(rating);
                candidateSkillRatingRepository.save(rating);
            }
        }

        return toResponse(candidateProfileRepository.save(candidate));
    }


    @Override
    public List<SkillResponseDTO> getAllSkills() {
        return skillRepository.findAll().stream()
                .map(skill -> new SkillResponseDTO(skill.getId(), skill.getName()))
                .toList();
    }

    @Override
    @Transactional
    public CandidateProfileResponseDTO uploadResume(String bearerToken, MultipartFile file) {
        User me = getUserFromToken(bearerToken);
        if (me.getRole() != UserRole.CANDIDATE) {
            throw new UnauthorizedAccessException("Only candidates can upload resumes");
        }

        CandidateProfile profile = candidateProfileRepository.findByUser(me)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile not found"));

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is required");
        }

        FileUploadUtil.validateResumeFile(file);

        String fileUrl = null;
        try {
            String uploadDir = "uploads/resumes/";
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();

            String fileName = FileUploadUtil.sanitizeFilename(file.getOriginalFilename());
            Path filePath = Path.of(uploadDir + fileName);

            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            fileUrl = "/uploads/resumes/" + fileName;
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload resume", e);
        }

        profile.setResumeUrl(fileUrl);
        CandidateProfile saved = candidateProfileRepository.save(profile);

        return toResponse(saved);
    }

    @Override
    @Transactional
    public CandidateCommentResponseDTO addComment(String bearerToken, Long candidateId, CandidateCommentRequestDTO request) {
        User me = getUserFromToken(bearerToken);
        if (me.getRole() != UserRole.ADMIN) {
            throw new UnauthorizedAccessException("Only admins can add comments");
        }

        CandidateProfile candidate = candidateProfileRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found"));

        CandidateComment comment = CandidateComment.builder()
                .candidateProfile(candidate)
                .adminUser(me)
                .comment(request.getComment())
                .build();

        CandidateComment saved = candidateCommentRepository.save(comment);

        return CandidateCommentResponseDTO.builder()
                .id(saved.getId())
                .comment(saved.getComment())
                .adminName(me.getFirstName() + " " + me.getLastName())
                .adminEmail(me.getEmail())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    @Override
    public List<CandidateCommentResponseDTO> getComments(Long candidateId, String bearerToken) {
        User me = getUserFromToken(bearerToken);
        
        // Only admins and subscribed recruiters can see comments
        boolean canView = false;
        if (me.getRole() == UserRole.ADMIN) {
            canView = true;
        } else if (me.getRole() == UserRole.RECRUITER) {
            RecruiterProfile recruiterProfile = recruiterProfileRepository.findByUserId(me.getId())
                    .orElse(null);
            if (recruiterProfile != null && recruiterProfile.getStatus() == RecruiterStatus.SUBSCRIBED) {
                canView = true;
            }
        }

        if (!canView) {
            throw new UnauthorizedAccessException("You don't have permission to view comments");
        }

        CandidateProfile candidate = candidateProfileRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found"));

        List<CandidateComment> comments = candidateCommentRepository.findByCandidateProfileOrderByCreatedAtDesc(candidate);

        return comments.stream()
                .map(comment -> CandidateCommentResponseDTO.builder()
                        .id(comment.getId())
                        .comment(comment.getComment())
                        .adminName(comment.getAdminUser().getFirstName() + " " + comment.getAdminUser().getLastName())
                        .adminEmail(comment.getAdminUser().getEmail())
                        .createdAt(comment.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }




}


