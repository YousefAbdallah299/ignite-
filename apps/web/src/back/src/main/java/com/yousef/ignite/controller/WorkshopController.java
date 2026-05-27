package com.yousef.ignite.controller;

import com.yousef.ignite.dto.request.WorkshopInvitationRequestDTO;
import com.yousef.ignite.service.WorkshopService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/workshops")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
@Tag(name = "Workshops")
public class WorkshopController {

    private final WorkshopService workshopService;

    @PostMapping("/invite")
    public ResponseEntity<String> inviteToWorkshop(@RequestBody WorkshopInvitationRequestDTO request) {
        workshopService.inviteToWorkshop(request);
        return new ResponseEntity<>("Invitation email sent successfully", HttpStatus.OK);
    }
}
