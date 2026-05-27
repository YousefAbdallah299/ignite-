package com.yousef.ignite.service;

import com.yousef.ignite.dto.enums.RecruiterStatus;
import com.yousef.ignite.dto.enums.UserRole;
import com.yousef.ignite.dto.request.CandidateCommentRequestDTO;
import com.yousef.ignite.dto.request.CandidateSkillRatingRequestDTO;
import com.yousef.ignite.dto.request.CandidateSkillsAddRequestDTO;
import com.yousef.ignite.dto.request.UpdateCandidateProfileDTO;
import com.yousef.ignite.dto.request.CareerHistoryRequestDTO;
import com.yousef.ignite.dto.response.CandidateCommentResponseDTO;
import com.yousef.ignite.dto.response.CandidateProfileResponseDTO;
import com.yousef.ignite.dto.response.PagedResponse;
import com.yousef.ignite.dto.response.SkillResponseDTO;
import com.yousef.ignite.dto.response.CareerHistoryResponseDTO;
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
    private final CareerHistoryRepository careerHistoryRepository;

    private User getUserFromToken(String bearerToken) {
        String token = bearerToken.substring(7);
        String email = jwtUtils.getEmailFromJwtToken(token);
        return userRepository.findUserByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private CandidateProfileResponseDTO toResponse(CandidateProfile profile) {
        return toResponse(profile, null, false);
    }

    private CandidateProfileResponseDTO toResponse(CandidateProfile profile, User viewer, boolean hideResume) {
        Map<String, Integer> skills = new HashMap<>();
        if (profile.getSkillRatings() != null) {
            for (CandidateSkillRating r : profile.getSkillRatings()) {
                skills.put(r.getSkill().getName(), r.getRating());
            }
        }
        String name = profile.getUser().getFirstName() + " " + profile.getUser().getLastName();

        // Only admins (including custom admins) can see email/phone.
        boolean isAdminViewer = viewer != null && viewer.getRole() == UserRole.ADMIN;

        // Hide resume URL if viewer is a recruiter (not admin and not the candidate themselves)
        String resumeUrl = profile.getResumeUrl();
        if (hideResume || (viewer != null && viewer.getRole() == UserRole.RECRUITER &&
                !viewer.getRole().equals(UserRole.ADMIN) &&
                !viewer.getId().equals(profile.getUser().getId()))) {
            resumeUrl = null;
        }

        return CandidateProfileResponseDTO.builder()
                .id(profile.getId())
                .userId(profile.getUser().getId())
                .name(name)
                .title(profile.getTitle())
                .summary(profile.getSummary())
                .resumeUrl(resumeUrl)
                .email(isAdminViewer ? profile.getUser().getEmail() : null)
                .phoneNumber(isAdminViewer ? profile.getUser().getPhoneNumber() : null)
                .location(profile.getLocation())
                .createdAt(profile.getCreatedAt())
                .expectedSalary(profile.getExpectedSalary())
                .expectedSalaryCurrency(profile.getExpectedSalaryCurrency() != null
                        ? profile.getExpectedSalaryCurrency()
                        : "EGP") // Default to EGP if not set
                .expectedPosition(profile.getExpectedPosition())
                .currentPosition(profile.getCurrentPosition())
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
        if (request.getExpectedSalaryCurrency() != null) {
            profile.setExpectedSalaryCurrency(request.getExpectedSalaryCurrency());
        }
        if (request.getExpectedPosition() != null) {
            profile.setExpectedPosition(request.getExpectedPosition());
        }
        if (request.getCurrentPosition() != null) {
            profile.setCurrentPosition(request.getCurrentPosition());
        }

        CandidateProfile saved = candidateProfileRepository.save(profile);

        return toResponse(saved);
    }



    @Override
    public CandidateProfileResponseDTO getCandidateById(Long candidateProfileId, String bearerToken) {
        CandidateProfile profile = candidateProfileRepository.findById(candidateProfileId).orElseThrow(() -> new ResourceNotFoundException("Candidate not found"));

        // Check if viewer is recruiter (not admin and not the candidate themselves)
        User viewer = null;
        boolean hideResume = false;
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            try {
                viewer = getUserFromToken(bearerToken);
                // Hide resume if viewer is recruiter (not admin) and not the candidate themselves
                if (viewer.getRole() == UserRole.RECRUITER &&
                        !viewer.getId().equals(profile.getUser().getId())) {
                    hideResume = true;
                }
                // Admins and the candidate themselves can always see the resume
            } catch (Exception e) {
                // Token invalid or user not found - treat as anonymous viewer, hide resume
                hideResume = true;
            }
        } else {
            // No token - anonymous viewer, hide resume
            hideResume = true;
        }

        return toResponse(profile, viewer, hideResume);
    }

    @Override
    public CandidateProfileResponseDTO getCandidateByUserId(Long userId, String bearerToken) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        CandidateProfile profile = candidateProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile not found for this user"));

        // Check if viewer is recruiter (not admin and not the candidate themselves)
        User viewer = null;
        boolean hideResume = false;
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            try {
                viewer = getUserFromToken(bearerToken);
                // Hide resume if viewer is recruiter (not admin) and not the candidate themselves
                if (viewer.getRole() == UserRole.RECRUITER &&
                        !viewer.getId().equals(profile.getUser().getId())) {
                    hideResume = true;
                }
                // Admins and the candidate themselves can always see the resume
            } catch (Exception e) {
                // Token invalid or user not found - treat as anonymous viewer, hide resume
                hideResume = true;
            }
        } else {
            // No token - anonymous viewer, hide resume
            hideResume = true;
        }

        return toResponse(profile, viewer, hideResume);
    }

    @Override
    public PagedResponse<CandidateProfileResponseDTO> getAllCandidates(
            int page, int size, String query, List<String> skills, String bearerToken) {

        Pageable pageable = PageRequest.of(page, size);

        // Check if viewer is recruiter
        User viewer = null;
        boolean hideResume = false;
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            try {
                viewer = getUserFromToken(bearerToken);
                // Hide resume if viewer is recruiter (not admin)
                if (viewer.getRole() == UserRole.RECRUITER) {
                    hideResume = true;
                }
                // Admins can always see resumes
            } catch (Exception e) {
                // Token invalid - treat as anonymous, hide resume
                hideResume = true;
            }
        } else {
            // No token - anonymous viewer, hide resume
            hideResume = true;
        }

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

        User finalViewer = viewer;
        boolean finalHideResume = hideResume;
        return new PagedResponse<>(
                candidatePage.getContent().stream()
                        .map(profile -> {
                            // Check if this is the candidate's own profile
                            boolean isOwnProfile = finalViewer != null && finalViewer.getId().equals(profile.getUser().getId());
                            // Hide resume if hideResume is true and it's not the candidate's own profile
                            boolean shouldHideResume = finalHideResume && !isOwnProfile;
                            return toResponse(profile, finalViewer, shouldHideResume);
                        })
                        .toList(),
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
    @Transactional
    public CandidateProfileResponseDTO removeSkillsFromMyProfile(String token, CandidateSkillsAddRequestDTO request) {
        User user = getUserFromToken(token);
        if (user.getRole() != UserRole.CANDIDATE) {
            throw new UnauthorizedAccessException("Only candidates can remove their own skills");
        }

        CandidateProfile candidate = candidateProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile not found"));

        for (String skillName : request.getSkillNames()) {
            Skill skill = skillRepository.findByNameIgnoreCase(skillName.trim())
                    .orElse(null);

            if (skill != null) {
                candidate.getSkillRatings().stream()
                        .filter(r -> r.getSkill().getName().equalsIgnoreCase(skill.getName()))
                        .findFirst()
                        .ifPresent(rating -> {
                            candidate.getSkillRatings().remove(rating);
                            candidateSkillRatingRepository.delete(rating);
                        });
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

    @Override
    @Transactional
    public CareerHistoryResponseDTO addCareerHistory(String bearerToken, CareerHistoryRequestDTO request) {
        User user = getUserFromToken(bearerToken);
        if (user.getRole() != UserRole.CANDIDATE) {
            throw new UnauthorizedAccessException("Only candidates can add career history");
        }

        CandidateProfile candidate = candidateProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile not found"));

        CareerHistory careerHistory = CareerHistory.builder()
                .candidate(candidate)
                .companyName(request.getCompanyName())
                .position(request.getPosition())
                .description(request.getDescription())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .location(request.getLocation())
                .build();

        CareerHistory saved = careerHistoryRepository.save(careerHistory);

        return CareerHistoryResponseDTO.builder()
                .id(saved.getId())
                .companyName(saved.getCompanyName())
                .position(saved.getPosition())
                .description(saved.getDescription())
                .startDate(saved.getStartDate())
                .endDate(saved.getEndDate())
                .location(saved.getLocation())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    public CareerHistoryResponseDTO updateCareerHistory(String bearerToken, Long careerHistoryId, CareerHistoryRequestDTO request) {
        User user = getUserFromToken(bearerToken);
        if (user.getRole() != UserRole.CANDIDATE) {
            throw new UnauthorizedAccessException("Only candidates can update career history");
        }

        CandidateProfile candidate = candidateProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile not found"));

        CareerHistory careerHistory = careerHistoryRepository.findById(careerHistoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Career history not found"));

        // Verify ownership
        if (!careerHistory.getCandidate().getId().equals(candidate.getId())) {
            throw new UnauthorizedAccessException("You can only update your own career history");
        }

        careerHistory.setCompanyName(request.getCompanyName());
        careerHistory.setPosition(request.getPosition());
        careerHistory.setDescription(request.getDescription());
        careerHistory.setStartDate(request.getStartDate());
        careerHistory.setEndDate(request.getEndDate());
        careerHistory.setLocation(request.getLocation());

        CareerHistory saved = careerHistoryRepository.save(careerHistory);

        return CareerHistoryResponseDTO.builder()
                .id(saved.getId())
                .companyName(saved.getCompanyName())
                .position(saved.getPosition())
                .description(saved.getDescription())
                .startDate(saved.getStartDate())
                .endDate(saved.getEndDate())
                .location(saved.getLocation())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    public void deleteCareerHistory(String bearerToken, Long careerHistoryId) {
        User user = getUserFromToken(bearerToken);
        if (user.getRole() != UserRole.CANDIDATE) {
            throw new UnauthorizedAccessException("Only candidates can delete career history");
        }

        CandidateProfile candidate = candidateProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile not found"));

        CareerHistory careerHistory = careerHistoryRepository.findById(careerHistoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Career history not found"));

        // Verify ownership
        if (!careerHistory.getCandidate().getId().equals(candidate.getId())) {
            throw new UnauthorizedAccessException("You can only delete your own career history");
        }

        careerHistoryRepository.delete(careerHistory);
    }

    @Override
    public List<CareerHistoryResponseDTO> getMyCareerHistory(String bearerToken) {
        User user = getUserFromToken(bearerToken);
        if (user.getRole() != UserRole.CANDIDATE) {
            throw new UnauthorizedAccessException("Only candidates can view their career history");
        }

        CandidateProfile candidate = candidateProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile not found"));

        // Get career history ordered by start date descending (latest first)
        List<CareerHistory> careerHistoryList = careerHistoryRepository.findByCandidateOrderByStartDateDesc(candidate);

        return careerHistoryList.stream()
                .map(ch -> CareerHistoryResponseDTO.builder()
                        .id(ch.getId())
                        .companyName(ch.getCompanyName())
                        .position(ch.getPosition())
                        .description(ch.getDescription())
                        .startDate(ch.getStartDate())
                        .endDate(ch.getEndDate())
                        .location(ch.getLocation())
                        .createdAt(ch.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

}


