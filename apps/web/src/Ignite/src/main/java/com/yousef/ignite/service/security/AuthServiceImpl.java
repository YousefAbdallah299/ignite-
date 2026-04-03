package com.yousef.ignite.service.security;
import ch.qos.logback.core.util.StringUtil;
import com.yousef.ignite.dto.enums.RecruiterStatus;
import com.yousef.ignite.dto.enums.UserRole;
import com.yousef.ignite.dto.request.ChangePasswordDTO;
import com.yousef.ignite.dto.request.ChangePasswordRequestDTO;
import com.yousef.ignite.dto.request.LoginRequestDTO;
import com.yousef.ignite.dto.request.RegisterRequestDTO;
import com.yousef.ignite.service.OTPService;
import com.yousef.ignite.dto.response.RegisterResponseDTO;
import com.yousef.ignite.dto.response.LoginResponseDTO;
import com.yousef.ignite.entity.CandidateProfile;
import com.yousef.ignite.entity.CareerHistory;
import com.yousef.ignite.entity.RecruiterProfile;
import com.yousef.ignite.entity.User;
import com.yousef.ignite.exception.custom.*;
import com.yousef.ignite.repository.AdminPrivilegeRepository;
import com.yousef.ignite.repository.BlogLikeRepository;
import com.yousef.ignite.repository.BlogRepository;
import com.yousef.ignite.repository.CandidateProfileRepository;
import com.yousef.ignite.repository.CandidateCommentRepository;
import com.yousef.ignite.repository.CareerHistoryRepository;
import com.yousef.ignite.repository.CommentLikeRepository;
import com.yousef.ignite.repository.CommentRepository;
import com.yousef.ignite.repository.CourseProgressRepository;
import com.yousef.ignite.repository.OfferRepository;
import com.yousef.ignite.repository.RecruiterProfileRepository;
import com.yousef.ignite.repository.UserRepository;
import com.yousef.ignite.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;


