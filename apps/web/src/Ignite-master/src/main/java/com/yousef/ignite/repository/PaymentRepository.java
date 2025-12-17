package com.yousef.ignite.repository;

import com.yousef.ignite.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment,Long> {
    Optional<Payment> findByPaymobOrderId(Long paymobOrderId);
}
