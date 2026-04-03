package com.yousef.ignite.service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Random;

import org.springframework.stereotype.Service;

/**
 * Simple in-memory OTP service
 * In production, consider using Redis or a dedicated OTP service
 */
@Service
public class OTPService {

    private static final Map<String, OTPData> otpStore = new ConcurrentHashMap<>();
    private static final int OTP_EXPIRY_MINUTES = 10;
    private static final Random random = new Random();

    private static class OTPData {
        String otp;
        long expiryTime;

        OTPData(String otp) {
            this.otp = otp;
            this.expiryTime = System.currentTimeMillis() + (OTP_EXPIRY_MINUTES * 60 * 1000);
        }

        boolean isExpired() {
            return System.currentTimeMillis() > expiryTime;
        }
    }

    /**
     * Generate and store OTP for a phone number
     * @param phoneNumber The phone number to generate OTP for
     * @return The generated 6-digit OTP
     */
    public String generateOTP(String phoneNumber) {
        // Generate 6-digit OTP
        String otp = String.format("%06d", random.nextInt(1000000));

        // Store OTP with expiry
        otpStore.put(phoneNumber, new OTPData(otp));

        // Clean up expired OTPs
        cleanupExpiredOTPs();

        return otp;
    }

    /**
     * Verify OTP for a phone number
     * @param phoneNumber The phone number
     * @param otp The OTP to verify
     * @return true if OTP is valid and not expired, false otherwise
     */
    public boolean verifyOTP(String phoneNumber, String otp) {
        OTPData otpData = otpStore.get(phoneNumber);

        if (otpData == null) {
            return false;
        }

        if (otpData.isExpired()) {
            otpStore.remove(phoneNumber);
            return false;
        }

        boolean isValid = otpData.otp.equals(otp);

        // Remove OTP after successful verification (one-time use)
        if (isValid) {
            otpStore.remove(phoneNumber);
        }

        return isValid;
    }

    /**
     * Check if OTP exists for phone number (not expired)
     * @param phoneNumber The phone number
     * @return true if valid OTP exists, false otherwise
     */
    public boolean hasValidOTP(String phoneNumber) {
        OTPData otpData = otpStore.get(phoneNumber);
        if (otpData == null) {
            return false;
        }
        if (otpData.isExpired()) {
            otpStore.remove(phoneNumber);
            return false;
        }
        return true;
    }

    /**
     * Remove OTP for a phone number
     * @param phoneNumber The phone number
     */
    public void removeOTP(String phoneNumber) {
        otpStore.remove(phoneNumber);
    }

    /**
     * Clean up expired OTPs
     */
    private void cleanupExpiredOTPs() {
        otpStore.entrySet().removeIf(entry -> entry.getValue().isExpired());
    }
}

