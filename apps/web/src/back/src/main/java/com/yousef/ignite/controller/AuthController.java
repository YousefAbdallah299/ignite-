package com.yousef.ignite.controller;
import com.yousef.ignite.dto.request.ChangePasswordDTO;
import com.yousef.ignite.dto.request.ChangePasswordRequestDTO;
import com.yousef.ignite.dto.request.LoginRequestDTO;
import com.yousef.ignite.dto.request.RegisterRequestDTO;
import com.yousef.ignite.dto.request.SendOTPRequestDTO;
import com.yousef.ignite.dto.request.VerifyOTPRequestDTO;
import com.yousef.ignite.dto.response.LoginResponseDTO;
import com.yousef.ignite.dto.response.RegisterResponseDTO;
import com.yousef.ignite.exception.custom.EmailAlreadyExistsException;
import com.yousef.ignite.service.security.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
@Validated
@Tag(name = "Authentication", description = "Endpoints for customer authentication and authorization, including registration, login, and logout.")
public class AuthController {

    private final AuthService authService;

    @GetMapping("/refresh")
    public ResponseEntity<Void> refresh() {
        return ResponseEntity.ok().build();
    }


    @PostMapping("/register")
    @Operation(summary = "Register a new customer", description = "Creates a new customer account with the provided details. An email address must be unique.")
    public ResponseEntity<RegisterResponseDTO> register(@RequestBody @Valid RegisterRequestDTO customer) throws EmailAlreadyExistsException {
        return new ResponseEntity<>(this.authService.register(customer), HttpStatus.CREATED);
    }

    @PostMapping(value = "/register-candidate-with-resume", consumes = {"multipart/form-data"})
    @Operation(summary = "Register candidate with mandatory resume", description = "Creates a candidate account and uploads a required resume in one request.")
    public ResponseEntity<RegisterResponseDTO> registerCandidateWithResume(
            @RequestPart("data") @Valid RegisterRequestDTO customer,
            @RequestPart("resume") MultipartFile resume
    ) throws EmailAlreadyExistsException {
        return new ResponseEntity<>(this.authService.registerCandidateWithResume(customer, resume), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    @Operation(summary = "Login with email and password", description = "Authenticates a customer by email and password, and returns a JWT token upon successful login.")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody @Valid LoginRequestDTO loginRequestDTO) {
        return new ResponseEntity<>(this.authService.login(loginRequestDTO), HttpStatus.OK);
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout the user", description = "Invalidates the JWT token for the currently logged-in customer, logging them out of the system.")
    public ResponseEntity<Void> logout(@RequestHeader("Authorization") String token) {
        authService.logout(token);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/confirm")
    @Operation
    public ResponseEntity<String> confirmEmail(String token) {
        return new ResponseEntity<>(this.authService.confirmEmail(token),  HttpStatus.OK);
    }

    @DeleteMapping("/users/{userId}")
    @Operation(summary = "Delete a user (Admin only)", description = "Deletes a user account by ID. Only admins are allowed to perform this action.")
    public ResponseEntity<Void> deleteUser(@RequestHeader("Authorization") String token,
                                           @PathVariable Long userId) {
        authService.deleteUser(token, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestParam String email) {
        authService.forgotPassword(email);
        return ResponseEntity.ok("Password reset email sent.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(
            @RequestParam("token") String token,
            @RequestBody ChangePasswordDTO request) {
        String message = authService.resetPassword(token, request);
        return ResponseEntity.ok(message);
    }

    @PostMapping("/send-phone-otp")
    @Operation(summary = "Send OTP to phone number", description = "Sends a 6-digit OTP to the provided phone number for verification")
    public ResponseEntity<String> sendPhoneOTP(@RequestBody @Valid SendOTPRequestDTO request) {
        String message = authService.sendPhoneOTP(request.getPhoneNumber());
        return ResponseEntity.ok(message);
    }

    @PostMapping("/verify-phone-otp")
    @Operation(summary = "Verify phone number OTP", description = "Verifies the OTP code sent to the phone number")
    public ResponseEntity<String> verifyPhoneOTP(@RequestBody @Valid VerifyOTPRequestDTO request) {
        String message = authService.verifyPhoneOTP(request.getPhoneNumber(), request.getOtp());
        return ResponseEntity.ok(message);
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change password (authenticated users)", description = "Allows authenticated users to change their password")
    public ResponseEntity<String> changePassword(
            @RequestHeader("Authorization") String token,
            @RequestBody @Valid ChangePasswordRequestDTO request) {
        String message = authService.changePassword(token, request);
        return ResponseEntity.ok(message);
    }




}