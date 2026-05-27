package com.yousef.ignite.service;

import com.yousef.ignite.dto.request.JobRequestDTO;
import com.yousef.ignite.dto.response.JobResponseDTO;
import com.yousef.ignite.dto.response.PagedResponse;
import com.yousef.ignite.dto.response.JobApplicationResponseDTO;

import java.util.List;

public interface JobService {
    PagedResponse<JobResponseDTO> getAllJobs(
            int page, int size, String query, List<String> categories);
    JobResponseDTO createJob(String token, JobRequestDTO dto);
    void deleteJob(String token, Long jobId);
    void applyForJob(String token, Long jobId);
    void cancelJobApplication(String token, Long jobId);
    PagedResponse<JobResponseDTO> getAppliedJobs(String token, int page, int size);
    JobResponseDTO getJobById(Long id);
    PagedResponse<JobResponseDTO> getMyJobs(String token, int page, int size);
    List<JobApplicationResponseDTO> getJobApplications(String token, Long jobId);

}
