package com.yousef.ignite.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BillingRequestDTO {
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String apartment;
    private String floor;
    private String street;
    private String building;
    private String city;
    private String country;
    private String postalCode;
    private String state;
}
