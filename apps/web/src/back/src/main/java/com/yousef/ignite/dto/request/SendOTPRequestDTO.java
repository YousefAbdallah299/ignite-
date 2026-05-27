package com.yousef.ignite.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SendOTPRequestDTO {
    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^(0|\\+)[0-9]{7,}", message = "Phone number must start with 0 or + and be at least 8 characters")
    private String phoneNumber;
}

