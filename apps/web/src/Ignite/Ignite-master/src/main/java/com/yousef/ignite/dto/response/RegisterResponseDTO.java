package com.yousef.ignite.dto.response;

import lombok.*;


@AllArgsConstructor
@NoArgsConstructor
@Builder
@Setter
@Getter
public class RegisterResponseDTO {

    private Long id;

    private String name;

    private String email;

    private String phoneNumber;


}