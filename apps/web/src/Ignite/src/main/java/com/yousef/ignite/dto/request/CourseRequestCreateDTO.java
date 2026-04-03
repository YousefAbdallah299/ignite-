package com.yousef.ignite.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseRequestCreateDTO {
    @NotBlank(message = "Course title is required")
    private String title;
    
    @NotBlank(message = "Course description is required")
    private String description;
}




