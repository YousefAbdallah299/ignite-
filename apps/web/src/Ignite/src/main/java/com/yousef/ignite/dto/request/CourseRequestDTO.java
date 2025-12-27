package com.yousef.ignite.dto.request;

import com.yousef.ignite.dto.enums.SkillLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseRequestDTO {
    private String title;
    private String description;
    private List<CourseSectionRequestDTO> sections;
    private List<String> categories;
    private SkillLevel skillLevel;
    private String imageUrl;

}
