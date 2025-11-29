package com.yousef.ignite.payments;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.yousef.ignite.dto.request.PaymentRequestDTO;
import com.yousef.ignite.dto.response.PaymentResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/initiate")
    public ResponseEntity<PaymentResponseDTO> initiate(
            @RequestHeader("Authorization") String token,
            @RequestBody PaymentRequestDTO req) {
        PaymentResponseDTO resp = paymentService.initiatePayment(token, req);
        return ResponseEntity.ok(resp);
    }

    /**
     * Webhook endpoint (Paymob → backend)
     * Called automatically by Paymob's servers when payment status updates.
     */
    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhookPost(
            @RequestBody(required = false) JsonNode payload,
            @RequestHeader(value = "X-Signature", required = false) String signature) {
        paymentService.handleWebhook(payload);
        return ResponseEntity.ok("ok");
    }

    @GetMapping("/webhook")
    public ResponseEntity<String> handleWebhookGet(@RequestParam Map<String, String> params) {
        ObjectNode json = new ObjectMapper().createObjectNode();
        params.forEach(json::put);
        paymentService.handleWebhook(json);
        return ResponseEntity.ok("ok");
    }

    /**
     * Callback endpoint (browser → backend → redirect to frontend)
     * Paymob redirects the user here after completing payment.
     */
    @GetMapping("/callback")
    public RedirectView handleCallback(@RequestParam(required = false) String success,
                                       @RequestParam(required = false) String order,
                                       @RequestParam(required = false) String id) {
        boolean paid = "true".equalsIgnoreCase(success) || "1".equals(success);
        String redirectUrl;

        if (paid) {
            redirectUrl = "https://ignite-7e2w.onrender.com/payment-success";
        } else {
            redirectUrl = "https://ignite-7e2w.onrender.com/payment-failed";
        }

        return new RedirectView(redirectUrl);
    }
}
