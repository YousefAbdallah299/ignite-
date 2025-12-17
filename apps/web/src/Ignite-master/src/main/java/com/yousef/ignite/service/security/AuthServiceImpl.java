package com.yousef.ignite.service.security;
import ch.qos.logback.core.util.StringUtil;
import com.yousef.ignite.dto.enums.RecruiterStatus;
import com.yousef.ignite.dto.enums.UserRole;
import com.yousef.ignite.dto.request.ChangePasswordDTO;
import com.yousef.ignite.dto.request.LoginRequestDTO;
import com.yousef.ignite.dto.request.RegisterRequestDTO;
import com.yousef.ignite.dto.response.RegisterResponseDTO;
import com.yousef.ignite.dto.response.LoginResponseDTO;
import com.yousef.ignite.entity.CandidateProfile;
import com.yousef.ignite.entity.RecruiterProfile;
import com.yousef.ignite.entity.User;
import com.yousef.ignite.exception.custom.*;
import com.yousef.ignite.repository.CandidateProfileRepository;
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
            CandidateProfile profile = CandidateProfile.builder()
                    .user(user)
                    .title("New Candidate")
                    .summary("")
                    .resumeFilePath(null)
                    .createdAt(LocalDateTime.now())
                    .build();
            candidateProfileRepository.save(profile);

        } else if (user.getRole() == UserRole.RECRUITER) {
            RecruiterProfile profile = RecruiterProfile.builder()
                    .user(user)
                    .companyName("")
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

        // Clean up related entities before deletion
        candidateProfileRepository.findByUser(targetUser).ifPresent(candidateProfileRepository::delete);

        recruiterProfileRepository.findByUser(targetUser).ifPresent(recruiterProfileRepository::delete);

        // Finally, delete the user
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




}
