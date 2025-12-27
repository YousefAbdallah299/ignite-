package com.yousef.ignite.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentRequestDTO {
    private Long recruiterId;
    private Long amountCents;
    private String currency;
    private BillingRequestDTO billing;
}
