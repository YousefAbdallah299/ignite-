package com.yousef.ignite.payments;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.yousef.ignite.dto.request.PaymentRequestDTO;
import com.yousef.ignite.dto.response.PaymentResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${paymob.webhook.secret:}")
    private String paymobWebhookSecret;

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
            @RequestBody(required = false) String rawPayload,
            @RequestHeader(value = "X-Signature", required = false) String signature,
            @RequestHeader(value = "X-HMAC", required = false) String hmacHeader,
            @RequestParam(value = "hmac", required = false) String hmacParam) {
        String incomingSignature = firstNonBlank(signature, hmacHeader, hmacParam);
        if (!isValidWebhookSignature(rawPayload, incomingSignature)) {
            return ResponseEntity.status(401).body("invalid webhook signature");
        }
        try {
            JsonNode payload = rawPayload == null || rawPayload.isBlank()
                    ? null
                    : objectMapper.readTree(rawPayload);
            paymentService.handleWebhook(payload);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("invalid webhook payload");
        }
        return ResponseEntity.ok("ok");
    }

    @GetMapping("/webhook")
    public ResponseEntity<String> handleWebhookGet() {
        // Keep endpoint for compatibility, but reject GET webhooks for security.
        return ResponseEntity.status(405).body("method not allowed");
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

    private boolean isValidWebhookSignature(String rawPayload, String signature) {
        if (paymobWebhookSecret == null || paymobWebhookSecret.isBlank()) {
            return false;
        }
        if (rawPayload == null || rawPayload.isBlank() || signature == null || signature.isBlank()) {
            return false;
        }

        try {
            Mac hmac = Mac.getInstance("HmacSHA512");
            SecretKeySpec key = new SecretKeySpec(paymobWebhookSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac.init(key);
            byte[] digest = hmac.doFinal(rawPayload.getBytes(StandardCharsets.UTF_8));
            String calculated = toHex(digest);
            return constantTimeEquals(calculated, signature.trim().toLowerCase());
        } catch (Exception e) {
            return false;
        }
    }

    private String toHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    private boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null || a.length() != b.length()) return false;
        int result = 0;
        for (int i = 0; i < a.length(); i++) {
            result |= a.charAt(i) ^ b.charAt(i);
        }
        return result == 0;
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }
}
