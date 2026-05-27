package com.yousef.ignite.service;

import com.yousef.ignite.dto.enums.OfferStatus;
import com.yousef.ignite.dto.request.SendOfferDTO;
import com.yousef.ignite.dto.response.OfferResponseDTO;

import java.util.List;

public interface OfferService {
    OfferResponseDTO sendOffer(String bearerToken, SendOfferDTO request);
    List<OfferResponseDTO> listMyOffers(String bearerToken);
    OfferResponseDTO respondToOffer(String bearerToken, Long offerId, OfferStatus status);
    List<OfferResponseDTO> listAllOffers(String bearerToken);
    OfferResponseDTO withdrawOffer(String bearerToken, Long offerId);
}


