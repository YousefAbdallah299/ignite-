 package com.yousef.ignite.service;

 import com.yousef.ignite.dto.request.WorkshopInvitationRequestDTO;
 import com.yousef.ignite.entity.CandidateProfile;
 import com.yousef.ignite.entity.Offer;
 import com.yousef.ignite.entity.RecruiterProfile;
 import com.yousef.ignite.entity.User;
 import jakarta.mail.MessagingException;

 import java.time.LocalDateTime;

 public interface EmailService {

     void sendVerificationEmail(User user) ;

    void sendCourseRequestEmailToCandidate(User user, String courseTitle);

    void sendCourseRequestEmailToIgnite(User user, String courseTitle, String courseDescription, LocalDateTime endDate);

     void sendForgotPasswordEmail(String email, String token) ;

     void sendWorkshopInvitationEmail(WorkshopInvitationRequestDTO workshopInvitationRequestDTO) ;

     void sendOfferSentEmail(CandidateProfile candidate, Offer offer);

     void sendOfferAcceptedEmail(RecruiterProfile recruiterProfile, Offer offer) ;

     void sendOfferDeclinedEmail(RecruiterProfile recruiterProfile, Offer offer) ;

     void sendOfferWithdrawnEmail(CandidateProfile candidate, Offer offer) ;

     void sendPaymentSuccessEmail(RecruiterProfile recruiterProfile, LocalDateTime endDate) ;

     void sendMatchNotificationEmailToAdmin(CandidateProfile candidate, RecruiterProfile recruiterProfile, Offer offer) ;
 }
