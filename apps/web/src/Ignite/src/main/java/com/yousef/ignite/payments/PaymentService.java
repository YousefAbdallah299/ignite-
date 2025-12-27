package com.yousef.ignite.payments;

import com.fasterxml.jackson.databind.JsonNode;
import com.yousef.ignite.dto.enums.RecruiterStatus;
import com.yousef.ignite.dto.enums.UserRole;
import com.yousef.ignite.entity.Payment;
import com.yousef.ignite.entity.RecruiterProfile;
import com.yousef.ignite.dto.request.PaymentRequestDTO;
import com.yousef.ignite.dto.response.PaymentResponseDTO;
import com.yousef.ignite.entity.User;
import com.yousef.ignite.exception.custom.ResourceNotFoundException;
import com.yousef.ignite.exception.custom.UnauthorizedAccessException;
import com.yousef.ignite.repository.PaymentRepository;
import com.yousef.ignite.repository.RecruiterProfileRepository;
import com.yousef.ignite.repository.UserRepository;
import com.yousef.ignite.service.EmailService;
import com.yousef.ignite.service.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymobClient paymobClient;
    private final PaymentRepository paymentRepo;
    private final RecruiterProfileRepository recruiterRepo;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Transactional
    public PaymentResponseDTO initiatePayment(String token, PaymentRequestDTO req) {
        log.info("🚀 Initiating payment for recruiter_id={}, amount={} {}",
                req.getRecruiterId(), req.getAmountCents(), req.getCurrency());

        User user = getUserFromToken(token);
        if (user == null || user.getRole() != UserRole.RECRUITER)
            throw new UnauthorizedAccessException("Only recruiters can initiate payments");

        RecruiterProfile recruiter = recruiterRepo.findById(req.getRecruiterId())
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter not found with ID " + req.getRecruiterId()));

        if (!recruiter.getUser().getId().equals(user.getId()))
            throw new UnauthorizedAccessException("You can only initiate payments for your own recruiter profile");

        if (req.getBilling() == null ||
                req.getBilling().getFirstName() == null ||
                req.getBilling().getLastName() == null ||
                req.getBilling().getPhoneNumber() == null ||
                req.getBilling().getPostalCode() == null)
            throw new ResourceNotFoundException("Missing required billing fields (first_name, last_name, phone_number, postal_code)");

        // 💾 Create local payment record (store billing too)
        Payment payment = Payment.builder()
                .recruiterId(req.getRecruiterId())
                .amountCents(req.getAmountCents())
                .currency(req.getCurrency())
                .status("PENDING")
                .billingFirstName(req.getBilling().getFirstName())
                .billingLastName(req.getBilling().getLastName())
                .billingEmail(req.getBilling().getEmail())
                .billingPhone(req.getBilling().getPhoneNumber())
                .billingApartment(req.getBilling().getApartment())
                .billingFloor(req.getBilling().getFloor())
                .billingStreet(req.getBilling().getStreet())
                .billingBuilding(req.getBilling().getBuilding())
                .billingCity(req.getBilling().getCity())
                .billingCountry(req.getBilling().getCountry())
                .billingPostalCode(req.getBilling().getPostalCode())
                .billingState(req.getBilling().getState())
                .build();
        payment = paymentRepo.save(payment);
        log.info("💾 Payment record created with billing info, id={}", payment.getId());

        // 🔑 Paymob order + payment key
        String authToken = paymobClient.getAuthToken();
        Long paymobOrderId = paymobClient.createOrder(authToken, req.getAmountCents(), req.getCurrency());

        Map<String,Object> billingData = new HashMap<>();
        billingData.put("first_name", req.getBilling().getFirstName());
        billingData.put("last_name", req.getBilling().getLastName());
        billingData.put("email", req.getBilling().getEmail());
        billingData.put("phone_number", req.getBilling().getPhoneNumber());
        billingData.put("apartment", req.getBilling().getApartment());
        billingData.put("floor", req.getBilling().getFloor());
        billingData.put("street", req.getBilling().getStreet());
        billingData.put("building", req.getBilling().getBuilding());
        billingData.put("city", req.getBilling().getCity());
        billingData.put("country", req.getBilling().getCountry());
        billingData.put("postal_code", req.getBilling().getPostalCode());
        billingData.put("state", req.getBilling().getState());

        String paymentKey = paymobClient.createPaymentKey(authToken, req.getAmountCents(), paymobOrderId, req.getCurrency(), billingData);

        payment.setPaymobOrderId(paymobOrderId);
        payment.setPaymentToken(paymentKey);
        paymentRepo.save(payment);

        PaymentResponseDTO resp = new PaymentResponseDTO();
        resp.setIframeUrl(paymobClient.iframeUrlFor(paymentKey));
        resp.setPaymentToken(paymentKey);
        resp.setOrderId(paymobOrderId);
        resp.setPaymentId(payment.getId());

        return resp;
    }

    @Transactional
    public void handleWebhook(JsonNode payload) {
        log.info("🔔 Webhook received: {}", payload.toPrettyString());
        try {
            Long orderId = payload.path("obj").path("order").path("id").asLong(0);
            boolean success = payload.path("obj").path("success").asBoolean(false);

            if (orderId == 0) return;

            Payment payment = paymentRepo.findByPaymobOrderId(orderId).orElse(null);
            if (payment == null) return;

            if (success) {
                payment.setStatus("PAID");
                paymentRepo.save(payment);

                RecruiterProfile rec = recruiterRepo.findById(payment.getRecruiterId())
                        .orElseThrow(() -> new RuntimeException("Recruiter not found: " + payment.getRecruiterId()));
                rec.setStatus(RecruiterStatus.SUBSCRIBED);
                rec.setSubscriptionStartDate(LocalDateTime.now());
                rec.setSubscriptionEndDate(LocalDateTime.now().plusMonths(1));
                recruiterRepo.save(rec);
//                emailService.sendPaymentSuccessEmail(rec, LocalDateTime.now().plusMonths(1));
            } else {
                payment.setStatus("FAILED");
                paymentRepo.save(payment);
            }
        } catch (Exception e) {
            log.error("💥 Error in webhook: {}", e.getMessage(), e);
        }
    }

    private User getUserFromToken(String token) {
        token = token.substring(7);
        String email = jwtUtils.getEmailFromJwtToken(token);
        return userRepository.findUserByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Please login first."));
    }
}
