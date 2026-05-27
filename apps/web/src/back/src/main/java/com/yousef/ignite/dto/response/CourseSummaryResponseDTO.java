package com.yousef.ignite.dto.response;


import com.yousef.ignite.dto.enums.SkillLevel;
import com.yousef.ignite.entity.Category;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseSummaryResponseDTO {
    private Long id;
    private String title;
    private String description;
    private Set<Category> categories;
    private SkillLevel skillLevel;
    private String imageUrl;

}
