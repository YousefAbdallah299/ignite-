package com.yousef.ignite.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PaymentResponseDTO {
    private String iframeUrl;
    private String paymentToken;
    private Long orderId;
    private Long paymentId; // local Payment id

}
