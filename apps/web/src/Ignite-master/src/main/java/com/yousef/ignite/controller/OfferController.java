package com.yousef.ignite.controller;

import com.yousef.ignite.dto.enums.OfferStatus;
import com.yousef.ignite.dto.request.SendOfferDTO;
import com.yousef.ignite.dto.response.OfferResponseDTO;
import com.yousef.ignite.service.OfferService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/offers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
@Tag(name = "Offers")
public class OfferController {

    private final OfferService offerService;

    // Recruiter sends an offer to a candidate
    @PostMapping
    public ResponseEntity<OfferResponseDTO> sendOffer(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody SendOfferDTO req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(offerService.sendOffer(token, req));
    }

    // Candidate or recruiter views their offers
    @GetMapping("/me")
    public ResponseEntity<List<OfferResponseDTO>> listMyOffers(
            @RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(offerService.listMyOffers(token));
    }

    // Admin views all offers
    @GetMapping
    public ResponseEntity<List<OfferResponseDTO>> getAllOffers(
            @RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(offerService.listAllOffers(token));
    }

    // Candidate responds to an offer
    @PostMapping("/{offerId}/respond")
    public ResponseEntity<OfferResponseDTO> respondToOffer(
            @RequestHeader("Authorization") String token,
            @PathVariable Long offerId,
            @RequestParam OfferStatus status) {
        return ResponseEntity.ok(offerService.respondToOffer(token, offerId, status));
    }

    // Recruiter withdraws an offer
    @PostMapping("/{offerId}/withdraw")
    public ResponseEntity<OfferResponseDTO> withdrawOffer(
            @RequestHeader("Authorization") String token,
            @PathVariable Long offerId) {
        return ResponseEntity.ok(offerService.withdrawOffer(token, offerId));
    }
}
