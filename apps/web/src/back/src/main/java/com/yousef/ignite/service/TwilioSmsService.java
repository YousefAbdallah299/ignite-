package com.yousef.ignite.service;

import lombok.RequiredArgsConstructor;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.util.EntityUtils;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TwilioSmsService implements SmsService {

    @Override
    public void sendOtp(String phoneNumber, String otp) {
        String accountSid = System.getenv("TWILIO_ACCOUNT_SID");
        String authToken = System.getenv("TWILIO_AUTH_TOKEN");
        String fromNumber = System.getenv("TWILIO_FROM_NUMBER");
        String defaultCountryCode = System.getenv("OTP_DEFAULT_COUNTRY_CODE");

        if (accountSid == null || accountSid.isBlank() ||
                authToken == null || authToken.isBlank() ||
                fromNumber == null || fromNumber.isBlank()) {
            // Fail fast so it doesn't look like "OTP sent" when Twilio isn't configured.
            throw new IllegalStateException("Twilio SMS provider is not configured. Missing TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN/TWILIO_FROM_NUMBER.");
        }

        String normalizedForProvider = normalizePhoneForSms(phoneNumber, defaultCountryCode);

        String messageBody = "Ignite verification code: " + otp;
        String url = "https://api.twilio.com/2010-04-01/Accounts/" + accountSid + "/Messages.json";

        HttpPost post = new HttpPost(url);
        String basicAuth = Base64.getEncoder().encodeToString((accountSid + ":" + authToken).getBytes(StandardCharsets.UTF_8));
        post.setHeader("Authorization", "Basic " + basicAuth);

        List<BasicNameValuePair> params = new ArrayList<>();
        params.add(new BasicNameValuePair("To", normalizedForProvider));
        params.add(new BasicNameValuePair("From", fromNumber));
        params.add(new BasicNameValuePair("Body", messageBody));

        post.setEntity(new UrlEncodedFormEntity(params, StandardCharsets.UTF_8));

        RequestConfig requestConfig = RequestConfig.custom()
                .setConnectTimeout(5000)
                .setConnectionRequestTimeout(5000)
                .setSocketTimeout(10000)
                .build();

        try (CloseableHttpClient client = HttpClients.custom()
                .setDefaultRequestConfig(requestConfig)
                .build()) {
            HttpResponse response = client.execute(post);
            int status = response.getStatusLine().getStatusCode();
            String body = response.getEntity() != null
                    ? EntityUtils.toString(response.getEntity(), StandardCharsets.UTF_8)
                    : "";

            if (status < 200 || status >= 300) {
                throw new IllegalStateException("Failed to send OTP via Twilio. HTTP " + status + ": " + body);
            }
        } catch (Exception e) {
            throw new IllegalStateException("Failed to send OTP via Twilio: " + e.getMessage(), e);
        }
    }

    private String normalizePhoneForSms(String phoneNumber, String defaultCountryCode) {
        String clean = phoneNumber == null ? "" : phoneNumber.trim();
        if (clean.isEmpty()) return clean;

        // If the frontend provides local numbers like 0xxxxxxxxx, attempt to convert to E.164.
        if (clean.startsWith("0") && defaultCountryCode != null && !defaultCountryCode.isBlank()) {
            return "+" + defaultCountryCode + clean.substring(1);
        }

        // Twilio expects E.164 (typically +...). If caller already provided +, keep it.
        return clean;
    }
}

