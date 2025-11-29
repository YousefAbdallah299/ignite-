package com.yousef.ignite.service;

import com.yousef.ignite.dto.enums.OfferStatus;
import com.yousef.ignite.dto.enums.UserRole;
import com.yousef.ignite.dto.request.SendOfferDTO;
import com.yousef.ignite.dto.response.OfferResponseDTO;
import com.yousef.ignite.entity.CandidateProfile;
import com.yousef.ignite.entity.Offer;
import com.yousef.ignite.entity.RecruiterProfile;
import com.yousef.ignite.entity.User;
import com.yousef.ignite.exception.custom.ResourceNotFoundException;
import com.yousef.ignite.exception.custom.UnauthorizedAccessException;
import com.yousef.ignite.repository.CandidateProfileRepository;
import com.yousef.ignite.repository.OfferRepository;
import com.yousef.ignite.repository.RecruiterProfileRepository;
import com.yousef.ignite.repository.UserRepository;
import com.yousef.ignite.service.security.JwtUtils;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OfferServiceImpl implements OfferService {

    private final OfferRepository offerRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final EmailService emailService;

    private User getUser(String bearerToken) {
        String token = bearerToken.substring(7);
        String email = jwtUtils.getEmailFromJwtToken(token);
        return userRepository.findUserByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private OfferResponseDTO toResponse(Offer o) {
        return OfferResponseDTO.builder()
                .id(o.getId())
                .status(o.getStatus())
                .title(o.getTitle())
                .salary(o.getSalary())
                .currency(o.getCurrency())
                .createdAt(o.getCreatedAt())
                .build();
    }


    @Override
    @Transactional
    public OfferResponseDTO sendOffer(String bearerToken, SendOfferDTO request) {
        User recruiterUser = getUser(bearerToken);

        if (recruiterUser.getRole() != UserRole.RECRUITER) {
            throw new UnauthorizedAccessException("Only recruiters can send offers");
        }

        RecruiterProfile recruiterProfile = recruiterProfileRepository.findByUser(recruiterUser)
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter profile not found"));

        CandidateProfile candidate = candidateProfileRepository.findById(request.getCandidateProfileId())
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found"));

        Offer offer = Offer.builder()
                .candidate(candidate)
                .recruiter(recruiterProfile)
                .salary(request.getSalary())
                .status(OfferStatus.PENDING)
                .title(request.getTitle())
                .currency(request.getCurrency())
                .createdAt(LocalDateTime.now())
                .build();

        offer = offerRepository.save(offer);

//        emailService.sendOfferSentEmail(candidate, offer);
        return toResponse(offer);
    }

    @Override
    public List<OfferResponseDTO> listAllOffers(String bearerToken) {
        User user = getUser(bearerToken);

        if (user.getRole() == UserRole.ADMIN) {
            return offerRepository.findAll().stream().map(this::toResponse).toList();
        }

        throw new UnauthorizedAccessException("Only admins can view all offers");
    }

    @Override
    public List<OfferResponseDTO> listMyOffers(String bearerToken) {
        User user = getUser(bearerToken);

        if (user.getRole() == UserRole.RECRUITER) {
            RecruiterProfile recruiterProfile = recruiterProfileRepository.findByUser(user)
                    .orElseThrow(() -> new ResourceNotFoundException("Recruiter profile not found"));
            return offerRepository.findAllByRecruiter(recruiterProfile)
                    .stream().map(this::toResponse).toList();
        }

        if (user.getRole() == UserRole.CANDIDATE) {
            CandidateProfile profile = candidateProfileRepository.findByUser(user)
                    .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));
            return offerRepository.findAllByCandidate(profile)
                    .stream().map(this::toResponse).toList();
        }

        throw new UnauthorizedAccessException("Only recruiters or candidates can view their offers");
    }

    @Override
    @Transactional
    public OfferResponseDTO withdrawOffer(String bearerToken, Long offerId) {
        User recruiterUser = getUser(bearerToken);

        if (recruiterUser.getRole() != UserRole.RECRUITER) {
            throw new UnauthorizedAccessException("Only recruiters can withdraw offers");
        }

        RecruiterProfile recruiterProfile = recruiterProfileRepository.findByUser(recruiterUser)
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter profile not found"));

        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new ResourceNotFoundException("Offer not found"));

        if (!offer.getRecruiter().getId().equals(recruiterProfile.getId())) {
            throw new UnauthorizedAccessException("You can only withdraw your own offers");
        }

        if (offer.getStatus() != OfferStatus.PENDING) {
            throw new UnauthorizedAccessException("Only pending offers can be withdrawn");
        }

        offer.setStatus(OfferStatus.WITHDRAWN);
        offerRepository.save(offer);

//        emailService.sendOfferWithdrawnEmail(offer.getCandidate(), offer);
        return toResponse(offer);
    }

    @Override
    @Transactional
    public OfferResponseDTO respondToOffer(String bearerToken, Long offerId, OfferStatus status) {
        if (status == OfferStatus.PENDING) {
            throw new UnauthorizedAccessException("Invalid status change");
        }

        User me = getUser(bearerToken);
        CandidateProfile profile = candidateProfileRepository.findByUser(me)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new ResourceNotFoundException("Offer not found"));

        if (!offer.getCandidate().getId().equals(profile.getId())) {
            throw new UnauthorizedAccessException("This offer is not for you");
        }

        if (offer.getStatus() != OfferStatus.PENDING) {
            throw new UnauthorizedAccessException("You can only respond to pending offers");
        }

        offer.setStatus(status);
        offerRepository.save(offer);

        RecruiterProfile recruiter = offer.getRecruiter();

//        if (status == OfferStatus.ACCEPTED) {
//            emailService.sendOfferAcceptedEmail(recruiter, offer);
//            emailService.sendMatchNotificationEmailToAdmin(profile, recruiter, offer);
//        } else if (status == OfferStatus.REJECTED) {
//            emailService.sendOfferDeclinedEmail(recruiter, offer);
//        }
        return toResponse(offer);
    }
}
