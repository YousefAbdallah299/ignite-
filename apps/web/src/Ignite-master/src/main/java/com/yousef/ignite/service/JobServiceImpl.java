package com.yousef.ignite.service;

import com.yousef.ignite.dto.enums.RecruiterStatus;
import com.yousef.ignite.dto.enums.UserRole;
import com.yousef.ignite.dto.request.JobRequestDTO;
import com.yousef.ignite.dto.response.CandidateProfileResponseDTO;
import com.yousef.ignite.dto.response.CourseResponseDTO;
import com.yousef.ignite.dto.response.JobResponseDTO;
import com.yousef.ignite.dto.response.PagedResponse;
import com.yousef.ignite.entity.*;
import com.yousef.ignite.exception.custom.JobApplicationAlreadyExists;
import com.yousef.ignite.exception.custom.ResourceNotFoundException;
import com.yousef.ignite.exception.custom.UnauthorizedAccessException;
import com.yousef.ignite.repository.*;
import com.yousef.ignite.service.security.JwtUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import com.yousef.ignite.dto.response.JobApplicationResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobServiceImpl implements JobService {
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;
    private final CategoryRepository categoryRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final CandidateProfileRepository  candidateProfileRepository;
    private final CandidateAppliedJobRepository candidateAppliedJobRepository;

    @Override
    public PagedResponse<JobResponseDTO> getAllJobs(
            int page, int size, String query, List<String> categories) {

        Pageable pageable = PageRequest.of(page, size);

        Page<Job> jobPage;

        if (query != null && !query.trim().isEmpty() && categories != null && !categories.isEmpty()) {
            // Skills + query filter, ordered
            jobPage = jobRepository.findByCategoriesAndQueryOrdered(categories, query, pageable);
        } else if (query != null && !query.trim().isEmpty()) {
            // Query only
            jobPage = jobRepository
                    .findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(query, query, pageable);
        } else if (categories != null && !categories.isEmpty()) {
            // Skills only, ordered
            jobPage = jobRepository.findByCategoriesOrdered(categories, pageable);
        } else {
            // Default
            jobPage = jobRepository.findAll(pageable);
        }


        return new PagedResponse<>(
                jobPage.getContent().stream().map(this::mapToDTO).toList(),
                jobPage.getNumber(),
                jobPage.getSize(),
                jobPage.getTotalElements(),
                jobPage.getTotalPages(),
                jobPage.isLast()
        );

    }



    @Transactional
    @Override
    public JobResponseDTO createJob(String token, JobRequestDTO dto) {
        String email = jwtUtils.getEmailFromJwtToken(token.substring(7));

        User user = userRepository.findUserByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        RecruiterProfile recruiterProfile = authorizeJobCreation(user);

        Set<Category> categoryEntities = mapCategoryNamesToEntities(dto.getCategories());

        Job job = Job.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .location(dto.getLocation())
                .categories(categoryEntities)
                .salary(dto.getSalary())
                .employmentType(dto.getEmploymentType())
                .currency(dto.getCurrency())
                .postedBy(recruiterProfile)
                .appliedCandidates(new HashSet<>())
                .createdAt(LocalDateTime.now())
                .build();

        Job saved = jobRepository.save(job);
        return mapToDTO(saved);
    }

    @Override
    public PagedResponse<JobResponseDTO> getMyJobs(String token, int page, int size) {
        String email = jwtUtils.getEmailFromJwtToken(token.substring(7));
        User user = userRepository.findUserByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.getRole().equals(UserRole.RECRUITER)) {
            throw new UnauthorizedAccessException("Only recruiters can view their jobs");
        }

        RecruiterProfile recruiterProfile = recruiterProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter profile not found"));

        Pageable pageable = PageRequest.of(page, size);
        Page<Job> jobPage = jobRepository.findJobsByRecruiterId(recruiterProfile.getId(), pageable);

        return new PagedResponse<>(
                jobPage.getContent().stream().map(this::mapToDTO).toList(),
                jobPage.getNumber(),
                jobPage.getSize(),
                jobPage.getTotalElements(),
                jobPage.getTotalPages(),
                jobPage.isLast()
        );
    }

    @Override
    public List<JobApplicationResponseDTO> getJobApplications(String token, Long jobId) {
        String email = jwtUtils.getEmailFromJwtToken(token.substring(7));
        User user = userRepository.findUserByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.getRole().equals(UserRole.RECRUITER)) {
            throw new UnauthorizedAccessException("Only recruiters can view job applications");
        }

        RecruiterProfile recruiterProfile = recruiterProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter profile not found"));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        // Verify the job belongs to this recruiter
        if (!job.getPostedBy().getId().equals(recruiterProfile.getId())) {
            throw new UnauthorizedAccessException("You can only view applications for your own jobs");
        }

        List<CandidateAppliedJob> applications = candidateAppliedJobRepository.findByJob(job);

        return applications.stream()
                .map(this::mapToJobApplicationDTO)
                .toList();
    }



    @Transactional
    @Override
    public void deleteJob(String token, Long jobId) {
        token = token.substring(7);
        String email = jwtUtils.getEmailFromJwtToken(token);
        User user = userRepository.findUserByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (job.getPostedBy().getUser().getId().equals(user.getId()) || user.getRole().equals(UserRole.ADMIN)) {

            // ✅ Remove job from candidate profiles that applied
            Set<CandidateAppliedJob> applicants = new HashSet<>(job.getAppliedCandidates());
            candidateAppliedJobRepository.deleteAll(applicants);

            // ✅ Clear categories
            job.getCategories().clear();
            job.getAppliedCandidates().clear();


            // ✅ Delete job
            jobRepository.delete(job);

        } else {
            throw new UnauthorizedAccessException("You are not authorized to delete this job");
        }
    }


    @Transactional
    @Override
    public void applyForJob(String token, Long jobId) {
        String email = jwtUtils.getEmailFromJwtToken(token.substring(7));
        User user = userRepository.findUserByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.getRole().equals(UserRole.CANDIDATE)) {
            throw new UnauthorizedAccessException("Only candidates can apply for jobs");
        }

        CandidateProfile candidate = candidateProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile not found"));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        // Prevent duplicate application
        if (candidateAppliedJobRepository.existsByCandidateAndJob(candidate, job)) {
            throw new JobApplicationAlreadyExists("You have already applied for this job");
        }

        CandidateAppliedJob application = CandidateAppliedJob.builder()
                .candidate(candidate)
                .job(job)
                .createdAt(LocalDateTime.now())
                .build();

        candidateAppliedJobRepository.save(application);

        // Optional: keep in-memory collections consistent if you still have them
        // candidate.getApplications().add(application);
        // job.getApplications().add(application);
    }


    @Transactional
    @Override
    public void cancelJobApplication(String token, Long jobId) {
        String email = jwtUtils.getEmailFromJwtToken(token.substring(7));
        User user = userRepository.findUserByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.getRole().equals(UserRole.CANDIDATE)) {
            throw new UnauthorizedAccessException("Only candidates can cancel job applications");
        }

        CandidateProfile candidate = candidateProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile not found"));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        CandidateAppliedJob application = candidateAppliedJobRepository
                .findByCandidateAndJob(candidate, job)
                .orElseThrow(() -> new ResourceNotFoundException("You have not applied for this job"));

        candidateAppliedJobRepository.delete(application);

        // Optional: keep in-memory collections consistent if you still have them
        // candidate.getApplications().remove(application);
        // job.getApplications().remove(application);
    }


    @Override
    public PagedResponse<JobResponseDTO> getAppliedJobs(String token, int page, int size) {
        String email = jwtUtils.getEmailFromJwtToken(token.substring(7));
        User user = userRepository.findUserByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.getRole().equals(UserRole.CANDIDATE)) {
            throw new UnauthorizedAccessException("Only candidates can view applied jobs");
        }

        CandidateProfile candidate = candidateProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile not found"));

        Pageable pageable = PageRequest.of(page, size);
        Page<Job> jobPage = jobRepository.findAppliedJobsByCandidateId(candidate.getId(), pageable);

        List<JobResponseDTO> jobDtos = jobPage.getContent()
                .stream()
                .map(this::mapToDTO)
                .toList();

        return new PagedResponse<>(
                jobDtos,
                jobPage.getNumber(),
                jobPage.getSize(),
                jobPage.getTotalElements(),
                jobPage.getTotalPages(),
                jobPage.isLast()
        );
    }


    @Override
    public JobResponseDTO getJobById(Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + id));
        return mapToDTO(job);
    }




    private RecruiterProfile authorizeJobCreation(User user) {
        if (user.getRole() == UserRole.RECRUITER) {
            RecruiterProfile profile = recruiterProfileRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Recruiter profile not found"));

            if (profile.getStatus() != RecruiterStatus.SUBSCRIBED) {
                throw new UnauthorizedAccessException("Guest recruiters cannot create jobs. Please subscribe.");
            }
            return profile;
        }

        throw new UnauthorizedAccessException("Only recruiters can create jobs");
    }



    private Set<Category> mapCategoryNamesToEntities(Set<String> categoryNames) {
        return categoryNames.stream()
                .map(name -> categoryRepository.findByName(name)
                        .orElseGet(() -> categoryRepository.save(
                                Category.builder().name(name).build()
                        )))
                .collect(Collectors.toSet());
    }




    private JobResponseDTO mapToDTO(Job job) {
        return JobResponseDTO.builder()
                .id(job.getId())
                .title(job.getTitle())
                .description(job.getDescription())
                .salary(job.getSalary())
                .location(job.getLocation())
                .employmentType(job.getEmploymentType())
                .applicationCount(job.getAppliedCandidates().size())
                .createdAt(job.getCreatedAt())
                .categories(
                        job.getCategories().stream()
                                .map(Category::getName)
                                .collect(Collectors.toSet())
                )
                .build();
    }

    private JobApplicationResponseDTO mapToJobApplicationDTO(CandidateAppliedJob application) {
        CandidateProfile candidate = application.getCandidate();
        User user = candidate.getUser();

        return JobApplicationResponseDTO.builder()
                .id(application.getId())
                .candidateId(candidate.getId())
                .candidateName(user.getFirstName() + " " + user.getLastName())
                .candidateEmail(user.getEmail())
                .candidatePhone(user.getPhoneNumber())
                .candidateTitle(candidate.getTitle())
                .candidateLocation(candidate.getLocation())
                .candidateSummary(candidate.getSummary())
                .resumeFilePath(candidate.getResumeFilePath())
                .appliedAt(application.getCreatedAt())
                .build();
    }


}
