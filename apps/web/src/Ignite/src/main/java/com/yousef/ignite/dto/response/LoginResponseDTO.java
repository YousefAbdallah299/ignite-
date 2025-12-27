package com.yousef.ignite.dto.response;


import com.yousef.ignite.dto.enums.UserRole;
import lombok.*;
import org.springframework.http.HttpStatus;

@Setter
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponseDTO {
    private String token;
    private String tokenType;
    private String message;
    private HttpStatus httpStatus;
    private UserRole role;
}