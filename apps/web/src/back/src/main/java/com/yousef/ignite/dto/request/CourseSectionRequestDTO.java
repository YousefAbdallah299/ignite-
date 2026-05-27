package com.yousef.ignite.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseSectionRequestDTO {
    private String title;
    private String content;
    private String videoUrl;
    private List<CourseLessonRequestDTO> lessons;
}
