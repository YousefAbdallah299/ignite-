package com.yousef.ignite.service;

import com.yousef.ignite.dto.request.WorkshopInvitationRequestDTO;

public interface WorkshopService {
    void inviteToWorkshop(WorkshopInvitationRequestDTO request);
}
