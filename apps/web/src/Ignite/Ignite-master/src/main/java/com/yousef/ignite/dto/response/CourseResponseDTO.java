package com.yousef.ignite.dto.response;

import com.yousef.ignite.dto.enums.SkillLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseResponseDTO {
    private Long id;
    private String title;
    private String description;
    private List<CourseSectionResponseDTO> sections;
    private List<String> categories;
    private SkillLevel skillLevel;
    private String imageUrl;

}
