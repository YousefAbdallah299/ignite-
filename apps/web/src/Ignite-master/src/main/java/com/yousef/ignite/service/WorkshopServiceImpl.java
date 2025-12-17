package com.yousef.ignite.service;

import com.yousef.ignite.dto.request.WorkshopInvitationRequestDTO;
import com.yousef.ignite.service.WorkshopService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WorkshopServiceImpl implements WorkshopService {

    private final EmailService emailService;


    @Transactional
    @Override
    public void inviteToWorkshop(WorkshopInvitationRequestDTO request) {
//        emailService.sendWorkshopInvitationEmail(request);
    }

}
