 package com.yousef.ignite.service;

 import com.yousef.ignite.dto.request.WorkshopInvitationRequestDTO;
 import com.yousef.ignite.entity.CandidateProfile;
 import com.yousef.ignite.entity.Offer;
 import com.yousef.ignite.entity.RecruiterProfile;
 import com.yousef.ignite.entity.User;
 import jakarta.mail.MessagingException;
 import jakarta.mail.internet.MimeMessage;
 import jakarta.transaction.Transactional;
 import lombok.RequiredArgsConstructor;
 import lombok.extern.slf4j.Slf4j;
 import org.springframework.mail.javamail.JavaMailSender;
 import org.springframework.mail.javamail.MimeMessageHelper;
 import org.springframework.scheduling.annotation.Async;
 import org.springframework.stereotype.Service;

 import java.time.LocalDateTime;

 @Service
 @RequiredArgsConstructor
 @Slf4j
 public class EmailServiceImpl implements EmailService {

     private final JavaMailSender mailSender;

     // Core send method
     @Async
     public void sendEmail(String recipient, String subject, String content) {
         try {
             MimeMessage message = mailSender.createMimeMessage();
             MimeMessageHelper helper = new MimeMessageHelper(message, true);
             helper.setTo(recipient);
             helper.setSubject(subject);
             helper.setText(content, true);
             mailSender.send(message);
             log.info("📧 Email sent to {}", recipient);
         } catch (MessagingException e) {
             log.error("❌ Failed to send email to {}: {}", recipient, e.getMessage());
         }
     }


     @Transactional
     @Override
     public void sendVerificationEmail(User user) {
         String subject = "Please confirm your email";
         String confirmationUrl = "http://localhost:8080/api/v1/auth/confirm?token=" + user.getVerificationToken();
         String message = "Click the link to verify your account: " + confirmationUrl;

         sendEmail(user.getEmail(), subject, message);
     }

     @Transactional
     @Override
     public void sendForgotPasswordEmail(String email, String token) {
         String subject = "Password Reset Request";
         String resetUrl = "http://localhost:8080/api/v1/auth/reset-password?token=" + token;
         String message = "Click the link to reset your password: " + resetUrl;
         sendEmail(email, subject, message);
     }

     @Transactional
     @Override
     public void sendWorkshopInvitationEmail(WorkshopInvitationRequestDTO request) {
         for (String email : request.getRecipientEmails()) {
             String subject = "Ignite Workshop Invitation: " + request.getName();

             String emailContent =
                     "<div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>"
                             + "<h2 style='color:#d32f2f;'> Ignite Workshop Invitation</h2>"
                             + "<p>Hello,</p>"
                             + "<p>You have been specially invited by <b>Ignite</b> to join an upcoming workshop that we believe will be valuable for your growth.</p>"
                             + "<p><b>Title:</b> " + request.getName() + "</p>"
                             + "<p><b>Description:</b> " + request.getDescription() + "</p>"
                             + "<p><b>Start Date:</b> " + request.getStartDate() + "</p>"
                             + "<p><b>Join the workshop here:</b> <a href='" + request.getInvitationLink()
                             + "' style='color:#1976d2; text-decoration:none;'><b>Click to Join</b></a></p>"
                             + "<br/>"
                             + "<p>We look forward to seeing you there!</p>"
                             + "<hr style='margin-top:20px; border:none; border-top:1px solid #ccc;'/>"
                             + "<p style='font-size:12px; color:#777;'>This invitation was sent by <b>Ignite</b>. "
                             + "If you were not expecting this, you may safely ignore this email.</p>"
                             + "</div>";
             sendEmail(email, subject, emailContent);
         }

     }

     @Transactional
     @Override
     public void sendOfferSentEmail(CandidateProfile candidate, Offer offer) {
         String subject = "📨 New Job Offer from Ignite";
         String html = """
                     <h2>You've Received a Job Offer!</h2>
                     <p>Hello,</p>
                     <p>You’ve received a new job offer on Ignite.</p>
                     <ul>
                       <li><b>Position:</b> %s</li>
                       <li><b>Salary:</b> %s %s</li>
                     </ul>
                     <p>Log in to your Ignite account to view and respond to this offer.</p>
                     <br>
                     <p>— Ignite Team 🚀</p>
                 """.formatted(offer.getTitle(), offer.getSalary(), offer.getCurrency());

         sendEmail(candidate.getUser().getEmail(), subject, html);
     }

     @Transactional
     @Override
     public void sendOfferAcceptedEmail(RecruiterProfile recruiterProfile, Offer offer) {
         String subject = "🎉 Offer Accepted — Great News!";
         String html = """
                     <h2>Your Offer Has Been Accepted!</h2>
                     <p>Hi,</p>
                     <p><b>%s</b> has accepted your offer for the position of <b>%s</b>.</p>
                     <p>Congratulations on the successful match!</p>
                     <p>We will reach out to you for information regarding the next steps.</p>
                     <br>
                     <p>— Ignite Team 🚀</p>
                 """.formatted(offer.getCandidate().getUser().getFirstName(), offer.getTitle());
         sendEmail(recruiterProfile.getUser().getEmail(), subject, html);
     }

     @Transactional
     @Override
     public void sendOfferDeclinedEmail(RecruiterProfile recruiterProfile, Offer offer) {
         String subject = "❌ Offer Declined";
         String html = """
                     <h2>Your Offer Has Been Declined</h2>
                     <p>Hi,</p>
                     <p><b>%s</b> has declined your offer for the position of <b>%s</b>.</p>
                     <p>Don’t worry — you can explore more candidates on Ignite.</p>
                     <br>
                     <p>— Ignite Team 🚀</p>
                 """.formatted(offer.getCandidate().getUser().getFirstName(), offer.getTitle());
         sendEmail(recruiterProfile.getUser().getEmail(), subject, html);
     }

     @Transactional
     @Override
     public void sendOfferWithdrawnEmail(CandidateProfile candidate, Offer offer) {
         String subject = "⚠️ Offer Withdrawn";
         String html = """
                     <h2>Offer Withdrawn</h2>
                     <p>Hello,</p>
                     <p><The offer for the position of <b>%s</b> has been withdrawn.</p>
                     <p>We appreciate your interest and encourage you to keep applying to other opportunities on Ignite.</p>
                     <br>
                     <p>— Ignite Team 🚀</p>
                 """.formatted(offer.getTitle());
         sendEmail(candidate.getUser().getEmail(), subject, html);
     }

     @Transactional
     @Override
     public void sendPaymentSuccessEmail(RecruiterProfile recruiterProfile, LocalDateTime endDate) {
         User user = recruiterProfile.getUser();
         String subject = "💳 Payment Successful — Ignite Subscription";
         String html = """
                     <h2>Payment Successful 🎉</h2>
                     <p>Hi %s,</p>
                     <p>Your payment has been successfully processed.</p>
                     <p>Your <b>monthly subscription</b> is now active until <b>%s</b>.</p>
                     <p>Thank you for staying connected with Ignite!</p>
                     <br>
                     <p>— Ignite Team 🚀</p>
                 """.formatted(user.getFirstName(), endDate);
         sendEmail(user.getEmail(), subject, html);
     }

     @Transactional
     @Override
     public void sendMatchNotificationEmailToAdmin(CandidateProfile candidate, RecruiterProfile recruiterProfile, Offer offer) {
         User candidateUser = candidate.getUser();
         User recruiterUser = recruiterProfile.getUser();
         String adminEmail = "yousefabdallah031@gmail.com";
         String subject = "🎯 New Match on Ignite!";
         String html = """
                     <h2>🔥 New Candidate–Recruiter Match Found!</h2>
                     <p>A candidate has accepted an offer:</p>
                     <h3>Candidate Details:</h3>
                     <ul>
                       <li><b>Name:</b> %s</li>
                       <li><b>Email:</b> %s</li>
                     </ul>
                     <h3>Recruiter Details:</h3>
                     <ul>
                       <li><b>Name:</b> %s</li>
                       <li><b>Email:</b> %s</li>
                       <li><b>Company:</b> %s</li>
                     </ul>
                     <p><b>Position:</b> %s </p>
                     <br>
                     <p>— Ignite Team 🚀</p>
                 """.formatted(candidateUser.getFirstName(), candidateUser.getEmail(), recruiterUser.getFirstName(), recruiterUser.getEmail(), recruiterProfile.getCompanyName(), offer.getTitle());
         sendEmail(adminEmail, subject, html);
     }

     @Override
     @Transactional
     public void sendCourseRequestEmailToCandidate(User user) {
         String subject = "Course Request Received";
         String message = "Dear " + user.getFirstName() + ",\n\n"
                 + "We have received your course request. Our team will review it and get back to you shortly.\n\n"
                 + "Best regards,\n"
                 + "Ignite Team";
         sendEmail(user.getEmail(), subject, message);
     }

     @Override
     @Transactional
     public void sendCourseRequestEmailToIgnite(User user, LocalDateTime endDate) {
         String subject = "New Course Request Submitted";
         String message = "A new course request has been submitted by " + user.getFirstName() + " (" + user.getEmail() + ").\n\n"
                 + "Please review the request at your earliest convenience.\n\n"
                 + "Best regards,\n"
                 + "Ignite System";
         String adminEmail = "yousefabdallah031@gmail.com";
         sendEmail(adminEmail, subject, message);


     }
 }