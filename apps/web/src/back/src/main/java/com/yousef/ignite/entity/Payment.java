package com.yousef.ignite.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name="payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="recruiter_id", nullable=false)
    private Long recruiterId;

    @Column(name="amount_cents", nullable=false)
    private Long amountCents;

    @Column(nullable=false)
    private String currency = "EGP";

    @Column(name="paymob_order_id")
    private Long paymobOrderId;

    @Column(name="payment_token", columnDefinition = "TEXT")
    private String paymentToken;

    @Column(nullable=false)
    private String status = "PENDING";

    // 🧾 Billing fields
    @Column(name="billing_first_name")
    private String billingFirstName;

    @Column(name="billing_last_name")
    private String billingLastName;

    @Column(name="billing_email")
    private String billingEmail;

    @Column(name="billing_phone")
    private String billingPhone;

    @Column(name="billing_apartment")
    private String billingApartment;

    @Column(name="billing_floor")
    private String billingFloor;

    @Column(name="billing_street")
    private String billingStreet;

    @Column(name="billing_building")
    private String billingBuilding;

    @Column(name="billing_city")
    private String billingCity;

    @Column(name="billing_country")
    private String billingCountry;

    @Column(name="billing_postal_code")
    private String billingPostalCode;

    @Column(name="billing_state")
    private String billingState;

    @Column(name="created_at", updatable=false)
    private LocalDateTime createdAt;

    @Column(name="updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
