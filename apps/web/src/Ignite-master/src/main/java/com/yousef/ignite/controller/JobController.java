package com.yousef.ignite.controller;

import com.yousef.ignite.dto.request.JobRequestDTO;
import com.yousef.ignite.dto.response.JobResponseDTO;
import com.yousef.ignite.dto.response.PagedResponse;
import com.yousef.ignite.service.JobService;
import com.yousef.ignite.dto.response.JobApplicationResponseDTO;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/jobs")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
@Validated
@Tag(name = "Jobs", description = "Endpoints for jobs management.")
public class JobController {

    private final JobService jobService;

    @GetMapping
    public PagedResponse<JobResponseDTO> getAllJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) List<String> categories
    ) {
        return jobService.getAllJobs(page, size, query, categories);
    }


    @PostMapping
    public ResponseEntity<JobResponseDTO> createJob(
            @RequestHeader("Authorization") String token,
            @RequestBody JobRequestDTO dto) {
        return ResponseEntity.ok(jobService.createJob(token, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id) {
        jobService.deleteJob(token, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/apply")
    public ResponseEntity<Void> applyForJob(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id) {
        jobService.applyForJob(token, id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelJobApplication(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id) {
        jobService.cancelJobApplication(token, id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<PagedResponse<JobResponseDTO>> getAppliedJobs(
            @RequestHeader("Authorization") String token,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(
                jobService.getAppliedJobs(token, page, size)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobResponseDTO> getJobById(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.getJobById(id));
    }

    @GetMapping("/my-jobs")
    public ResponseEntity<PagedResponse<JobResponseDTO>> getMyJobs(
            @RequestHeader("Authorization") String token,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(jobService.getMyJobs(token, page, size));
    }

    @GetMapping("/{id}/applications")
    public ResponseEntity<List<JobApplicationResponseDTO>> getJobApplications(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(jobService.getJobApplications(token, id));
    }







}




















