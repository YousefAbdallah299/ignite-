package com.yousef.ignite.payments;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class PaymobClient {
    private final RestTemplate rest = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${paymob.api.base}")
    private String apiBase;

    @Value("${paymob.api.key}")
    private String apiKey;

    @Value("${paymob.integration.id}")
    private String integrationId;

    @Value("${paymob.iframe.id}")
    private String iframeId;

    public String getAuthToken() {
        String url = apiBase + "/auth/tokens";
        Map<String,Object> body = new HashMap<>();
        body.put("api_key", apiKey);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String,Object>> req = new HttpEntity<>(body, headers);

        ResponseEntity<JsonNode> resp = rest.postForEntity(url, req, JsonNode.class);
        if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody()==null || resp.getBody().get("token")==null) {
            throw new RuntimeException("Failed to get Paymob auth token: " + resp);
        }
        return resp.getBody().get("token").asText();
    }

    public Long createOrder(String authToken, Long amountCents, String currency) {
        String url = apiBase + "/ecommerce/orders";
        Map<String,Object> body = new HashMap<>();
        body.put("merchant_order_id", String.valueOf(System.currentTimeMillis())); // safe unique id
        body.put("amount_cents", amountCents);
        body.put("currency", currency);
        body.put("delivery_needed", false);
        body.put("items", new Object[]{});

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(authToken);
        HttpEntity<Map<String,Object>> req = new HttpEntity<>(body, headers);

        ResponseEntity<JsonNode> resp = rest.postForEntity(url, req, JsonNode.class);
        if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody()==null || resp.getBody().get("id")==null) {
            throw new RuntimeException("Failed to create Paymob order: " + resp);
        }
        return resp.getBody().get("id").asLong();
    }

    public String createPaymentKey(String authToken, Long amountCents, Long orderId, String currency, Map<String,Object> billingData) {
        String url = apiBase + "/acceptance/payment_keys";
        Map<String,Object> body = new HashMap<>();
        body.put("amount_cents", amountCents);
        body.put("expiration", 3600);
        body.put("order_id", orderId);
        body.put("currency", currency);
        body.put("integration_id", Long.parseLong(integrationId));
        body.put("billing_data", billingData);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(authToken);
        HttpEntity<Map<String,Object>> req = new HttpEntity<>(body, headers);

        ResponseEntity<JsonNode> resp = rest.postForEntity(url, req, JsonNode.class);
        if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody()==null || resp.getBody().get("token")==null) {
            throw new RuntimeException("Failed to create payment key: " + resp);
        }
        return resp.getBody().get("token").asText();
    }

    public String iframeUrlFor(String paymentToken) {
        // iframe url format per docs
        return apiBase + "/api/acceptance/iframes/" + iframeId + "?payment_token=" + paymentToken;
    }
}
