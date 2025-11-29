package com.yousef.ignite.service;

import com.yousef.ignite.dto.enums.UserRole;
import com.yousef.ignite.dto.request.CandidateSkillRatingRequestDTO;
import com.yousef.ignite.dto.request.CandidateSkillsAddRequestDTO;
import com.yousef.ignite.dto.request.UpdateCandidateProfileDTO;
import com.yousef.ignite.dto.response.CandidateProfileResponseDTO;
import com.yousef.ignite.dto.response.PagedResponse;
import com.yousef.ignite.dto.response.SkillResponseDTO;
import com.yousef.ignite.entity.*;
import com.yousef.ignite.exception.custom.ResourceNotFoundException;
import com.yousef.ignite.exception.custom.UnauthorizedAccessException;
import com.yousef.ignite.repository.*;
import com.yousef.ignite.service.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CandidateServiceImpl implements CandidateService {

    private final CandidateProfileRepository candidateProfileRepository;
    private final CandidateSkillRatingRepository candidateSkillRatingRepository;
    private final SkillRepository skillRepository;
    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;

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
        if (request.getResumeUrl() != null) {
            profile.setResumeUrl(request.getResumeUrl());
        }
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
    public CandidateProfileResponseDTO getCandidateById(Long candidateProfileId) {
        CandidateProfile profile = candidateProfileRepository.findById(candidateProfileId).orElseThrow(() -> new ResourceNotFoundException("Candidate not found"));
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




}