import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final JwtUtils jwtUtils;

    private final AuthenticationManager authenticationManager;

    private final EmailService emailService;

    private final RecruiterProfileRepository recruiterProfileRepository;

    private final CandidateProfileRepository candidateProfileRepository;

    private final CandidateCommentRepository candidateCommentRepository;

    private final CareerHistoryRepository careerHistoryRepository;

    private final OfferRepository offerRepository;

    private final AdminPrivilegeRepository adminPrivilegeRepository;

    private final BlogLikeRepository blogLikeRepository;

    private final CommentLikeRepository commentLikeRepository;

    private final CommentRepository commentRepository;

    private final BlogRepository blogRepository;

    private final CourseProgressRepository courseProgressRepository;

    private final OTPService otpService;

    private final Set<String> invalidatedTokens = new HashSet<>();

    @Transactional
    @Override
    public RegisterResponseDTO register(RegisterRequestDTO customerRequest) throws EmailAlreadyExistsException{

        if(!StringUtils.hasText(customerRequest.getEmail()))
        {
            throw new EmailAlreadyExistsException("Email is required");
        }
        if(!StringUtils.hasText(customerRequest.getPhoneNumber()))
        {
            throw new EmailAlreadyExistsException("Phone number is required");
        }
        if(!StringUtils.hasText(customerRequest.getPassword()))
        {
            throw new EmailAlreadyExistsException("Password is required");
        }
        if(!customerRequest.getPassword().equals(customerRequest.getConfirmPassword()))
        {
            throw new EmailAlreadyExistsException("Passwords do not match");
        }

        String normalizedEmail = customerRequest.getEmail().trim();
        String normalizedPhone = customerRequest.getPhoneNumber().trim();

        if(Boolean.TRUE.equals(userRepository.existsByEmail(normalizedEmail)))
            throw new EmailAlreadyExistsException("Email Already Exists!");

        User user = User.builder()
                .email(normalizedEmail)
                .passwordHash(this.passwordEncoder.encode(customerRequest.getPassword()))
                .firstName(customerRequest.getFirst_name())
                .lastName(customerRequest.getLast_name())
                .role(customerRequest.getRole() != null ? customerRequest.getRole() : UserRole.CANDIDATE)
                .enabled(false)
                .verificationToken(UUID.randomUUID().toString())
                .phoneNumber(normalizedPhone)
                .build();



        User savedUser = userRepository.saveAndFlush(user);


        if (user.getRole() == UserRole.CANDIDATE) {
            // Validate required fields for candidates
            if (customerRequest.getExpectedPosition() == null || customerRequest.getExpectedPosition().trim().isEmpty()) {
                throw new IllegalArgumentException("Expected position is required for job seekers");
            }
            if (customerRequest.getExpectedSalary() == null) {
                throw new IllegalArgumentException("Expected salary is required for job seekers");
            }

            CandidateProfile profile = CandidateProfile.builder()
                    .user(user)
                    .title(customerRequest.getExpectedPosition()) // Use expectedPosition as title
                    .expectedPosition(customerRequest.getExpectedPosition())
                    .expectedSalary(customerRequest.getExpectedSalary())
                    .expectedSalaryCurrency(customerRequest.getExpectedSalaryCurrency() != null
                            ? customerRequest.getExpectedSalaryCurrency()
                            : "EGP") // Default to EGP if not provided
                    .currentPosition(customerRequest.getCurrentPosition()) // Optional current position
                    .summary("")
                    .resumeUrl("")
                    .createdAt(LocalDateTime.now())
                    .build();
            candidateProfileRepository.save(profile);

        } else if (user.getRole() == UserRole.RECRUITER) {
            // Validate business email for recruiters
            if (customerRequest.getBusinessEmail() == null || customerRequest.getBusinessEmail().trim().isEmpty()) {
                throw new IllegalArgumentException("Business email is required for recruiters");
            }

            RecruiterProfile profile = RecruiterProfile.builder()
                    .user(user)
                    .companyName("")
                    .businessEmail(customerRequest.getBusinessEmail().trim())
                    .status(RecruiterStatus.GUEST)
                    .build();
            recruiterProfileRepository.save(profile);
        }


        sendVerificationEmail(savedUser);


        return savedUser.toRegisterResponseDTO();
    }


    @Override
    public LoginResponseDTO login(LoginRequestDTO loginRequestDTO) throws ResourceNotFoundException, UnverifiedEmailException {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequestDTO.getEmail(), loginRequestDTO.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = jwtUtils.generateJwtToken(authentication);

        jwtUtils.getEmailFromJwtToken(jwt);
        User user = userRepository.findUserByEmail(jwtUtils.getEmailFromJwtToken(jwt))
                .orElseThrow(() -> new ResourceNotFoundException("User Not Found with email: " + jwtUtils.getEmailFromJwtToken(jwt)));

        // Check if user is suspended
        if (Boolean.TRUE.equals(user.getSuspended())) {
            throw new UnauthorizedAccessException("Your account has been suspended. Please contact support.");
        }

//        if (!user.isEnabled()) {
//            throw new UnverifiedEmailException("Please verify your email before logging in.");
//        }

        return LoginResponseDTO.builder()
                .token(jwt)
                .message("Login Success!")
                .httpStatus(HttpStatus.ACCEPTED)
                .tokenType("Bearer")
                .role(user.getRole())
                .build();

    }

    @Override
    public void logout(String token){
        token = token.substring(7);
        invalidatedTokens.add(token);
    }

    @Override
    public void sendVerificationEmail(User user) {
//        emailService.sendVerificationEmail(user);
    }

    @Override
    public String confirmEmail(String token) throws InvalidTokenException {
        User user = userRepository.findUserByVerificationToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid token"));

        user.setEnabled(true);
        user.setVerificationToken(null);
        userRepository.save(user);
        return "Email confirmed! You can now log in.";
    }


    public boolean isTokenInvalid(String token){
        return invalidatedTokens.contains(token);
    }


    @Override
    @Transactional
    public void deleteUser(String bearerToken, Long userId) {
        // Extract requesting user from JWT
        String token = bearerToken.substring(7);
        String email = jwtUtils.getEmailFromJwtToken(token);
        User requestingUser = userRepository.findUserByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Requesting user not found"));

        // Allow only admins or the user themselves
        if (!requestingUser.getRole().equals(UserRole.ADMIN)
                && !requestingUser.getId().equals(userId)) {
            throw new UnauthorizedAccessException("You are not allowed to delete this account");
        }

        // Find target user to delete
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Long targetUserId = targetUser.getId();

        // Delete in correct order to avoid foreign key constraint violations
        // 1. Delete blog likes by this user (on other users' blogs)
        blogLikeRepository.deleteByUserId(targetUserId);
        blogLikeRepository.flush();

        // 2. Delete comment likes by this user (on other users' comments)
        commentLikeRepository.deleteByUserId(targetUserId);
        commentLikeRepository.flush();

        // 3. Delete comments by this user (on other users' blogs)
        // This will cascade delete comment likes on those comments
        commentRepository.deleteByUserId(targetUserId);
        commentRepository.flush();

        // 4. Delete blogs by this user (this will cascade delete comments and likes on those blogs)
        blogRepository.deleteByUserId(targetUserId);
        blogRepository.flush();

        // 5. Delete course progress/enrollments by this user
        courseProgressRepository.deleteByUser(targetUser);
        courseProgressRepository.flush();

        // 6. Delete candidate comments where this user is the admin (if user is an admin)
        candidateCommentRepository.deleteByAdminUserId(targetUserId);
        candidateCommentRepository.flush();

        // 7. Clean up candidate profile and related entities
        candidateProfileRepository.findByUser(targetUser).ifPresent(candidateProfile -> {
            // Delete candidate comments first to avoid foreign key constraint violation
            candidateCommentRepository.deleteByCandidateProfile(candidateProfile);
            candidateCommentRepository.flush();

            // Delete career history records individually to avoid StackOverflowError
            List<CareerHistory> careerHistories = careerHistoryRepository.findByCandidateOrderByStartDateDesc(candidateProfile);
            for (CareerHistory careerHistory : careerHistories) {
                careerHistoryRepository.deleteById(careerHistory.getId());
            }
            careerHistoryRepository.flush();

            // Delete job applications (handled via cascade, but being explicit)
            // CandidateAppliedJob will be deleted via cascade when profile is deleted

            // Delete course enrollments (many-to-many relationship)
            // This is handled via the candidate_courses join table when profile is deleted

            // Delete offers to/from this candidate (handled via cascade)
            // Delete skill ratings (handled via cascade)

            // Now delete the candidate profile (this will cascade delete applications, enrollments, offers, skill ratings)
            candidateProfileRepository.delete(candidateProfile);
            candidateProfileRepository.flush();
        });

        // 8. Handle recruiter profile deletion
        recruiterProfileRepository.findByUser(targetUser).ifPresent(recruiterProfile -> {
            // Delete all offers associated with this recruiter
            offerRepository.findAllByRecruiter(recruiterProfile).forEach(offerRepository::delete);
            offerRepository.flush();
            // Now safe to delete the recruiter profile
            recruiterProfileRepository.delete(recruiterProfile);
            recruiterProfileRepository.flush();
        });

        // 9. Delete admin privileges before deleting the user
        adminPrivilegeRepository.deleteByUser(targetUser);
        adminPrivilegeRepository.flush();

        // 10. Finally, delete the user
        userRepository.delete(targetUser);
    }

    public void forgotPassword(String email) {
        User user = userRepository.findUserByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        String token = UUID.randomUUID().toString();
        user.setResetPasswordToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
        userRepository.save(user);

//        emailService.sendForgotPasswordEmail(email, token);


    }

    public String resetPassword(String token, ChangePasswordDTO requestDTO) {
        User user = userRepository.findUserByResetPasswordToken(token)
                .orElseThrow(() -> new InvalidTokenException("Invalid or expired password reset token."));

        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new InvalidTokenException("Password reset token has expired.");
        }
        String newPassword = requestDTO.getNewPassword();

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setResetPasswordToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

        return "Password has been successfully reset.";
    }

    @Override
    public String sendPhoneOTP(String phoneNumber) {
        // Validate phone number format
        String cleanPhone = phoneNumber.trim().replaceAll("[\\s-]", "");
        if (!cleanPhone.matches("^(0|\\+)[0-9]{7,}")) {
            throw new IllegalArgumentException("Phone number must start with 0 or + and be at least 8 characters");
        }

        // Generate OTP
        String otp = otpService.generateOTP(cleanPhone);

        // In production, send OTP via SMS service (Twilio, AWS SNS, etc.)
        // For now, we'll just log it (in development, you might want to return it)
        System.out.println("OTP for " + cleanPhone + ": " + otp);

        // TODO: Integrate with SMS service
        // smsService.sendOTP(cleanPhone, otp);

        return "OTP sent successfully to " + cleanPhone;
    }

    @Override
    public String verifyPhoneOTP(String phoneNumber, String otp) {
        // Validate phone number format
        String cleanPhone = phoneNumber.trim().replaceAll("[\\s-]", "");
        if (!cleanPhone.matches("^(0|\\+)[0-9]{7,}")) {
            throw new IllegalArgumentException("Phone number must start with 0 or + and be at least 8 characters");
        }

        // Validate OTP format
        if (otp == null || !otp.matches("^[0-9]{6}$")) {
            throw new IllegalArgumentException("OTP must be exactly 6 digits");
        }

        // Verify OTP
        boolean isValid = otpService.verifyOTP(cleanPhone, otp);

        if (!isValid) {
            throw new InvalidTokenException("Invalid or expired OTP");
        }

        return "Phone number verified successfully";
    }

    @Override
    @Transactional
    public String changePassword(String bearerToken, ChangePasswordRequestDTO request) {
        // Extract user from JWT
        String token = bearerToken.substring(7);
        String email = jwtUtils.getEmailFromJwtToken(token);
        User user = userRepository.findUserByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Validate current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new UnauthorizedAccessException("Current password is incorrect");
        }

        // Validate new password matches confirm password
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("New password and confirm password do not match");
        }

        // Validate new password length
        if (request.getNewPassword().length() < 8) {
            throw new IllegalArgumentException("New password must be at least 8 characters");
        }

        // Update password
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return "Password changed successfully";
    }




}
