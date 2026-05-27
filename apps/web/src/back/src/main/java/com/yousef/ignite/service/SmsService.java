package com.yousef.ignite.service;

/**
 * Abstraction for sending SMS messages (e.g., OTP codes).
 */
public interface SmsService {
    void sendOtp(String phoneNumber, String otp);
}

