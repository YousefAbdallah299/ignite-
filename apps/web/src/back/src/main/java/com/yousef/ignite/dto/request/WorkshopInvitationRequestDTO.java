package com.yousef.ignite.dto.request;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class WorkshopInvitationRequestDTO {
    private String name;
    private String description;
    private String invitationLink;
    private LocalDateTime startDate;
    private List<String> recipientEmails;
}
