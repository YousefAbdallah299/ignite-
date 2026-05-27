package com.yousef.ignite.dto.response;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class JobResponseDTO {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime createdAt;
    private String location;
    private Set<String> categories;
    private String salary;
    private String employmentType;
    private String currency;
    private Integer applicationCount;

}
